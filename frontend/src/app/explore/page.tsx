import { readFileSync } from "fs";
import { join } from "path";
import ExplorePage from "@/components/ExplorePage";
import type { Mention } from "@/lib/types";

function loadMentions(): Mention[] {
  try {
    const p = join(process.cwd(), "public", "data", "regex_mentions.json");
    return JSON.parse(readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

export default function Explore() {
  const mentions = loadMentions();
  return <ExplorePage mentions={mentions} />;
}
