// Timeline data for the story page. Kept as a pure (no-JSX) module so it can be
// unit-tested directly without pulling in the client component + charting deps.
//
// Invariant (enforced by tests/unit/story-data.test.ts): any event that cites a
// `video_id` MUST also carry a `start_time`. The timeline player only renders
// when both are present, so a video_id without a start_time is a quote that
// silently shows no video.

export interface TimelineEvent {
  date: string;
  label: string;
  fullQuote: string;
  context?: string;
  video_id?: string;
  start_time?: number;
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    date: "Sep 2022",
    label: "GPT-3 comes up",
    fullQuote: "Are you or your team exploring using in any way the newer large language models like GPT-3 that are coming out? You do NLP work — there's some awesome advances which pairs really well with the idea of revisiting projects that weren't possible before.",
    context: "Months before ChatGPT launched",
    video_id: "1A84E_GftnM",
    start_time: 1579.12,
  },
  {
    date: "Jan 2023",
    label: "JJ Allaire names ChatGPT and GitHub Copilot",
    fullQuote: "Something like ChatGPT is not really like — the creators of it don't have full control of it. You can see that in the safeguards that they attempted to put in, but then you can circumvent the safeguards.",
    context: "JJ Allaire, Posit PBC",
    video_id: "mqOva6Y0xFo",
    start_time: 500.81,
  },
  {
    date: "Oct 2023",
    label: "First mention of hallucination",
    fullQuote: "I'm not sure that ChatGPT is doing a very good job. I saw some hallucinations. So double check with the internet as well.",
    context: "Jean-Vincent Le Bé @ Nestlé",
    video_id: "k5z09QIMrVY",
    start_time: 2500,
  },
  {
    date: "Sep 2024",
    label: "Claude first mentioned",
    fullQuote: "The possibility of using a Claude or ChatGPT — a lot of people say Claude is really good at writing and writing style, so that's another possibility.",
    context: "Sharon Machlis",
    video_id: "BYtP0SxGAoA",
    start_time: 1896.8,
  },
  {
    date: "Apr 2025",
    label: "Vibe coding comes up",
    fullQuote: "Vibe coding is like — these LLM-enabled code generation tools are becoming more powerful. There's things like Cursor, which is like an IDE used to help generate code. For exploration I think it's a reasonable thing to do if you want to see what these tools are capable of. But putting it in front of external-facing people, I would be extremely careful.",
    context: "Jay Timmerman",
    video_id: "WrRDSmX8Fm4",
    start_time: 504.375,
  },
  {
    date: "Aug 2025",
    label: "Claude Code first mentioned",
    fullQuote: "The ability now to chat with Copilot or let Claude Code fly on something has helped immensely — feeling like I can make a little more progress quickly, or see something that works. And even though it might not be the way I want to do it, it proved to me it's possible.",
    context: "Jenny Bryan, Posit",
    video_id: "1c2k6qQ122Y",
    start_time: 629.9,
  },
  {
    date: "Jun 2026",
    label: "First mention of AI slop",
    fullQuote: "There's a lot of AI slop happening, and it's changing. I feel like even though we don't agree sometimes, we have to follow. Otherwise, we don't get a position if we are not using those tools.",
    context: "Job Market Realities panel",
    video_id: "FU829X_WdYE",
    start_time: 1146.775,
  },
];
