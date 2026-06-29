"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { buildTimeline, buildToolTimeline, formatMonth, TOOL_COLORS } from "@/lib/utils";
import type { Mention } from "@/lib/types";

interface Props {
  mentions: Mention[];
  selectedMonth: string | null;
  onMonthClick: (month: string | null) => void;
}

export default function Timeline({ mentions, selectedMonth, onMonthClick }: Props) {
  const countPoints = buildTimeline(mentions);
  const { points: toolPoints, tools } = buildToolTimeline(mentions);

  const handleClick = (data: { activeLabel?: string | number }) => {
    if (!data?.activeLabel) return;
    const label = String(data.activeLabel);
    const raw = countPoints.find((p) => formatMonth(p.month) === label)?.month;
    if (!raw) return;
    onMonthClick(raw === selectedMonth ? null : raw);
  };

  return (
    <div className="bg-[#1A1A2E] rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest opacity-60">
            Mentions over time
          </h2>
          <p className="text-white/40 text-xs mt-0.5">Click a month to filter · {mentions.length} mentions</p>
        </div>
      </div>

      {/* Count bar chart */}
      <ResponsiveContainer width="100%" height={120}>
        <BarChart
          data={countPoints.map((p) => ({ ...p, month: formatMonth(p.month) }))}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        >
          <XAxis
            dataKey="month"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "#1e1e35",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "white",
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="count"
            fill="#6366F1"
            radius={[3, 3, 0, 0]}
            opacity={0.8}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Tool line chart */}
      {tools.length > 0 && (
        <>
          <div className="border-t border-white/10" />
          <p className="text-white/40 text-xs uppercase tracking-widest">Tool mentions</p>
          <ResponsiveContainer width="100%" height={90}>
            <LineChart
              data={toolPoints.map((p) => ({ ...p, month: formatMonth(p.month as string) }))}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="month"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "#1e1e35",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "white",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }} />
              {tools.map((tool) => (
                <Line
                  key={tool}
                  type="monotone"
                  dataKey={tool}
                  stroke={TOOL_COLORS[tool] ?? "#888"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
