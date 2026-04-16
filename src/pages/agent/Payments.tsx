import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, ArrowDownToLine, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MIN_WITHDRAW = 500;

const statusBadge = (s: string) => cn(
  "px-2 py-0.5 rounded text-xs font-semibold uppercase",
  s === "pending" && "bg-neon-amber/15 text-neon-amber",
  s === "approved" && "bg-neon-green/15 text-neon-green",
  s === "rejected" && "bg-destructive/15 text-destructive",
);

const AgentPayments = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const balance = user?.balance ?? 0;

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bkash");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [note, setNote] = useState("");

  const { data: payData, isLoading } = useQuery({ queryKey: ["my-payments"], queryFn: () => api.payments.mine() });
  const { data: wdData } = useQuery({ queryKey: ["my-withdrawals"], queryFn: () => api.withdrawals.mine(), refetchInterval: 30000 });

  const submit = useMutation({
    mutationFn: () => api.withdrawals.request({
      amount_bdt: Number(amount), method,
      account_name: accountName || undefined,
      account_number: accountNumber,
      note: note || undefined,
    }),
    onSuccess: () => {
      toast.success("Withdrawal request submitted — pending admin approval");
      setAmount(""); setAccountName(""); setAccountNumber(""); setNote("");
      qc.invalidateQueries({ queryKey: ["my-withdrawals"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const amt = Number(amount);
  const valid = amt >= MIN_WITHDRAW && amt <= balance && accountNumber.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
          <Wallet className="w-7 h-7 text-neon-amber" /> Payments & Withdrawals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your earnings, request payouts and view all transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard glow="cyan" className="lg:col-span-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Available Balance</p>
          <p className="text-4xl font-display font-bold text-neon-cyan mt-2">৳{balance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-3">Min. withdrawal: ৳{MIN_WITHDRAW}</p>
        </GlassCard>

        <GlassCard glow="magenta" className="lg:col-span-2">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4 text-neon-magenta" /> Request Withdrawal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Amount (৳)</label>
              <Input type="number" step="1" min={MIN_WITHDRAW} max={balance}
                value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`min ${MIN_WITHDRAW}`} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-white/[0.04] border border-white/[0.08]">
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
                <option value="bank">Bank Transfer</option>
                <option value="crypto">Crypto (USDT)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Account Name</label>
              <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Holder name (optional)" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {method === "bank" ? "Account Number" : method === "crypto" ? "Wallet Address" : "Phone Number"}
              </label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Required" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Note (optional)</label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything we should know…" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              {amt > 0 && amt < MIN_WITHDRAW && <span className="text-destructive">Amount must be ≥ ৳{MIN_WITHDRAW}</span>}
              {amt > balance && <span className="text-destructive">Exceeds available balance</span>}
            </p>
            <Button onClick={() => submit.mutate()} disabled={!valid || submit.isPending}
              className="bg-gradient-to-r from-neon-magenta to-primary text-primary-foreground">
              <Send className="w-4 h-4 mr-2" />
              {submit.isPending ? "Submitting…" : "Submit Request"}
            </Button>
          </div>
        </GlassCard>
      </div>

      <div>
        <h2 className="text-lg font-display font-semibold mb-3">Withdrawal History</h2>
        <DataTable
          columns={[
            { key: "created_at", header: "Date", render: (r) => new Date(r.created_at * 1000).toLocaleString() },
            { key: "method", header: "Method", render: (r) => <span className="capitalize">{r.method}</span> },
            { key: "account_number", header: "Account", render: (r) => <span className="font-mono text-xs">{r.account_number}</span> },
            {
              key: "amount_bdt", header: "Amount",
              render: (r) => <span className="font-bold font-mono text-foreground">৳{r.amount_bdt.toFixed(2)}</span>
            },
            { key: "status", header: "Status", render: (r) => <span className={statusBadge(r.status)}>{r.status}</span> },
            { key: "admin_note", header: "Admin Note", render: (r) => <span className="text-xs text-muted-foreground">{r.admin_note || "—"}</span> },
          ]}
          data={wdData?.withdrawals || []}
        />
      </div>

      <div>
        <h2 className="text-lg font-display font-semibold mb-3">Transaction Ledger</h2>
        <DataTable
          columns={[
            { key: "created_at", header: "Date", render: (r) => new Date(r.created_at * 1000).toLocaleString() },
            {
              key: "type", header: "Type",
              render: (r) => (
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-semibold uppercase",
                  r.type === "topup" && "bg-neon-green/15 text-neon-green",
                  r.type === "debit" && "bg-destructive/15 text-destructive",
                  r.type === "refund" && "bg-neon-amber/15 text-neon-amber",
                  r.type === "withdrawal" && "bg-neon-magenta/15 text-neon-magenta",
                  r.type === "credit" && "bg-neon-cyan/15 text-neon-cyan",
                )}>{r.type}</span>
              ),
            },
            { key: "method", header: "Method", render: (r) => r.method || "—" },
            { key: "reference", header: "Ref", render: (r) => <span className="font-mono text-xs">{r.reference || "—"}</span> },
            {
              key: "amount_bdt", header: "Amount",
              render: (r) => (
                <span className={cn("font-bold font-mono", r.amount_bdt >= 0 ? "text-neon-green" : "text-destructive")}>
                  {r.amount_bdt >= 0 ? "+" : ""}৳{r.amount_bdt.toFixed(2)}
                </span>
              ),
            },
            { key: "note", header: "Note", render: (r) => <span className="text-xs text-muted-foreground">{r.note || "—"}</span> },
          ]}
          data={payData?.payments || []}
        />
        {isLoading && <p className="text-center text-muted-foreground text-sm">Loading…</p>}
      </div>
    </div>
  );
};

export default AgentPayments;
