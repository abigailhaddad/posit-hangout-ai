"""
Fetch transcripts for the 15 IP-blocked 2021 episodes using yt-dlp.
Updates transcripts/_index.json in place.
"""

import json
import re
import subprocess
import tempfile
from pathlib import Path

OUT_DIR = Path("transcripts")
INDEX = OUT_DIR / "_index.json"

BLOCKED_IDS = [
    "IkqItgPSPro", "pNTENrov020", "YTNYjS_PeFs", "KBs4b3Q2n8Y",
    "sWG7nIrLoHM", "3BrmOHgP_XI", "aIDg-9Ox5vo", "CcPE29bYGVo",
    "QVD7JXwtjmg", "yaFGSme7lxk", "l3825QyCpbE", "A3JNPvjjHKk",
    "ROcH6YKzICw", "qPMJiXg7XME", "SyFcCTcERqo",
]


def parse_vtt(vtt_path):
    """Extract plain text from a VTT file, deduplicating rolling captions."""
    text = Path(vtt_path).read_text(encoding="utf-8", errors="ignore")
    lines = text.splitlines()
    seen, words = set(), []
    for line in lines:
        line = line.strip()
        if not line or line.startswith("WEBVTT") or "-->" in line or re.match(r"^\d+$", line):
            continue
        # strip VTT tags
        clean = re.sub(r"<[^>]+>", "", line).strip()
        if clean and clean not in seen:
            seen.add(clean)
            words.append(clean)
    return " ".join(words)


def safe_filename(title):
    return re.sub(r"[^\w\s-]", "", title).strip().replace(" ", "_")[:80]


def fetch_with_ytdlp(video_id):
    with tempfile.TemporaryDirectory() as tmp:
        result = subprocess.run(
            ["yt-dlp", "--write-auto-sub", "--skip-download", "--sub-lang", "en",
             "--convert-subs", "vtt", "-o", f"{tmp}/%(id)s",
             f"https://www.youtube.com/watch?v={video_id}"],
            capture_output=True, text=True, timeout=60
        )
        vtt_files = list(Path(tmp).glob("*.vtt"))
        if not vtt_files:
            raise RuntimeError(f"No VTT: {result.stderr[-300:]}")
        return parse_vtt(vtt_files[0])


def main():
    index = json.loads(INDEX.read_text())
    index_by_id = {e["id"]: e for e in index}

    for vid in BLOCKED_IDS:
        entry = index_by_id.get(vid)
        if not entry:
            print(f"SKIP {vid} — not in index")
            continue
        title = entry.get("title", vid)
        print(f"Fetching {vid} — {title[:55]}...")
        try:
            text = fetch_with_ytdlp(vid)
            fname = OUT_DIR / f"{safe_filename(title)}_{vid}.txt"
            fname.write_text(f"{title}\nhttps://www.youtube.com/watch?v={vid}\n\n{text}\n")
            # Update all entries with this id
            for e in index:
                if e["id"] == vid:
                    e["status"] = "ok"
                    e["file"] = str(fname)
            print(f"  OK — {len(text)} chars → {fname.name}")
        except Exception as ex:
            print(f"  FAILED: {ex}")

    INDEX.write_text(json.dumps(index, indent=2))
    print("\nDone. Index updated.")


if __name__ == "__main__":
    main()
