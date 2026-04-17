import { GlassCard } from "@/components/GlassCard";
import { Timer, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WaitStat } from "@/lib/api";

interface AvgOtpWaitTimeProps {
  data?: {
    today: WaitStat;
    week: WaitStat;
    month: WaitStat;
    all_time: WaitStat;
  };
}

const fmtDuration = (sec: number): string => {
  if (!sec || sec <= 0) return "—";
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm ? `${h}h ${mm}m` : `${h}h`;
};

// Color tier based on speed (lower is better).
const speedTone = (sec: number) => {
  if (!sec) return "text-muted-foreground";
  if (sec <= 15) return "text-neon-green";
  if (sec <= 45) return "text-neon-cyan";
  if (sec <= 120) return "text-neon-amber";
  return "text-destructive";
};

const speedLabel = (sec: number) => {
  if (!sec) return "No data";
  if (sec <= 15) return "Excellent";
  if (sec <= 45) return "Good";
  if (sec <= 120) return "Slow";
  return "Very Slow";
};

export const AvgOtpWaitTime = ({ data }: AvgOtpWaitTimeProps) => {
  const today = data?.today ?? { avg_sec: 0, min_sec: 0, max_sec: 0, samples: 0 };
  const week = data?.week ?? { avg_sec: 0, min_sec: 0, max_sec: 0, samples: 0 };
  const all = data?.all_time ?? { avg_sec: 0, min_sec: 0, max_sec: 0, samples: 0 };

  // Trend = today vs 7-day average. Lower is better, so down arrow = improvement.
  const baseline = week.avg_sec || all.avg_sec || 0;
  const delta = today.avg_sec && baseline ? today.avg_sec - baseline : 0;
  const TrendIcon = delta < -1 ? TrendingDown : delta > 1 ? TrendingUp : Minus;
  const trendTone = delta < -1 ? "text-neon-green" : delta > 1 ? "text-destructive" : "text-muted-foreground";
  const trendPct = baseline ? Math.round((delta / baseline) * 100) : 0;

  return (
    <GlassCard glow="cyan" className="p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Timer className="w-4 h-4 text-neon-cyan" />
          Avg OTP Wait Time
        </h3>
        {today.samples > 0 && (
          <span className={cn("inline-flex items-center gap-1 text-xs font-mono", trendTone)}>
            <TrendIcon className="w-3 h-3" />
            {delta === 0 ? "—" : `${delta > 0 ? "+" : ""}${trendPct}%`}
          </span>
        )}
      </div>

      {/* Hero metric — today's average */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className={cn("text-4xl font-display font-bold", speedTone(today.avg_sec))}>
          {fmtDuration(today.avg_sec)}
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">today avg</span>
      </div>
      <p className={cn("text-xs font-medium mb-4", speedTone(today.avg_sec))}>
        {speedLabel(today.avg_sec)}
        {today.samples > 0 && (
          <span className="text-muted-foreground/60 font-normal ml-1">
            · {today.samples} OTP{today.samples === 1 ? "" : "s"}
          </span>
        )}
      </p>

      {/* Min/Max for today */}
      {today.samples > 0 && (
        <div className="flex items-center gap-3 mb-4 text-xs">
          <span className="text-muted-foreground">
            Fastest <span className="font-mono text-neon-green">{fmtDuration(today.min_sec)}</span>
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-muted-foreground">
            Slowest <span className="font-mono text-neon-amber">{fmtDuration(today.max_sec)}</span>
          </span>
        </div>
      )}

      {/* Window comparison */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.04]">
        {[
          { label: "7-day", v: week },
          { label: "30-day", v: data?.month ?? week },
          { label: "All time", v: all },
        ].map((row) => (
          <div key={row.label} className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">
              {row.label}
            </p>
            <p className={cn("font-mono text-sm font-semibold", speedTone(row.v.avg_sec))}>
              {fmtDuration(row.v.avg_sec)}
            </p>
            <p className="text-[10px] text-muted-foreground/50">{row.v.samples} samples</p>
          </div>
        ))}
      </div>

      {today.samples === 0 && (
        <p className="text-xs text-muted-foreground/60 text-center mt-3 italic">
          Receive your first OTP today to see live wait-time stats
        </p>
      )}
    </GlassCard>
  );
};
