"""
Data integrity tests for analysis/regex_mentions.json.
Run with: pytest tests/test_data.py -v
"""
import json
from pathlib import Path

import pytest

DATA_FILE = Path(__file__).parent.parent / "analysis" / "regex_mentions.json"
EXPECTED_FIELDS = {"video_id", "title", "date", "guest", "quote", "start_time",
                   "context_before", "context_after", "tools_mentioned", "keyword_tags"}
VALID_TOOLS = {"ChatGPT", "Claude", "Claude Code", "GitHub Copilot", "Gemini", "Cursor"}
VALID_TAGS = {"hallucination", "vibe coding", "agents", "jobs/careers",
              "trust", "hype", "productivity", "learning"}


@pytest.fixture(scope="module")
def mentions():
    return json.loads(DATA_FILE.read_text())


def test_file_exists():
    assert DATA_FILE.exists(), "regex_mentions.json not found"


def test_minimum_record_count(mentions):
    assert len(mentions) >= 1000, f"Expected ≥1000 records, got {len(mentions)}"


def test_all_required_fields_present(mentions):
    for i, m in enumerate(mentions):
        missing = EXPECTED_FIELDS - m.keys()
        assert not missing, f"Record {i} missing fields: {missing}"


def test_no_null_video_ids(mentions):
    nulls = [m for m in mentions if not m.get("video_id")]
    assert not nulls, f"{len(nulls)} records have null video_id"


def test_no_empty_quotes(mentions):
    empty = [m for m in mentions if not m.get("quote", "").strip()]
    assert not empty, f"{len(empty)} records have empty quotes"


def test_timestamp_coverage(mentions):
    with_time = sum(1 for m in mentions if m.get("start_time") is not None)
    pct = with_time / len(mentions) * 100
    assert pct >= 99, f"Only {pct:.1f}% of records have timestamps (expected ≥99%)"


def test_date_range(mentions):
    dates = [m["date"] for m in mentions if m.get("date")]
    years = {d[:4] for d in dates}
    assert "2022" in years, "No records from 2022"
    assert "2026" in years or "2025" in years, "No recent records found"


def test_tools_are_valid(mentions):
    for m in mentions:
        for tool in m.get("tools_mentioned", []):
            assert tool in VALID_TOOLS, f"Unexpected tool: {tool!r}"


def test_keyword_tags_are_valid(mentions):
    for m in mentions:
        for tag in m.get("keyword_tags", []):
            assert tag in VALID_TAGS, f"Unexpected tag: {tag!r}"


def test_known_quote_present(mentions):
    quotes = [m["quote"] for m in mentions]
    assert any("hallucin" in q.lower() for q in quotes), "No hallucination quotes found"
    assert any("chatgpt" in q.lower() for q in quotes), "No ChatGPT quotes found"
    assert any("claude" in q.lower() for q in quotes), "No Claude quotes found"


def test_episode_spread(mentions):
    video_ids = {m["video_id"] for m in mentions}
    assert len(video_ids) >= 100, f"Only {len(video_ids)} unique episodes (expected ≥100)"
