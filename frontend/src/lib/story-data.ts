import type { Mention } from "./types";

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


// ── Story chapter definitions ────────────────────────────────────────────────

export interface QuoteRef {
  video_id: string;
  quote_prefix: string;
  highlight?: string;
  extendedQuote?: string;
}

export interface Chapter {
  id: string;
  year: string;
  headline: string;
  subhead: string;
  narrative: string;
  stat?: string;
  quotes: QuoteRef[];
  chart?: "coverage" | "tools";
}

export const CHAPTERS: Chapter[] = [
  {
    id: "watching",
    year: "2022",
    headline: "In 2022, AI meant machine learning",
    subhead: "Before ChatGPT, 'LLM' and 'generative AI' were nearly absent from the conversation",
    narrative:
      "In 2022, generative AI barely came up. ChatGPT launched in December.",
    stat: "Only 1 episode in 2022 used AI keywords",
    quotes: [
      { video_id: "-mm5tHQVPY8", quote_prefix: "For people that have new-- every", highlight: "But there should be some sort of detailed — or an educated guesstimate — of ROI", extendedQuote: "For people that have new — everyone's excited about ML and AI. But there should be some sort of detailed — or an educated guesstimate — of ROI for the projects that people want to put in. And that's really hard to do, even for experienced developers and data scientists." },
    ],
  },
  {
    id: "chatgpt",
    year: "Jan 2023",
    headline: "ChatGPT arrives by name",
    subhead: "First mentioned in January 2023",
    narrative:
      "JJ Allaire named ChatGPT and GitHub Copilot in January 2023. By March, guests were working out their takes.",
    stat: "22 of 44 episodes (50%) in 2023 used AI keywords",
    quotes: [
      { video_id: "mqOva6Y0xFo", quote_prefix: "So I think things that are happening in", highlight: "But I feel technology companies and technologists sometimes feel like, we should do this because we can, or we should do this because it's cool", extendedQuote: "I think things that are happening in AI, and generative AI specifically, are exciting. But I feel technology companies and technologists sometimes feel like, we should do this because we can, or we should do this because it's cool, and haven't thought about the broader social, political, economic implications. I think we're going a little too fast." },
      { video_id: "hjufaKBU6Ec", quote_prefix: "I mean, maybe if ChatGPT becomes", highlight: "maybe if ChatGPT becomes even better and then we become obsolete", extendedQuote: "I mean, maybe if ChatGPT becomes even better and then we become obsolete, OK, maybe. But I don't think that's going to go away. I think the way to prove the contribution, the benefit of a community — I used the word stuck and the other word unstuck — because that's really the only thing any business cares about. … There are obstacles in the way, they are stuck. How do they get unstuck? That's all data science is for, really." },
      { video_id: "iSN0XmhnGpI", quote_prefix: "So when I, as the boss, call you", highlight: "you have been digging ditches with a shovel your whole career. Now I come and give you a backhoe. You're not going to use it?", extendedQuote: "So when I, as the boss, call you into my office and say I heard about this ChatGPT thing — I'm not talking about getting rid of you. I'm saying, you have been digging ditches with a shovel your whole career. Now I come and give you a backhoe. You're not going to use it? It's a force multiplier — if you can apply these quantitative tools to suddenly process far more data than you used to, that's a competitive advantage." },
    ],
  },
  {
    id: "honeymoon",
    year: "2023",
    headline: "Watch what you put in there",
    subhead: "LLMs really do leak data — and AI governance is going to be our nightmare if we don't get ahead of it",
    narrative:
      "Data privacy warnings came up in 2023. By 2024, some organizations had classified generative AI as a new category of risk.",
    stat: "By 2024: governance concerns, data privacy policies, vendor skepticism",
    quotes: [
      { video_id: "M3yvp-bkdro", quote_prefix: "The public version-- just word of caution", highlight: "never put company proprietary information or customer information into the public ChatGPT" },
      { video_id: "hy6wN8V3qa4", quote_prefix: "We're running we are running tow", highlight: "AI governance is gonna be our nightmare in five years if we don't get a handle on it", extendedQuote: "We're running towards a disaster on the AI governance front. You gotta know the data it feeds in. You gotta know how you're allowed to use it. You gotta have a policy. You gotta implement. You gotta audit. … And if we thought data governance was a problem in the past, AI governance is gonna be our nightmare in five years if we don't get a handle on it." },
      { video_id: "hy6wN8V3qa4", quote_prefix: "LLMs really do leak data", highlight: "LLMs really do leak data. LLMs really do say crazy things, and they really do, not always have transparency.", extendedQuote: "LLMs really do leak data. LLMs really do say crazy things, and they really do, not always have transparency. And even when they have transparency, it's not always real." },
      { video_id: "BoPAxUoBFQM", quote_prefix: "And what's funny is I'll get in ", highlight: "you guys don't need AI", extendedQuote: "And what's funny is I'll get in there, and they're like, how can we integrate AI? And I'm like, you guys don't need AI. I was like, this is a bad idea. And in fact, I think it's gonna really slow you down. Some companies have use cases for AI where it makes sense, and there are certain tools that they can integrate. But a lot of companies don't." },
    ],
  },
  {
    id: "endorsements",
    year: "2024",
    headline: "Yes, I personally pay for this",
    subhead: "By 2024, guests were naming tools and describing what they did with them",
    narrative:
      "The conversation shifted from 'what is this' to 'here's my setup.'",
    stat: "29 of 46 episodes (63%) in 2024 used AI keywords",
    quotes: [
      { video_id: "LSGgGzc3lPw", quote_prefix: "But, so I don't know if that ans", highlight: "Copilot is a big deal for developer productivity", extendedQuote: "Copilot is a big deal for developer productivity — you can use it to generate unit test cases for you and help with repetitive tasks that you might otherwise have to do a bunch of typing on and maybe make a lot more errors. Obviously there are copyright concerns and IP concerns … about misuse of LLMs." },
      { video_id: "7Zrx1N2VgfM", quote_prefix: "I I use, I I personally pay for,", highlight: "I have to double, triple check everything that comes out of it", extendedQuote: "I personally pay for Copilot, and I find it's very useful for my coding, to get things done quicker. But I have to double, triple check everything that comes out of it." },
      { video_id: "POqaMW-uiNU", quote_prefix: "I find the answers that I get out of LLM models to often be wrong", highlight: "by the time I get to the right question, I understand what the answer is. It's funny how that works", extendedQuote: "I find the answers that I get out of LLM models to often be wrong or imprecise. But often helpful. It gets me closer, and then I can iterate. Usually, by the time I get to the right question, I understand what the answer is. It's funny how that works — you're like, oh, my question was wrong. So I do think that for senior or skilled analysts, that's gonna be an incredibly valuable tool that's gonna accelerate development time." },
    ],
  },
  {
    id: "skeptics",
    year: "2025",
    headline: "Pushback on hype, vendors, and the terminology",
    subhead: "The LinkedIn noise, the AI grift vendors, and guests who still prefer 'machine learning'",
    narrative:
      "In 2025, several guests pushed back — on the hype, on vendor-driven projects, and on the word 'AI' itself.",
    stat: "2025: pushback on hype, on governance, on the terminology",
    quotes: [
      { video_id: "qUQ3MIDNyQc", quote_prefix: "In terms of stuff that I'm less ", highlight: "don't delegate your specialism.", extendedQuote: "In terms of stuff that I'm less excited about — the AI hype is something that causes me to ruthlessly unfollow people on LinkedIn — because it just makes everything so noisy. … I would say don't delegate your specialism. You need to stay as the expert in what you do." },
      { video_id: "WrRDSmX8Fm4", quote_prefix: "And so having this sort of head ", highlight: "They basically just glued a bunch of off-the-shelf stuff together.", extendedQuote: "And so having this sort of head of AI, people that are responsible for being that expert kinda prevents what I call AI grift. You basically prevent these grift organizations from getting in and extracting money, when in reality what they built is unsophisticated. They don't have any intellectual property. They don't have some secret data. They basically just glued a bunch of off-the-shelf stuff together." },
      { video_id: "qUQ3MIDNyQc", quote_prefix: "I think sometimes there is a tendency to think that AI can do everybody", highlight: "there is a tendency to think that AI can do everybody else's job but not your own" },
      { video_id: "fb7uwDIi2gU", quote_prefix: "There's no such thing as artific", highlight: "There's no such thing as artificial intelligence. I think it's very useful.", extendedQuote: "I'm old school — I still call it machine learning. There's no such thing as artificial intelligence. I think it's very useful." },
    ],
  },
  {
    id: "careers",
    year: "2025",
    headline: "Can I automate myself out of a job?",
    subhead: "The ethical AI teams were the first to go. Now every senior leader wants more with AI.",
    narrative:
      "Career and displacement topics came up in a few episodes.",
    stat: "Career/displacement mentions stayed low until 2025",
    quotes: [
      { video_id: "BK2mJB3TPVY", quote_prefix: "With Gen AI, we now have tools a", highlight: "can I automate myself out of a job and then move on to another one?", extendedQuote: "With Gen AI, we now have tools at our disposal that are gonna be able to do this even more. My goal has always been, can I automate myself out of a job and then move on to another one? So it's always — can I get to the point of it doing what I would do?" },
      { video_id: "a8lF2YybtVQ", quote_prefix: "But I you know, I think the one ", highlight: "Every senior leader wants us to do more with AI.", extendedQuote: "But, you know, I think one of the biggest things right now is every senior leader wants us to do more with AI. It's like, well, then upskill your people, because there's only so many out there. You can do a lot if you train people. Every person that I know who's been really successful in analytics has learned outside of normal working hours." },
      { video_id: "FU829X_WdYE", quote_prefix: "All these companies, they had, ethical AI team", highlight: "those teams were the first one to get laid off. So there is no team anymore, pretty much, in those companies where they are thinking and they are vetting", extendedQuote: "All these companies had ethical AI teams inside them. And maybe a year or two years ago, those teams were the first one to get laid off. So there is no team anymore, pretty much, in those companies where they are thinking and they are vetting." },
    ],
  },
  {
    id: "whatdoido",
    year: "2024",
    headline: "Should you be learning this?",
    subhead: "Wait until you have a use case — or: this is your moment, go for it",
    narrative:
      "When guests addressed the learning question directly, the answers went in different directions. Keith McNulty said wait unless you're actively building it. Sharon Machlis said this is your moment. Jenny Bryan started skeptical and changed her mind.",
    stat: "Advice ranged from 'wait until you have a use case' to 'this is your moment'",
    quotes: [
      { video_id: "MEqgXHamFAY", quote_prefix: "I would probably say that, if yo", highlight: "if you're not doing it right now, you don't really have a use case to use it on. And by the time you do have a use case, it could have changed a lot", extendedQuote: "I would probably say that, if you're not in a situation where you have to actively build AI workflows right now, I would limit the amount of time you're spending learning how to code agents and things like that. Because if you're not doing it right now, you don't really have a use case to use it on. And by the time you do have a use case, it could have changed a lot between now and then." },
      { video_id: "BYtP0SxGAoA", quote_prefix: "But where we are, where that was", highlight: "this is your moment, in my opinion. Get really up to speed as much as you can and go for it.", extendedQuote: "But where we are, where that was then, we are with generative AI now. Almost everyone is at the same place. I think if you're young or mid career and you're interested in that — especially if you're somewhere else and planning to move to that — this is your moment, in my opinion. Get really up to speed as much as you can and go for it." },
      { video_id: "1c2k6qQ122Y", quote_prefix: "So early on in the LLM hype cycl", highlight: "my attitude changed a lot when I applied it to problems where I need to write Rust or TypeScript, which I'm substantially less good at", extendedQuote: "So early on in the LLM hype cycle, I was super skeptical because I was like, I can write R code much better than this thing can, like, much better. But my attitude changed a lot when I applied it to problems where I need to write Rust or TypeScript, which I'm substantially less good at. Part of one's skepticism can come from — well, how much are you expanding your comfort zone? If you stay in your comfort zone, the relative gain might be small depending on what your comfort zone is." },
      { video_id: "1c2k6qQ122Y", quote_prefix: "But I think if you use LLMs in t", highlight: "forcing you to say those things actually forces you to think those things", extendedQuote: "But I think if you use LLMs in that way, like, really think about the context, and really critique each answer, they end up acting like a giant rubber duck. Forcing you to say those things actually forces you to think those things. … I think certain types of habits in your LLM use can actually force you to refine your own thinking, whereas before you might have just started coding." },
      { video_id: "HtKgIrOnJc8", quote_prefix: "They've since they said the one ", highlight: "Everyone thinks they have to know the latest AI thing these days.", extendedQuote: "They've since said the one thing — everyone thinks they have to know the latest AI thing these days. Most organizations are doing their statistics and predictions in Excel — they've got a spreadsheet with two columns of data. A lot of companies are actually looking for people who are really solid on more conventional data analysis techniques. Maybe they can use AI tools to work faster, but they're not putting 'prompt engineer' on their resume." },
    ],
  },
  {
    id: "building",
    year: "2026",
    headline: "Two developers beside me that happen to be AI",
    subhead: "By 2026, guests were describing what they built that week",
    narrative:
      "By 2026, guests were describing specific workflows.",
    stat: "21 of 25 episodes (84%) in 2026 — Claude was the most-mentioned tool",
    quotes: [
      { video_id: "r0N87By95rI", quote_prefix: "The Shiny assistant, like, almost all the intelligence is just Claude.", highlight: "almost all the intelligence is just Claude. There's very little custom", extendedQuote: "The Shiny assistant — almost all the intelligence is just Claude. There's very little custom. We know there are a few common mistakes that it makes with Shiny that we instructed it not to. But other than that, it's mostly just Claude doing what it knows about Shiny." },
      { video_id: "lc6ad15gjeo", quote_prefix: "This week, I was building an app with Claude and Positron", highlight: "This week, I was building an app with Claude and Positron", extendedQuote: "This week, I was building an app with Claude and Positron that was showing all the different use cases we have across different industries. It's really about different ways where I can bring the customer voice into things that we do at Posit." },
      { video_id: "Pnztr_TOD-4", quote_prefix: "And so I started a conversation ", highlight: "in a domain that rewards positive results, how is a tool optimized to give confident, comprehensive answers going to shape the direction of the science?", extendedQuote: "And so I started a conversation with Claude. I said: how can you achieve computationally reproducible research results when you're using a nondeterministic tool like AI? It said, well — that's not really the problem. The problem is that people overclaim the impact or significance of their results. But in a domain that rewards positive results, how is a tool optimized to give confident, comprehensive answers going to shape the direction of the science? Won't that just reinforce positive overclaiming? And it said — this was the most disarming answer I've ever gotten from an AI — yeah. That's a really good question. This might get worse before it gets better." },
    ],
  },
  {
    id: "end",
    year: "2022 → 2026",
    headline: "224 episodes",
    subhead: "",
    narrative:
      "In 2022, one guest mentioned exploring GPT-3. In 2026, another said they built an app with Claude and Positron that week.",
    stat: "1,039 sentences matched by keyword search across 224 episodes",
    quotes: [],
  },
];

// Resolve a chapter QuoteRef to the underlying extracted mention. If this
// returns undefined the quote renders nothing at all, so tests assert every
// CHAPTERS quote resolves against public/data/regex_mentions.json.
export function findMention(mentions: Mention[], ref: QuoteRef): Mention | undefined {
  return mentions.find(
    (m) =>
      m.video_id === ref.video_id &&
      m.quote.replace(/\s+/g, " ").toLowerCase().startsWith(ref.quote_prefix.toLowerCase().slice(0, 30))
  );
}

