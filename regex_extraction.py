"""
regex_extraction.py — find genuine AI mentions via regex, no LLM

Searches every transcript for sentences containing AI tool names or
core AI concepts. Outputs analysis/regex_mentions.json.

Usage:
    python3 regex_extraction.py           # full run
    python3 regex_extraction.py --audit   # print 40 random results for review
"""

import argparse
import json
import random
import re
from pathlib import Path


def parse_guest(title: str) -> str:
    parts = [p.strip() for p in title.split("|")]
    return parts[-2] if len(parts) >= 3 else parts[0]


def load_transcript(file_path: str) -> tuple[str, str]:
    text = Path(file_path).read_text()
    lines = text.split("\n")
    raw_title = lines[0].strip()
    title = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), raw_title)
    body = "\n".join(lines[3:]).strip()
    return title, body


def load_chunks(file_path: str) -> list[dict] | None:
    alt = Path(str(file_path).replace(".txt", ".chunks.json"))
    chunks_path = Path(file_path).with_suffix("").with_suffix(".chunks.json")
    for p in (chunks_path, alt):
        if p.exists():
            return json.loads(p.read_text())
    return None

# ── Core AI signal patterns ────────────────────────────────────────────────────
# A sentence must match at least one of these to be included.
AI_PATTERNS = [
    # Tool names — very high signal
    re.compile(r"\b(ChatGPT|GPT-?[34]\b|DALL-?E|Gemini|Bard)\b", re.I),
    re.compile(r"\b(Claude|Anthropic)\b", re.I),
    re.compile(r"\b(GitHub\s+Copilot|Copilot)\b", re.I),
    re.compile(r"\b(Claude\s+Code|cursor\s+AI|Cursor|Windsurf|Devin)\b", re.I),
    re.compile(r"\b(Midjourney|Stable\s+Diffusion|DALL.E)\b", re.I),
    re.compile(r"\bShiny\s+Assist\b", re.I),  # Posit AI feature

    # Unambiguous AI terms
    re.compile(r"\b(large\s+language\s+model|LLM)s?\b", re.I),
    re.compile(r"\bartificial\s+intelligence\b", re.I),
    re.compile(r"\bgenerative\s+AI\b", re.I),
    re.compile(r"\bvibe.?cod(e|ing)\b", re.I),
    re.compile(r"\bhallucina(te|tion|ted|ting)\b", re.I),
    re.compile(r"\bprompt\s+engineer(ing)?\b", re.I),
    re.compile(r"\bfoundation\s+model\b", re.I),
    re.compile(r"\bAI\s+(tool|model|assistant|agent|slop|grift|hype|governance|safety|ethics|team|thing|thing|workflow|application|project|risk|bias|technology|system|systems|part|product|job|work)\b", re.I),
    re.compile(r"\b(ethical|responsible|trustworthy)\s+AI\b", re.I),
    re.compile(r"\b(AI|artificial\s+intelligence)\s+is\b", re.I),
    re.compile(r"\b(about|with|of|for|need|use|build|all|from|into|do|no)\s+(AI|LLMs?)\b", re.I),
    re.compile(r"\b(AI|LLM|LLMs)[.!?,;]", re.I),  # AI/LLM at end of clause
    re.compile(r"\busing\s+(AI|LLMs?)\b", re.I),
    re.compile(r"\b(AI|LLM)\s+(to|for|can|will|won't|doesn't|does|isn't|has)\b", re.I),
    re.compile(r"\bco[\s-]?pilot\b", re.I),  # "co pilot" two-word form
]

# Sentences that match only these are ambiguous — require a second AI pattern
# or explicit tool name to be included.
AMBIGUOUS_PATTERNS = [
    re.compile(r"\bmachine\s+learning\b", re.I),
    re.compile(r"\bdeep\s+learning\b", re.I),
    re.compile(r"\bneural\s+network\b", re.I),
    re.compile(r"\b(transformer|embedding)s?\b", re.I),
]

# Hard exclusions — these phrases in the sentence disqualify it even if matched
EXCLUSIONS = re.compile(
    r"\b(R\s+package|caret\s+package|tidymodel|scikit|sklearn|xgboost|"
    r"linear\s+regression|logistic\s+regression|random\s+forest|"
    r"gradient\s+boost|naive\s+bayes|k-means|clustering|"
    r"tableau|Power\s+BI|Excel)\b",
    re.I,
)

KEYWORD_TAGS_RE = [
    ("hallucination", re.compile(r"\bhallucin", re.I)),
    ("vibe coding",   re.compile(r"\bvibe.?cod", re.I)),
    ("agents",        re.compile(r"\bagent(s|ic)?\b", re.I)),
    ("jobs/careers",  re.compile(r"\b(job|career|hiring|replac|displac|laid.?off)", re.I)),
    ("trust",         re.compile(r"\b(trust|reliable|reliabilit|verif|accurate|accuracy)", re.I)),
    ("hype",          re.compile(r"\b(hype|overhype|buzzword|bubble)\b", re.I)),
    ("productivity",  re.compile(r"\b(productiv|faster|efficien|automat|time.?sav)", re.I)),
    ("learning",      re.compile(r"\b(learn|skill|train|educat|understand)", re.I)),
]


def is_ai_sentence(sentence: str) -> bool:
    if EXCLUSIONS.search(sentence):
        return False
    if any(p.search(sentence) for p in AI_PATTERNS):
        return True
    ambiguous_hits = sum(1 for p in AMBIGUOUS_PATTERNS if p.search(sentence))
    return ambiguous_hits >= 2


def split_sentences(text: str) -> list[str]:
    """Split on sentence boundaries, keeping reasonable length."""
    raw = re.split(r"(?<=[.!?])\s+", text)
    sentences = []
    buf = ""
    for s in raw:
        if not s.strip():
            continue
        buf = (buf + " " + s).strip() if buf else s
        # Flush if we have a full sentence (ends with punctuation) and it's not too short
        if re.search(r"[.!?]$", buf) and len(buf) > 30:
            sentences.append(buf)
            buf = ""
    if buf:
        sentences.append(buf)
    return sentences


_AI_KEYWORDS = {
    "chatgpt", "copilot", "claude", "gemini", "llm", "llms", "ai", "gpt",
    "cursor", "windsurf", "devin", "hallucination", "hallucinations",
    "generative", "vibe", "coding", "anthropic", "mcp",
}


def _normalize(text: str) -> str:
    """Strip all non-alphanumeric chars and collapse whitespace for VTT matching."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9 ]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _windows(chunks: list[dict], size: int = 5) -> list[tuple[float, str]]:
    """Precompute normalized rolling windows; returns [(start_time, norm_text)]."""
    result = []
    for i, c in enumerate(chunks):
        window = " ".join(
            chunks[j]["text"].replace("\n", " ")
            for j in range(i, min(i + size, len(chunks)))
        )
        result.append((c["start"], _normalize(window)))
    return result


def find_chunk_time(sentence: str, chunks: list[dict]) -> float | None:
    if not chunks:
        return None

    windows = _windows(chunks)
    # Normalize and also collapse "chat gpt" → "chatgpt" (VTT splits it)
    norm_sentence = _normalize(sentence)
    words = norm_sentence.split()
    if len(words) < 2:
        return None

    def search(win_list: list[tuple[float, str]], needle: str) -> float | None:
        if len(needle) < 6:
            return None
        for ts, win in win_list:
            if needle in win:
                return ts
        return None

    # Build window list with "chat gpt" collapsed for ChatGPT matching
    windows_merged = [(ts, w.replace("chat gpt", "chatgpt")) for ts, w in windows]

    # Strategy 1: try n-grams from many positions in the sentence.
    # The VTT may diverge early, so scanning interior trigrams finds the
    # right chunk even when the prefix is garbled.
    for win_list in (windows_merged, windows):
        for start_pos in range(0, min(len(words) - 2, 12)):
            for n in (5, 4, 3):
                end_pos = start_pos + n
                if end_pos > len(words):
                    continue
                candidate = " ".join(words[start_pos:end_pos])
                ts = search(win_list, candidate)
                if ts is not None:
                    return ts

    # Strategy 2: AI keyword + neighbour word pair (handles cases where
    # the VTT garbles surrounding words but keeps the keyword).
    for i, w in enumerate(words):
        if w in _AI_KEYWORDS:
            pairs = []
            if i > 0:
                pairs.append(words[i - 1] + " " + w)
            if i < len(words) - 1:
                pairs.append(w + " " + words[i + 1])
            for candidate in pairs:
                for win_list in (windows_merged, windows):
                    ts = search(win_list, candidate)
                    if ts is not None:
                        return ts

    return None


def tag(sentence: str) -> list[str]:
    return [label for label, pat in KEYWORD_TAGS_RE if pat.search(sentence)]


def extract_tools(sentence: str) -> list[str]:
    tools = []
    tool_patterns = [
        ("ChatGPT", re.compile(r"\bChatGPT\b", re.I)),
        ("Claude", re.compile(r"\bClaude\b(?!\s+Code)", re.I)),
        ("Claude Code", re.compile(r"\bClaude\s+Code\b", re.I)),
        ("GitHub Copilot", re.compile(r"\b(GitHub\s+Copilot|Copilot)\b", re.I)),
        ("Gemini", re.compile(r"\bGemini\b", re.I)),
        ("Cursor", re.compile(r"\bCursor\b", re.I)),
    ]
    for name, pat in tool_patterns:
        if pat.search(sentence):
            tools.append(name)
    return tools


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit", action="store_true", help="Print random sample for review")
    parser.add_argument("--n", type=int, default=40, help="Sample size for audit")
    args = parser.parse_args()

    transcript_dir = Path("transcripts")
    index = [v for v in json.loads((transcript_dir / "_index.json").read_text())
             if v and v.get("id") and v.get("status") == "ok" and v.get("date")]
    index.sort(key=lambda v: v["date"])

    results = []
    for v in index:
        fpath = transcript_dir / Path(v["file"]).name
        if not fpath.exists():
            continue
        title, body = load_transcript(str(fpath))
        chunks = load_chunks(str(fpath))
        guest = parse_guest(title)
        date = v["date"][:10]

        sentences = split_sentences(body)
        for idx, sent in enumerate(sentences):
            sent = sent.strip()
            if len(sent) < 40 or len(sent) > 600:
                continue
            if not is_ai_sentence(sent):
                continue
            t = find_chunk_time(sent, chunks) if chunks else None
            before = sentences[idx - 1].strip() if idx > 0 else None
            after = sentences[idx + 1].strip() if idx < len(sentences) - 1 else None
            results.append({
                "video_id": v["id"],
                "title": title,
                "date": date,
                "guest": guest,
                "quote": sent,
                "context_before": before,
                "context_after": after,
                "start_time": t,
                "end_time": None,
                "tools_mentioned": extract_tools(sent),
                "keyword_tags": tag(sent),
                "is_guest_speaking": True,
                "quality": 2,
            })

    print(f"Found {len(results)} AI sentences across {len(index)} episodes")

    if args.audit:
        random.seed(0)
        sample = random.sample(results, min(args.n, len(results)))
        for i, m in enumerate(sample, 1):
            print(f"\n[{i}] {m['date']}  {m['guest'][:40]}")
            print(f"     {m['quote']}")
        return

    out = Path("analysis/regex_mentions.json")
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(results, indent=2, ensure_ascii=False))
    print(f"→ {out}")


if __name__ == "__main__":
    main()
