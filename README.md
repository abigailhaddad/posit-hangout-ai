# Posit Data Science Hangout — AI Mentions

An unofficial fan project exploring how AI came up in four years of the [Posit Data Science Hangout](https://www.youtube.com/playlist?list=PL9HYL-VRX0oTu3bUoyYknD-vpR7Uq6bsR), a weekly live show where data science practitioners talk shop.

Not affiliated with or endorsed by Posit PBC.

## How it works

### Transcripts
Auto-generated YouTube captions are fetched for all ~225 episodes via `youtube_transcript_api`. These are plain text with no speaker labels — accuracy varies, especially for names and jargon.

### Regex extraction
`regex_extraction.py` searches every transcript for sentences containing explicit AI keywords: tool names (ChatGPT, Copilot, Claude, Gemini, Cursor), concepts (LLM, generative AI, hallucination, vibe coding, prompt engineering), and phrases like "about AI", "using AI", "AI governance". Sentences matching only ambiguous terms like "machine learning" or "neural network" are excluded unless a second AI signal is also present.

This is intentionally narrow. A 2022 episode full of machine learning discussion will show zero matches if nobody said "ChatGPT" or "LLM" — that's by design, not a bug. The explore page shows the raw matched sentences; accuracy depends entirely on transcript quality.

### Hand curation (story page only)
The story page (`/`) is editorially curated. The 9 chapters, 26 featured quotes, chapter headlines, narratives, and highlighted phrases were all chosen by hand to tell a specific arc about how the conversation shifted from 2022 to 2026. The displayed quote text is often a cleaned or extended version of the raw transcript sentence — stutters removed, context added — but every quote links back to the original video.

No LLMs were used to select, rank, or generate any of the content. An earlier LLM-based extraction approach was prototyped and abandoned in favor of the simpler regex pipeline.

## Quick start

### 1. Python setup

```bash
pip install youtube_transcript_api
```

### 2. Fetch transcripts

```bash
python3 get_transcripts.py
```

Downloads transcripts for all playlist episodes into `transcripts/`. Skips already-fetched episodes on re-runs.

### 3. Generate the data file

```bash
python3 regex_extraction.py
```

Outputs `analysis/regex_mentions.json` (~1,000 sentences across ~220 episodes). Run with `--audit` to review a random sample before writing.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

Reads `analysis/regex_mentions.json` at request time — no rebuild needed after updating the data.

## Timestamps

"Watch at …" links require word-level timing data (`.chunks.json` files). These need `yt-dlp`:

```bash
pip install yt-dlp
python3 fetch_story_chunks.py   # downloads chunks for the ~20 story-featured episodes
```

## Repo map

```
get_transcripts.py      fetch all episode transcripts from YouTube
regex_extraction.py     keyword search → analysis/regex_mentions.json
fetch_story_chunks.py   download word-level timestamps for story episodes
transcripts/            one .txt per episode + _index.json manifest
analysis/               regex_mentions.json (the data file the frontend reads)
frontend/               Next.js app — story page (/) and explore page (/explore)
```
