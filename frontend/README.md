# Frontend

Next.js app for the Posit Data Science Hangout AI Mentions project. See the [top-level README](../README.md) for setup.

## Pages

- `/` — narrative story page, chapters organized by year
- `/explore` — searchable/filterable grid of all matched sentences

## Data

Reads `../analysis/regex_mentions.json` at request time. Re-run `python3 regex_extraction.py` from the repo root to refresh the data; no frontend rebuild needed.

## Dev

```bash
npm install
npm run dev   # http://localhost:3000
npm run build # production build
```
