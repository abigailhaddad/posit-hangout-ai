"""
Download auto-subtitle VTT files for story-featured videos via yt-dlp,
convert to chunks format, and save as .chunks.json next to .txt transcript.
Run with: python3 fetch_story_chunks.py
"""
import json, re, subprocess, time, tempfile
from pathlib import Path

STORY_IDS = [
    '1A84E_GftnM', '-mm5tHQVPY8',
    'mqOva6Y0xFo', 'hjufaKBU6Ec', 'iSN0XmhnGpI',
    'M3yvp-bkdro', 'hy6wN8V3qa4', 'BoPAxUoBFQM',
    'LSGgGzc3lPw', '7Zrx1N2VgfM', 'POqaMW-uiNU',
    'qUQ3MIDNyQc', 'WrRDSmX8Fm4', 'fb7uwDIi2gU',
    'BK2mJB3TPVY', 'a8lF2YybtVQ', 'FU829X_WdYE',
    'r0N87By95rI', 'lc6ad15gjeo', 'Pnztr_TOD-4',
    'k5z09QIMrVY',  # timeline: first hallucination mention (Jean-Vincent Le Bé)
    '9FussTE0MKw',  # timeline: Claude first mentioned (Jamie Warner)
]

TRANS_DIR = Path('transcripts')
index = {v['id']: v for v in json.load(open(TRANS_DIR / '_index.json')) if v and v.get('id')}


def vtt_time_to_seconds(t: str) -> float:
    parts = t.strip().split(':')
    if len(parts) == 3:
        h, m, s = parts
    else:
        h, m, s = '0', parts[0], parts[1]
    return int(h)*3600 + int(m)*60 + float(s.replace(',', '.'))


def parse_vtt(vtt_text: str) -> list[dict]:
    """Convert VTT content to [{text, start, duration}] chunks."""
    chunks = []
    blocks = re.split(r'\n\n+', vtt_text.strip())
    for block in blocks:
        lines = [l.strip() for l in block.strip().splitlines() if l.strip()]
        # find the timestamp line
        ts_line = next((l for l in lines if '-->' in l), None)
        if not ts_line:
            continue
        try:
            start_str, end_str = re.split(r'\s*-->\s*', ts_line)[:2]
            # strip optional position cues after the time
            start_str = start_str.split()[0]
            end_str = end_str.split()[0]
            start = vtt_time_to_seconds(start_str)
            end = vtt_time_to_seconds(end_str)
        except Exception:
            continue
        text_lines = [l for l in lines if '-->' not in l and not re.match(r'^\d+$', l) and 'WEBVTT' not in l]
        # strip VTT tags like <00:01:23.456><c>text</c>
        text = ' '.join(re.sub(r'<[^>]+>', '', l) for l in text_lines).strip()
        if text:
            chunks.append({'text': text, 'start': start, 'duration': max(0.1, end - start)})
    return chunks


def download_vtt(video_id: str, out_dir: Path) -> Path | None:
    url = f'https://www.youtube.com/watch?v={video_id}'
    result = subprocess.run(
        ['yt-dlp', '--write-auto-subs', '--sub-format', 'vtt',
         '--skip-download', '--sub-langs', 'en',
         '-o', str(out_dir / '%(id)s.%(ext)s'), url],
        capture_output=True, text=True, timeout=60
    )
    vtt = out_dir / f'{video_id}.en.vtt'
    if vtt.exists():
        return vtt
    print(f'  yt-dlp stderr: {result.stderr[-200:]}')
    return None


def main():
    done = 0
    for i, vid in enumerate(STORY_IDS, 1):
        v = index.get(vid, {})
        fname = v.get('file', '')
        if not fname:
            print(f'[{i}] {vid}: not in index')
            continue
        fpath = Path(fname)
        chunks_path = fpath.with_suffix('').with_suffix('.chunks.json')
        if chunks_path.exists():
            print(f'[{i}] {vid}: chunks already exist, skipping')
            done += 1
            continue

        print(f'[{i}/{len(STORY_IDS)}] {vid}: downloading subtitles...', flush=True)
        with tempfile.TemporaryDirectory() as tmp:
            tmp_dir = Path(tmp)
            for attempt in range(3):
                vtt_path = download_vtt(vid, tmp_dir)
                if vtt_path:
                    break
                if attempt < 2:
                    wait = 60 * (attempt + 1)
                    print(f'  rate limited, waiting {wait}s...')
                    time.sleep(wait)
            else:
                print(f'  failed after 3 attempts')
                continue

            vtt_text = vtt_path.read_text(encoding='utf-8', errors='replace')
            chunks = parse_vtt(vtt_text)
            if not chunks:
                print(f'  no chunks parsed from VTT')
                continue

            chunks_path.write_text(json.dumps(chunks))
            print(f'  saved {len(chunks)} chunks → {chunks_path.name}')
            done += 1

        time.sleep(15)  # be gentle between requests

    print(f'\nDone: {done}/{len(STORY_IDS)} videos have chunks')

if __name__ == '__main__':
    main()
