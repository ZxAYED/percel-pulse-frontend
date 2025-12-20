import { ArrowRight, Route } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Select } from "../../components/ui/select";
import { SectionTitle } from "../../components/ui/title";
import { toastError, toastSuccess } from "../../lib/utils";
import { assignAgentAdmin, listAdminAssignments } from "../../services/assignments";
import type { AdminAssignment } from "../../services/types";

export default function Assignments() {
  const [parcelId, setParcelId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<AdminAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [meta, setMeta] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const debounce = window.setTimeout(() => {
      listAdminAssignments({ page, limit, searchTerm: searchTerm || undefined })
        .then((res) => {
          if (!mounted) return;
          setAssignments(res.data);
          setMeta(res.meta);
        })
        .catch((err) => {
          if (!mounted) return;
          setAssignments([]);
          setMeta(null);
          setError("Failed to load assignments");
          toastError(err, "Failed to load assignments");
        })
        .finally(() => {
          if (!mounted) return;
          setLoading(false);
        });
    }, 250);
    return () => {
      mounted = false;
      window.clearTimeout(debounce);
    };
  }, [limit, page, searchTerm]);

  const totalPages = meta?.totalPages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>Assignments</SectionTitle>
          <p className="text-sm text-muted-foreground">Ensure the correct agent owns every parcel without losing context.</p>
        </div>
        <Popover
          onOpenChange={(open) => {
            if (!open) return;
            setParcelId("");
            setAgentId("");
          }}
        >
          <PopoverTrigger asChild>
            <Button className="gap-2">
              <Route size={16} /> Assign agent
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[360px]">
            <div className="space-y-3">
              <div className="text-sm font-semibold">Assign agent</div>
              <Input value={parcelId} onChange={(e) => setParcelId(e.target.value)} placeholder="Parcel ID" />
              <Input value={agentId} onChange={(e) => setAgentId(e.target.value)} placeholder="Agent ID" />
              <Button
                className="w-full"
                disabled={submitting || !parcelId.trim() || !agentId.trim()}
                onClick={() => {
                  const nextParcelId = parcelId.trim();
                  const nextAgentId = agentId.trim();
                  setSubmitting(true);
                  assignAgentAdmin({ parcelId: nextParcelId, agentId: nextAgentId })
                    .then((res) => {
                      toastSuccess(res, "Agent assigned");
                    })
                    .catch((err) => {
                      toastError(err, "Failed to assign agent");
                    })
                    .finally(() => setSubmitting(false));
                }}
              >
                Assign
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr,140px]">
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search assignments…" />
          <Select
            value={String(limit)}
            onChange={(v) => setLimit(Number(v))}
            options={[
              { label: "10 / page", value: "10" },
              { label: "20 / page", value: "20" },
              { label: "50 / page", value: "50" },
            ]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3">
              <p className="text-sm text-muted-foreground">Loading assignments...</p>
            </div>
          )}
          {error && !loading && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}
          {!loading && !error && assignments.length === 0 && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3">
              <p className="text-sm text-muted-foreground">No assignments found.</p>
            </div>
          )}
          {!loading &&
            !error &&
            assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{a.parcel?.trackingNumber ?? a.parcelId}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.parcel?.pickupAddress ?? ""}</p>
                  <p className="text-xs text-muted-foreground">{a.assignedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                    Agent: {a.agent?.name ?? a.agentId}
                  </span>
                  <ArrowRight size={16} className="text-primary" />
                </div>
              </div>
            ))}
          {!loading && !error && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-sm">
              <div className="text-muted-foreground">
                Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled={!canPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Prev
                </Button>
                <Button variant="secondary" size="sm" disabled={!canNext} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
