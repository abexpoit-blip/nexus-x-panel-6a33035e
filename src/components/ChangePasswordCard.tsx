import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const ChangePasswordCard = () => {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  // Strength heuristic — simple, no external deps
  const strength = (() => {
    if (!next) return { score: 0, label: "", color: "" };
    let s = 0;
    if (next.length >= 8) s++;
    if (next.length >= 12) s++;
    if (/[A-Z]/.test(next) && /[a-z]/.test(next)) s++;
    if (/\d/.test(next)) s++;
    if (/[^a-zA-Z0-9]/.test(next)) s++;
    const labels = ["Too short", "Weak", "Fair", "Good", "Strong", "Excellent"];
    const colors = ["bg-destructive", "bg-destructive", "bg-neon-amber", "bg-neon-amber", "bg-neon-green", "bg-neon-green"];
    return { score: s, label: labels[s], color: colors[s] };
  })();

  const submit = async () => {
    if (!current || !next) return toast.error("Fill both password fields");
    if (next.length < 8) return toast.error("New password must be at least 8 characters");
    if (next !== confirm) return toast.error("New passwords don't match");
    if (next === current) return toast.error("New password must differ from current");

    setBusy(true);
    try {
      const r = await api.changePassword(current, next);
      toast.success(r.message || "Password changed successfully");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard className="p-6 max-w-2xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-neon-magenta/15 flex items-center justify-center shrink-0">
          <KeyRound className="w-6 h-6 text-neon-magenta" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-foreground text-lg">Change Password</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Signed in as <span className="font-mono text-foreground">{user?.username}</span> ·
            Other devices will be logged out automatically
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Current Password">
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>

        <Field label="New Password">
          <Input
            type={show ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          {next && (
            <div className="space-y-1.5 mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 h-1.5 rounded-full transition-colors",
                      i <= strength.score ? strength.color : "bg-white/[0.06]"
                    )}
                  />
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Strength: <span className={cn("font-semibold", strength.score >= 4 ? "text-neon-green" : strength.score >= 2 ? "text-neon-amber" : "text-destructive")}>
                  {strength.label}
                </span>
              </div>
            </div>
          )}
        </Field>

        <Field label="Confirm New Password">
          <Input
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Type the new password again"
            autoComplete="new-password"
          />
          {confirm && next && confirm !== next && (
            <p className="text-xs text-destructive mt-1">Passwords don't match</p>
          )}
        </Field>

        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-neon-green" />
            Use a unique password — don't reuse from other sites
          </p>
          <Button
            onClick={submit}
            disabled={busy || !current || !next || next !== confirm}
            className="bg-gradient-to-r from-primary to-neon-magenta text-primary-foreground font-semibold border-0 hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Changing…" : "Change Password"}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default ChangePasswordCard;
