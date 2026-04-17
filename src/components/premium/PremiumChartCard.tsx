import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PremiumChartCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  legend?: { label: string; color: string }[];
  children: ReactNode;
  className?: string;
  variant?: "default" | "highlighted";
}

/**
 * Premium chart container — glass surface, header w/ optional actions and legend chips.
 * Wrap any recharts component inside.
 */
export const PremiumChartCard = ({
  title,
  description,
  actions,
  legend,
  children,
  className,
  variant = "default",
}: PremiumChartCardProps) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={cn(
      "relative overflow-hidden glass-premium p-5 md:p-6",
      variant === "highlighted" && "gradient-border-glow",
      className
    )}
  >
    <header className="flex items-start justify-between gap-3 mb-5">
      <div>
        <h3 className="text-base md:text-lg font-display font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {legend && (
          <div className="flex items-center gap-3">
            {legend.map((l) => (
              <span key={l.label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: l.color, boxShadow: `0 0 8px ${l.color}` }} />
                {l.label}
              </span>
            ))}
          </div>
        )}
        {actions}
      </div>
    </header>
    <div className="relative">{children}</div>
  </motion.section>
);
