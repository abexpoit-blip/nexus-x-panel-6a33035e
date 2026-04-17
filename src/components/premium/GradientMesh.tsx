import { cn } from "@/lib/utils";

interface GradientMeshProps {
  variant?: "default" | "intense" | "subtle";
  className?: string;
}

/**
 * Ambient floating orbs background — adds depth and "premium SaaS" feel.
 * Render once near the top of a page (absolute positioned, behind content).
 */
export const GradientMesh = ({ variant = "default", className }: GradientMeshProps) => {
  const intensity = variant === "intense" ? 0.7 : variant === "subtle" ? 0.25 : 0.5;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden -z-10", className)}
    >
      <div
        className="ambient-orb animate-float-slow"
        style={{
          width: 520,
          height: 520,
          top: "-10%",
          left: "-8%",
          background: `hsl(185 100% 55% / ${intensity})`,
        }}
      />
      <div
        className="ambient-orb animate-float-slow"
        style={{
          width: 480,
          height: 480,
          top: "30%",
          right: "-10%",
          background: `hsl(300 100% 55% / ${intensity * 0.85})`,
          animationDelay: "-6s",
        }}
      />
      <div
        className="ambient-orb animate-float-slow"
        style={{
          width: 400,
          height: 400,
          bottom: "-15%",
          left: "30%",
          background: `hsl(270 100% 65% / ${intensity * 0.7})`,
          animationDelay: "-12s",
        }}
      />
      <div className="absolute inset-0 bg-grid opacity-30" />
    </div>
  );
};
