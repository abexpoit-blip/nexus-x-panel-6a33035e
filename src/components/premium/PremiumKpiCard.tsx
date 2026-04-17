import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Sparkline } from "@/components/charts/Charts";

type Tone = "cyan" | "magenta" | "green" | "amber" | "purple";

interface PremiumKpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  delta?: { value: number; label?: string }; // % change
  spark?: number[];
  className?: string;
}

const toneMap: Record<Tone, { text: string; bg: string; sparkColor: string; gradient: string; glow: string }> = {
  cyan: {
    text: "text-neon-cyan",
    bg: "bg-neon-cyan/10",
    sparkColor: "hsl(185 100% 55%)",
    gradient: "from-neon-cyan/30 via-neon-cyan/0 to-transparent",
    glow: "shadow-glow-cyan",
  },
  magenta: {
    text: "text-neon-magenta",
    bg: "bg-neon-magenta/10",
    sparkColor: "hsl(300 100% 55%)",
    gradient: "from-neon-magenta/30 via-neon-magenta/0 to-transparent",
    glow: "shadow-glow-magenta",
  },
  green: {
    text: "text-neon-green",
    bg: "bg-neon-green/10",
    sparkColor: "hsl(150 100% 55%)",
    gradient: "from-neon-green/25 via-neon-green/0 to-transparent",
    glow: "shadow-glow-green",
  },
  amber: {
    text: "text-neon-amber",
    bg: "bg-neon-amber/10",
    sparkColor: "hsl(38 100% 55%)",
    gradient: "from-neon-amber/25 via-neon-amber/0 to-transparent",
    glow: "",
  },
  purple: {
    text: "text-neon-purple",
    bg: "bg-neon-purple/10",
    sparkColor: "hsl(270 100% 65%)",
    gradient: "from-neon-purple/25 via-neon-purple/0 to-transparent",
    glow: "",
  },
};

const parseValue = (val: string | number) => {
  if (typeof val === "number") return { num: val, prefix: "", suffix: "" };
  const m = val.match(/^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
  if (!m) return { num: 0, prefix: "", suffix: val };
  return { prefix: m[1], num: parseFloat(m[2].replace(/,/g, "")), suffix: m[3] };
};

export const PremiumKpiCard = ({
  label,
  value,
  icon: Icon,
  tone = "cyan",
  delta,
  spark,
  className,
}: PremiumKpiCardProps) => {
  const c = toneMap[tone];
  const { num, prefix, suffix } = parseValue(value);
  const positive = delta ? delta.value >= 0 : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl glass-premium hover-lift p-5",
        className
      )}
    >
      {/* Tone gradient wash */}
      <div className={cn("absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl bg-gradient-to-br opacity-60 transition-opacity group-hover:opacity-90", c.gradient)} />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-3xl md:text-[2.1rem] font-display font-bold leading-none">
            <AnimatedCounter value={num} prefix={prefix} suffix={suffix} duration={1600} />
          </p>
          {delta && (
            <div className="flex items-center gap-1.5 pt-1">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md",
                  positive
                    ? "text-neon-green bg-neon-green/10"
                    : "text-destructive bg-destructive/10"
                )}
              >
                {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(delta.value).toFixed(1)}%
              </span>
              {delta.label && <span className="text-xs text-muted-foreground">{delta.label}</span>}
            </div>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl border border-white/[0.06]", c.bg, c.glow)}>
          <Icon className={cn("w-5 h-5", c.text)} />
        </div>
      </div>

      {spark && spark.length > 1 && (
        <div className="relative mt-3 -mx-1 -mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <Sparkline data={spark} color={c.sparkColor} height={36} />
        </div>
      )}
    </motion.div>
  );
};
