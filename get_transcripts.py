"""
Fetch transcripts for all videos in the Posit Data Science Hangout playlist.
Saves one .txt file per video in ./transcripts/
"""

import json
import os
import re
import time
import urllib.request
from pathlib import Path
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled

PLAYLIST_URL = "https://www.youtube.com/playlist?list=PL9HYL-VRX0oTu3bUoyYknD-vpR7Uq6bsR"
OUT_DIR = Path("transcripts")


def get_playlist_video_ids(playlist_url):
    """Fetch all video IDs from a playlist, following continuation tokens."""
    headers = {"User-Agent": "Mozilla/5.0"}
    seen = set()
    unique = []

    def add_ids(ids):
        for vid in ids:
            if vid not in seen:
                seen.add(vid)
                unique.append(vid)

    # initial page: videoId pattern in ytInitialData JSON
    req = urllib.request.Request(playlist_url, headers=headers)
    html = urllib.request.urlopen(req).read().decode("utf-8")
    add_ids(re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html))
    print(f"  initial page: {len(unique)} IDs")

    api_key_m = re.search(r'"INNERTUBE_API_KEY":"([^"]+)"', html)
    client_version_m = re.search(r'"INNERTUBE_CLIENT_VERSION":"([^"]+)"', html)
    if not api_key_m:
        return unique

    api_key = api_key_m.group(1)
    client_version = client_version_m.group(1) if client_version_m else "2.0"
    api_url = f"https://www.youtube.com/youtubei/v1/browse?key={api_key}"

    continuation_m = re.search(r'"continuationCommand":\{"token":"([^"]+)"', html)
    page = 1
    while continuation_m:
        token = continuation_m.group(1)
        page += 1
        payload = json.dumps({
            "context": {"client": {"clientName": "WEB", "clientVersion": client_version}},
            "continuation": token,
        }).encode()
        req2 = urllib.request.Request(
            api_url, data=payload,
            headers={**headers, "Content-Type": "application/json"},
        )
        try:
            resp = urllib.request.urlopen(req2).read().decode("utf-8")
        except Exception as e:
            print(f"  continuation page {page} failed: {e}")
            break
        # continuation pages embed IDs in watch?v= links
        add_ids(re.findall(r'watch\?v=([a-zA-Z0-9_-]{11})', resp))
        continuation_m = re.search(r'"continuationCommand":\{"token":"([^"]+)"', resp)
        print(f"  continuation page {page}: {len(unique)} unique IDs so far")
        time.sleep(1)

    return unique


def get_video_metadata(video_id):
    """Return (title, publish_date_iso) for a video, scraping the watch page."""
    from datetime import datetime
    url = f"https://www.youtube.com/watch?v={video_id}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        html = urllib.request.urlopen(req).read().decode("utf-8")
        title_m = re.search(r'"title":"([^"]+)"', html)
        raw_title = title_m.group(1) if title_m else video_id
        # decode JSON unicode escapes e.g. & → &
        try:
            title = raw_title.encode("utf-8").decode("unicode-escape").encode("latin-1").decode("utf-8")
        except Exception:
            title = raw_title
        # try ISO format first, then human-readable "Nov 4, 2025"
        date_m = re.search(r'"publishDate":"(\d{4}-\d{2}-\d{2})"', html)
        if date_m:
            date = date_m.group(1)
        else:
            date_m = re.search(r'"dateText":\{"simpleText":"([^"]+)"', html)
            if date_m:
                try:
                    date = datetime.strptime(date_m.group(1), "%b %d, %Y").strftime("%Y-%m-%d")
                except ValueError:
                    date = None
            else:
                date = None
        return title, date
    except Exception:
        return video_id, None


def safe_filename(title):
    return re.sub(r'[^\w\s-]', '', title).strip().replace(' ', '_')[:80]


def _make_api():
    """Build a YouTubeTranscriptApi, routing through the IPRoyal proxy if set."""
    proxy_url = os.environ.get("RESIDENTIAL_PROXY")
    if proxy_url:
        from youtube_transcript_api.proxies import GenericProxyConfig
        return YouTubeTranscriptApi(proxy_config=GenericProxyConfig(https_url=proxy_url))
    return YouTubeTranscriptApi()


def fetch_transcript(video_id, retries=4):
    """Returns (text, chunks) where chunks is [{text, start, duration}]."""
    for attempt in range(retries):
        try:
            api = _make_api()
            transcript = api.fetch(video_id)
            chunks = [{"text": c.text, "start": c.start, "duration": c.duration} for c in transcript]
            text = " ".join(c["text"] for c in chunks)
            return text, chunks
        except Exception as e:
            if "blocked" in str(e).lower() and attempt < retries - 1:
                wait = 30 * (2 ** attempt)
                print(f"  rate limited (attempt {attempt+1}), waiting {wait}s...")
                time.sleep(wait)
            else:
                raise


def main():
    OUT_DIR.mkdir(exist_ok=True)
    print(f"Fetching playlist video IDs...")
    video_ids = get_playlist_video_ids(PLAYLIST_URL)
    print(f"Found {len(video_ids)} videos\n")

    # load any previously saved results so we can skip already-fetched videos
    index_path = OUT_DIR / "_index.json"
    if index_path.exists():
        results = json.loads(index_path.read_text())
        done_ids = {r["id"] for r in results if r["status"] == "ok"}
        print(f"Resuming: {len(done_ids)} already fetched")
    else:
        results = []
        done_ids = set()

    for i, vid in enumerate(video_ids, 1):
        if vid in done_ids:
            print(f"[{i}/{len(video_ids)}] skipping {vid} (already done)")
            continue
        title, pub_date = get_video_metadata(vid)
        print(f"[{i}/{len(video_ids)}] {title} ({vid})  date={pub_date}")
        try:
            text, chunks = fetch_transcript(vid)
            fname = OUT_DIR / f"{safe_filename(title)}_{vid}.txt"
            fname.write_text(f"{title}\nhttps://www.youtube.com/watch?v={vid}\n\n{text}\n")
            # save chunk timing so pipeline can find quote timestamps
            chunks_fname = OUT_DIR / f"{safe_filename(title)}_{vid}.chunks.json"
            chunks_fname.write_text(json.dumps(chunks))
            print(f"  -> saved ({len(text):,} chars)")
            results.append({"id": vid, "title": title, "date": pub_date, "status": "ok", "file": str(fname)})
            done_ids.add(vid)
        except (NoTranscriptFound, TranscriptsDisabled) as e:
            print(f"  -> no transcript: {e}")
            results.append({"id": vid, "title": title, "status": "no_transcript"})
        except Exception as e:
            if "blocked" in str(e).lower():
                # proxy should rotate IPs; wait and continue rather than stop
                print(f"  -> blocked, waiting 60s before continuing...")
                time.sleep(60)
                results.append({"id": vid, "title": title, "status": "error: blocked"})
                continue
            print(f"  -> error: {e}")
            results.append({"id": vid, "title": title, "status": f"error: {e}"})
        # write after every video so progress survives crashes
        index_path.write_text(json.dumps(results, indent=2))
        # polite delay — residential proxy rotates IPs so 15s is enough
        time.sleep(15)
    ok = sum(1 for r in results if r["status"] == "ok")
    print(f"\nDone: {ok}/{len(video_ids)} transcripts saved to ./{OUT_DIR}/")


if __name__ == "__main__":
    main()
