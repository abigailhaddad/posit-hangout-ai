import { readFileSync } from "fs";
import { join } from "path";
import ExplorePage from "@/components/ExplorePage";
import type { Mention } from "@/lib/types";

export const dynamic = "force-dynamic";

function loadMentions(): Mention[] {
  try {
    const p = join(process.cwd(), "..", "analysis", "regex_mentions.json");
    return JSON.parse(readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

export default function Explore() {
  const mentions = loadMentions();
  return <ExplorePage mentions={mentions} />;
}
