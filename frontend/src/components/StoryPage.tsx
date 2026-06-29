"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Play, X } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList,
  LineChart, Line, Legend,
} from "recharts";
import { youtubeUrl } from "@/lib/utils";
import type { Mention } from "@/lib/types";
import type { CoverageYear, ToolYear } from "@/lib/types";

// ── Story chapter definitions ─────────────────────────────────────────────────

interface QuoteRef {
  video_id: string;
  quote_prefix: string;
  highlight?: string;
  extendedQuote?: string;
}

interface Chapter {
  id: string;
  year: string;
  headline: string;
  subhead: string;
  narrative: string;
  stat?: string;
  quotes: QuoteRef[];
  chart?: "coverage" | "tools";
}

const CHAPTERS: Chapter[] = [
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
    headline: "225 episodes",
    subhead: "",
    narrative:
      "In 2022, one guest mentioned exploring GPT-3. In 2026, another said they built an app with Claude and Positron that week.",
    stat: "1,039 sentences matched by keyword search across 225 episodes",
    quotes: [],
  },
];

// ── Timeline ──────────────────────────────────────────────────────────────────

interface TimelineEvent {
  date: string;
  label: string;
  fullQuote: string;
  context?: string;
  video_id?: string;
  start_time?: number;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
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
    date: "Feb 2024",
    label: "Claude first mentioned",
    fullQuote: "I actually do use ChatGPT, but I would also say I can't find a use case for Claude.",
    context: "Jamie Warner @ Plymouth Rock Assurance",
    video_id: "9FussTE0MKw",
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

function TimelinePlayer({ videoId, startTime }: { videoId: string; startTime: number }) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${Math.floor(startTime)}&autoplay=1&rel=0&modestbranding=1`;
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  const timestamp = `${Math.floor(startTime / 60)}:${String(Math.floor(startTime % 60)).padStart(2, "0")}`;

  return playing ? (
    <div className="relative mt-3 rounded-lg overflow-hidden aspect-video">
      <iframe src={embedUrl} className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
      <button
        onClick={() => setPlaying(false)}
        className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <X size={9} className="text-white" />
      </button>
    </div>
  ) : (
    <button
      onClick={() => setPlaying(true)}
      className="flex items-center gap-2 mt-3 group"
      aria-label="Play clip"
    >
      <div className="relative w-20 rounded-md overflow-hidden flex-shrink-0 border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbUrl} alt="" className="w-full aspect-video object-cover" />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-white/15 border border-white/30 flex items-center justify-center group-hover:bg-white/25 transition-colors">
            <Play size={9} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>
      <span className="text-white/30 text-xs group-hover:text-white/50 transition-colors">Watch at {timestamp}</span>
    </button>
  );
}

function Timeline() {
  const [scrollActive, setScrollActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndex = hovered ?? scrollActive;

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setScrollActive(i);
          } else {
            setScrollActive((prev) => (prev === i ? null : prev));
          }
        },
        { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto px-6 py-4">
      <div className="absolute left-[7.5rem] top-0 bottom-0 w-px bg-white/10" />
      <div className="space-y-10">
        {TIMELINE_EVENTS.map((e, i) => {
          const isActive = activeIndex === i;
          return (
            <div
              key={i}
              ref={(el) => { itemRefs.current[i] = el; }}
              className="flex gap-5 items-start group relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="w-24 flex-shrink-0 text-right pt-0.5">
                <span className="text-white/30 text-xs font-mono tracking-tight">{e.date}</span>
              </div>
              <div className="flex-shrink-0 mt-1.5 relative z-10">
                <div className={`w-2 h-2 rounded-full border transition-colors duration-150 ${isActive ? "bg-indigo-400 border-indigo-300" : "bg-indigo-400/50 border-indigo-400/70"}`} />
              </div>
              <div className="flex-1 pb-1">
                <p className={`text-sm font-medium leading-snug transition-colors duration-150 ${isActive ? "text-white" : "text-white/75"}`}>
                  {e.label}
                </p>
                {e.context && (
                  <p className="text-white/25 text-xs mt-0.5">{e.context}</p>
                )}
                <div className={`overflow-hidden transition-all duration-300 ${isActive ? "max-h-72 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                  <div className="p-3 rounded-xl bg-white/8 border border-white/10 text-white/70 text-xs leading-relaxed">
                    &ldquo;{e.fullQuote}&rdquo;
                    {e.video_id && e.start_time != null && (
                      <TimelinePlayer videoId={e.video_id} startTime={e.start_time} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Coverage chart ────────────────────────────────────────────────────────────

function CoverageChart({ data }: { data: CoverageYear[] }) {
  const chartData = data.map((d) => ({
    year: d.year,
    "Mentioned AI": d.with_ai,
    "No mention": d.total - d.with_ai,
    pct: d.pct,
  }));

  return (
    <div className="space-y-3">
      <p className="text-white/40 text-xs uppercase tracking-widest">
        Episodes mentioning AI, by year
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip contentStyle={{ background: "#1e1e35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontSize: 12 }} />
          <Bar dataKey="No mention" stackId="a" fill="rgba(255,255,255,0.08)" radius={[0, 0, 4, 4]} />
          <Bar dataKey="Mentioned AI" stackId="a" fill="#6366F1" radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="pct"
              position="top"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => `${v}%`}
              style={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-white/25 text-xs">Indigo = mentioned AI · Gray = silent · % labeled above</p>
    </div>
  );
}

// ── Tool timeline chart ───────────────────────────────────────────────────────

function ToolTimelineChart({ data }: { data: ToolYear[] }) {
  return (
    <div className="space-y-3">
      <p className="text-white/40 text-xs uppercase tracking-widest">
        Named tool mentions by year
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#1e1e35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }} />
          <Line type="monotone" dataKey="ChatGPT" stroke="#818CF8" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="GitHub Copilot" stroke="#34D399" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Claude" stroke="#F472B6" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Claude Code" stroke="#FB923C" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-white/25 text-xs">Based on explicit tool names in extracted quotes</p>
    </div>
  );
}

// ── YouTube quote card ────────────────────────────────────────────────────────

function HighlightedQuote({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight) return <span className="text-white/70">{text}</span>;
  const lower = text.toLowerCase();
  const needle = highlight.toLowerCase();
  const idx = lower.indexOf(needle);
  if (idx === -1) return <span className="text-white/70">{text}</span>;
  return (
    <>
      {idx > 0 && <span className="text-white/38">{text.slice(0, idx)}</span>}
      <span className="text-white">{text.slice(idx, idx + highlight.length)}</span>
      {idx + highlight.length < text.length && (
        <span className="text-white/38">{text.slice(idx + highlight.length)}</span>
      )}
    </>
  );
}

function BoldedText({ text, boldChunk }: { text: string; boldChunk?: string }) {
  if (!boldChunk?.trim()) return <>{text}</>;
  const escaped = boldChunk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === boldChunk.toLowerCase() ? (
          <strong key={i} className="font-semibold text-white/95">{part}</strong>
        ) : (
          <span key={i} className="text-white/60">{part}</span>
        )
      )}
    </>
  );
}

function StoryQuote({ m, highlight, extendedQuote }: { m: Mention; highlight?: string; extendedQuote?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const fadeObs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    const expandObs = new IntersectionObserver(
      ([entry]) => { setExpanded(entry.isIntersecting); },
      { rootMargin: "-25% 0px -25% 0px", threshold: 0 }
    );
    fadeObs.observe(el);
    expandObs.observe(el);
    return () => { fadeObs.disconnect(); expandObs.disconnect(); };
  }, []);

  const preview = highlight ?? (m.quote.length > 80 ? m.quote.slice(0, 80) + "…" : m.quote);

  const thumbUrl = `https://img.youtube.com/vi/${m.video_id}/mqdefault.jpg`;
  const endParam = m.end_time ? `&end=${Math.ceil(m.end_time)}` : "";
  const embedUrl = `https://www.youtube.com/embed/${m.video_id}?start=${Math.floor(m.start_time ?? 0)}${endParam}&autoplay=1&rel=0&modestbranding=1`;

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      {/* Collapsed: just the key phrase */}
      <div className={`overflow-hidden transition-all duration-500 ${expanded ? "max-h-0 opacity-0" : "max-h-16 opacity-100"}`}>
        <p className="text-white/30 text-sm italic leading-relaxed">
          &ldquo;{preview}&rdquo;
        </p>
      </div>

      {/* Expanded: full card with thumbnail + attribution */}
      <div className={`overflow-hidden transition-all duration-500 ${expanded ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="flex flex-col sm:flex-row gap-4 pt-1">
          {/* Thumbnail / player */}
          <div className="sm:w-48 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 self-start">
            {playing ? (
              <div className="relative aspect-video">
                <iframe src={embedUrl} className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
                <button
                  onClick={() => setPlaying(false)}
                  className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X size={11} className="text-white" />
                </button>
              </div>
            ) : (
              <button onClick={() => setPlaying(true)} className="relative w-full aspect-video block group overflow-hidden" aria-label="Play clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-white/15 border border-white/30 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                    <Play size={14} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
                {m.start_time != null && (
                  <div className="absolute bottom-1.5 right-1.5 text-xs text-white/50 bg-black/50 px-1.5 py-0.5 rounded">
                    {Math.floor(m.start_time / 60)}:{String(Math.floor(m.start_time % 60)).padStart(2, "0")}
                  </div>
                )}
              </button>
            )}
          </div>

          {/* Quote text */}
          <div className="flex-1 flex flex-col justify-center py-1 min-w-0">
            <blockquote className="text-base leading-relaxed font-light">
              <BoldedText text={extendedQuote ?? m.quote} boldChunk={highlight} />
            </blockquote>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="text-white/50 text-sm font-medium">{m.is_guest_speaking ? m.guest : "Host"}</span>
              <span className="text-white/25 text-xs">{m.date}</span>
              <a
                href={youtubeUrl(m.video_id, m.start_time)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/20 hover:text-white/50 transition-colors ml-auto"
              >
                ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const AI_KEYWORDS_TOOLTIP =
  "ChatGPT, Claude, Gemini, GitHub Copilot, Cursor, Windsurf, LLM, generative AI, hallucination, vibe coding, prompt engineering, and related phrases like 'about AI', 'AI tool', 'AI governance'";

function StatText({ text }: { text: string }) {
  const parts = text.split("AI keywords");
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts[0]}
      <abbr title={AI_KEYWORDS_TOOLTIP} className="underline decoration-dotted cursor-help">
        AI keywords
      </abbr>
      {parts[1]}
    </>
  );
}

// ── Chapter section ───────────────────────────────────────────────────────────

function findMention(mentions: Mention[], ref: QuoteRef): Mention | undefined {
  return mentions.find(
    (m) =>
      m.video_id === ref.video_id &&
      m.quote.replace(/\s+/g, " ").toLowerCase().startsWith(ref.quote_prefix.toLowerCase().slice(0, 30))
  );
}

function ChapterSection({
  chapter,
  mentions,
  index,
  onVisible,
  coverage,
  toolTimeline,
}: {
  chapter: Chapter;
  mentions: Mention[];
  index: number;
  onVisible: (id: string) => void;
  coverage: CoverageYear[];
  toolTimeline: ToolYear[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleVisible = useCallback(() => onVisible(chapter.id), [chapter.id, onVisible]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) handleVisible(); },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [handleVisible]);

  return (
    <section id={chapter.id} ref={ref} className="py-16 px-6 md:px-8">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-indigo-400/60 text-xs font-mono">{String(index + 1).padStart(2, "0")}</span>
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-white/20 text-xs uppercase tracking-widest">{chapter.year}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">{chapter.headline}</h2>
          {chapter.subhead && <p className="text-white/35 text-base mt-2">{chapter.subhead}</p>}
        </div>

        {chapter.chart === "coverage" && coverage.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
            <CoverageChart data={coverage} />
          </div>
        )}

        {chapter.chart === "tools" && toolTimeline.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
            <ToolTimelineChart data={toolTimeline} />
          </div>
        )}

        {chapter.stat && (
          <div className="border-l-2 border-indigo-400/40 pl-4 max-w-2xl">
            <p className="text-indigo-300/70 text-sm font-medium"><StatText text={chapter.stat} /></p>
          </div>
        )}

        <p className="text-white/65 text-base leading-relaxed max-w-2xl">{chapter.narrative}</p>

        {chapter.quotes.length > 0 && (
          <div className="space-y-7 pt-2">
            {chapter.quotes.map((ref, i) => {
              const m = findMention(mentions, ref);
              if (!m) return null;
              return <StoryQuote key={`${m.video_id}-${i}`} m={m} highlight={ref.highlight} extendedQuote={ref.extendedQuote} />;
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function StoryPage({
  mentions,
  coverage,
  toolTimeline,
}: {
  mentions: Mention[];
  coverage: CoverageYear[];
  toolTimeline: ToolYear[];
}) {
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].id);
  const totalEpisodes = coverage.reduce((s, d) => s + d.total, 0);

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white">
      {/* Fixed sidebar */}
      <nav className="fixed left-5 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-2.5">
        {CHAPTERS.filter(ch => ch.id !== "end").map((ch) => {
          const active = activeChapter === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => document.getElementById(ch.id)?.scrollIntoView({ behavior: "smooth" })}
              className="group flex items-center gap-3 text-left"
            >
              <div className={`w-1.5 rounded-full transition-all duration-300 ${active ? "h-6 bg-indigo-400" : "h-1.5 bg-white/15 group-hover:bg-white/35"}`} />
              <span className={`text-xs transition-all duration-300 whitespace-nowrap ${active ? "text-white/70" : "text-transparent group-hover:text-white/30"}`}>
                {ch.year}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0D0D1A]/85 backdrop-blur-sm">
        <Link href="/explore" className="flex items-center gap-2 text-white/35 hover:text-white/70 transition-colors text-sm">
          <ArrowLeft size={13} />
          Explore data
        </Link>
        <div className="hidden md:flex items-center gap-5">
          {CHAPTERS.filter(ch => ch.id !== "end").map((ch) => (
            <button
              key={ch.id}
              onClick={() => document.getElementById(ch.id)?.scrollIntoView({ behavior: "smooth" })}
              className={`text-xs uppercase tracking-wider transition-colors ${activeChapter === ch.id ? "text-white/70" : "text-white/20 hover:text-white/45"}`}
            >
              {ch.year}
            </button>
          ))}
        </div>
        <span className="text-white/15 text-xs hidden sm:block">Posit Data Science Hangout</span>
      </div>

      {/* Hero */}
      <div className="text-center pt-24 pb-10 px-6">
        <p className="text-white/25 text-xs uppercase tracking-widest mb-5">
          225 episodes · 2022–2026
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
          How data scientists talked about AI — 2022 to 2026
        </h1>
        <p className="text-white/50 text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
          The{" "}
          <a
            href="https://posit.co/data-science-hangout/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/80 transition-colors"
          >
            Posit Data Science Hangout
          </a>{" "}
          is a weekly community call for data people.
        </p>
        <p className="text-white/20 text-sm mt-4 max-w-xl mx-auto">
          Unofficial fan project — not affiliated with or endorsed by Posit PBC.
        </p>
      </div>

      {/* Timeline */}
      <Timeline />


      {/* Chapters */}
      {CHAPTERS.map((ch, i) => (
        <ChapterSection
          key={ch.id}
          chapter={ch}
          mentions={mentions}
          index={i}
          onVisible={setActiveChapter}
          coverage={coverage}
          toolTimeline={toolTimeline}
        />
      ))}

      {/* CTA */}
      <div className="py-24 px-6 text-center border-t border-white/8">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-4">
          225 episodes · 2021–2026
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
          1,039 quotes, searchable
        </h2>
        <p className="text-white/40 text-base mb-10 max-w-md mx-auto">
          Filter by tool or topic, search by keyword, and click any quote to watch the original episode.
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl transition-colors text-base"
        >
          Explore all quotes →
        </Link>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center px-6 border-t border-white/5 flex flex-col items-center gap-3">
        <a
          href="https://github.com/abigailhaddad/posit-hangout-ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          abigailhaddad/posit-hangout-ai
        </a>
        <p className="text-white/20 text-xs">Posit Data Science Hangout · unofficial fan project · not affiliated with Posit PBC</p>
      </footer>
    </div>
  );
}
