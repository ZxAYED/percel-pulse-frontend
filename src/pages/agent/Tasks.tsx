import { CheckCircle2, Clock4, Navigation, Package, Shield, XCircle } from "lucide-react";
import { MotionCard } from "../../components/ui/motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageTitle, SectionTitle } from "../../components/ui/title";
import { agentSafety, agentTasks, type AgentTaskStatus } from "../../data/agent";
import { useState } from "react";

const toneByStatus: Record<AgentTaskStatus, string> = {
  "Picked Up": "bg-cyan-100 text-cyan-700",
  "In Transit": "bg-blue-100 text-blue-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Failed: "bg-rose-100 text-rose-700",
};

export default function AgentTasks() {
  const safetyIcons = [Shield, CheckCircle2, Package];
  const statusOptions: AgentTaskStatus[] = ["Picked Up", "In Transit", "Delivered", "Failed"];
  const [tasks, setTasks] = useState(agentTasks);

  const updateStatus = (id: string, status: AgentTaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle>Tasks & COD</PageTitle>
          <p className="text-sm text-muted-foreground">Mark progress, confirm COD, and flag any failed attempts.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" className="gap-2">
            <Clock4 size={16} /> Break
          </Button>
          <Button size="sm" className="gap-2">
            <Navigation size={16} /> Optimize via Google Maps
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <MotionCard>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">Assigned parcels</CardTitle>
            <p className="text-sm text-muted-foreground">Update status: Picked Up, In Transit, Delivered, Failed.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex flex-col gap-2 rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">{task.id}</span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{task.type}</span>
                  </div>
                  <p className="text-sm text-foreground">{task.address}</p>
                  <p className="text-xs text-muted-foreground">Slot {task.slot}{task.cash ? ` • COD ${task.cash}` : ""}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="secondary" className="gap-2">
                    <Navigation size={16} /> Route
                  </Button>
                  <select
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value as AgentTaskStatus)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${toneByStatus[task.status]} border border-[hsl(var(--border))] bg-white`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </CardContent>
        </MotionCard>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <SectionTitle className="text-foreground">Safety & kit</SectionTitle>
              <p className="text-sm text-muted-foreground">Quick pre-ride checklist.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentSafety.map(({ label, status }, idx) => {
                const Icon = safetyIcons[idx % safetyIcons.length];
                return (
                  <div key={label} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                        <Icon size={16} className="text-primary" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{status}</p>
                      </div>
                    </div>
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <SectionTitle className="text-foreground">Failed attempt</SectionTitle>
              <p className="text-sm text-muted-foreground">Log an issue and mark retry.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">No one available</p>
                  <p className="text-xs text-muted-foreground">Add photo / voice note before retry.</p>
                </div>
                <XCircle size={18} className="text-rose-500" />
              </div>
              <Button className="w-full gap-2">
                <Shield size={16} /> Flag and reschedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
