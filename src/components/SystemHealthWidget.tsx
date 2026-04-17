import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Activity, Database, HardDrive, Bot, Server, CheckCircle2, XCircle, Clock, Save, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const fmtUptime = (sec: number): string => {
  if (!sec) return "—";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const fmtAgo = (ts: number | null | undefined): string => {
  if (!ts) return "never";
  const s = Math.floor(Date.now() / 1000) - ts;
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const fmtBytes = (b: number): string => {
  if (!b) return "0 B";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1073741824) return `${(b / 1048576).toFixed(1)} MB`;
  return `${(b / 1073741824).toFixed(2)} GB`;
};

const Tile = ({
  icon, label, value, hint, tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "good" | "warn" | "bad";
}) => {
  const valueColor = {
    default: "text-foreground",
    good: "text-neon-green",
    warn: "text-neon-amber",
    bad: "text-destructive",
  }[tone];
  return (
    <div className="glass p-3 rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition-colors">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
        {icon}<span>{label}</span>
      </div>
      <div className={cn("text-base font-display font-bold font-mono", valueColor)}>{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{hint}</div>}
    </div>
  );
};

const StatusPill = ({ ok, label }: { ok: boolean; label: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
      ok ? "bg-neon-green/15 text-neon-green" : "bg-destructive/15 text-destructive"
    )}
  >
    {ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    {label}
  </span>
);

export const SystemHealthWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["system-health"],
    queryFn: () => api.admin.systemHealth(),
    refetchInterval: 15000,
  });

  if (isLoading || !data) {
    return (
      <div className="glass-card border border-white/[0.06] rounded-xl p-5">
        <p className="text-sm text-muted-foreground text-center py-6">Loading system health…</p>
      </div>
    );
  }

  const { server, database, ims_bot, counts } = data;

  // Backup freshness — warn after 26h, fail after 50h
  const backupAge = database.last_backup
    ? Math.floor(Date.now() / 1000) - database.last_backup.mtime
    : null;
  const backupTone: "good" | "warn" | "bad" =
    !database.last_backup ? "bad" :
    backupAge! < 26 * 3600 ? "good" :
    backupAge! < 50 * 3600 ? "warn" : "bad";

  // Pool health — warn under 100, bad under 30
  const poolTone: "good" | "warn" | "bad" =
    counts.ims_pool_size > 100 ? "good" : counts.ims_pool_size > 30 ? "warn" : "bad";

  return (
    <div className="glass-card border border-white/[0.06] rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-neon-cyan" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            System Health
          </h3>
          <span className="text-[10px] text-muted-foreground/50 normal-case font-normal">
            (refreshes every 15s)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusPill ok={ims_bot.running} label={ims_bot.running ? "IMS bot up" : "IMS bot down"} />
          <StatusPill ok={!!ims_bot.logged_in} label={ims_bot.logged_in ? "Logged in" : "Not logged in"} />
          <StatusPill ok={backupTone !== "bad"} label="Backup" />
        </div>
      </div>

      {/* Tile grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <Tile
          icon={<Server className="w-3 h-3" />}
          label="Backend uptime"
          value={fmtUptime(server.uptime_sec)}
          hint={`${server.env} · ${server.node_version}`}
          tone="good"
        />
        <Tile
          icon={<HardDrive className="w-3 h-3" />}
          label="Memory (RSS)"
          value={`${server.memory_mb.rss} MB`}
          hint={`heap ${server.memory_mb.heap_used} / ${server.memory_mb.heap_total} MB`}
          tone={server.memory_mb.rss > 800 ? "warn" : "good"}
        />
        <Tile
          icon={<Database className="w-3 h-3" />}
          label="DB size"
          value={`${database.size_mb} MB`}
          hint={database.path}
        />
        <Tile
          icon={<Save className="w-3 h-3" />}
          label="Last backup"
          value={database.last_backup ? fmtAgo(database.last_backup.mtime) : "never"}
          hint={
            database.last_backup
              ? `${fmtBytes(database.last_backup.size)} · ${database.last_backup.name}`
              : "no backups in " + database.backup_dir
          }
          tone={backupTone}
        />
        <Tile
          icon={<Bot className="w-3 h-3" />}
          label="IMS pool"
          value={counts.ims_pool_size.toLocaleString()}
          hint={`${ims_bot.active_assigned ?? 0} assigned · scrape ${ims_bot.interval_sec ?? "?"}s`}
          tone={poolTone}
        />
        <Tile
          icon={<Clock className="w-3 h-3" />}
          label="Last scrape"
          value={fmtAgo(ims_bot.last_scrape_at)}
          hint={`OTP poll every ${ims_bot.otp_interval_sec ?? "?"}s`}
          tone={ims_bot.last_scrape_ok ? "good" : "bad"}
        />
      </div>

      {/* Counts row */}
      <div className="flex flex-wrap gap-3 text-xs pt-3 border-t border-white/[0.04]">
        <span className="text-muted-foreground">
          Active sessions:
          <span className="ml-1.5 font-mono font-semibold text-foreground">{counts.active_sessions}</span>
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-muted-foreground">
          Pending withdrawals:
          <span className={cn(
            "ml-1.5 font-mono font-semibold",
            counts.pending_withdrawals > 0 ? "text-neon-amber" : "text-neon-green"
          )}>
            {counts.pending_withdrawals}
          </span>
        </span>
        {ims_bot.consec_fail && ims_bot.consec_fail > 0 && (
          <>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-destructive">
              Consec fails: <span className="font-mono font-semibold">{ims_bot.consec_fail}</span>
            </span>
          </>
        )}
      </div>

      {/* Last error */}
      {ims_bot.last_error && (
        <div className="flex items-start gap-2 text-xs p-2.5 rounded-md bg-destructive/5 border border-destructive/20">
          <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-destructive mb-0.5">IMS bot last error</p>
            <p className="text-destructive/80 font-mono break-words">{ims_bot.last_error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
