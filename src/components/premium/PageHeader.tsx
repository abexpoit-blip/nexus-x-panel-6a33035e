import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * Premium page header — gradient eyebrow, large display title, optional actions.
 * Pair with GradientMesh in the page wrapper for full premium feel.
 */
export const PageHeader = ({ title, description, eyebrow, actions, icon, className }: PageHeaderProps) => (
  <motion.header
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={cn("flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8", className)}
  >
    <div className="space-y-2">
      {eyebrow && (
        <span className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] rounded-full bg-white/[0.04] border border-white/[0.08] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-aurora animate-pulse" />
          {eyebrow}
        </span>
      )}
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            {icon}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
          <span className="text-gradient-aurora">{title}</span>
        </h1>
      </div>
      {description && (
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl">{description}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </motion.header>
);
