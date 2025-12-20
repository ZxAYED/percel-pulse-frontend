import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Select } from "../../components/ui/select";
import { SectionTitle } from "../../components/ui/title";
import { toastError, toastSuccess } from "../../lib/utils";
import { assignAgentAdmin } from "../../services/assignments";
import { listAdminParcels, updateAdminParcelStatus } from "../../services/parcels";
import { exportAdminParcelCsv, exportAdminParcelPdf } from "../../services/reports";
import type { AdminParcel, AdminParcelsMeta, AdminUser, ParcelStatus } from "../../services/types";
import { listAdminUsers } from "../../services/users";
export default function Parcels() {
  const [parcels, setParcels] = useState<AdminParcel[]>([]);
  const [meta, setMeta] = useState<AdminParcelsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ParcelStatus | "">("");
  const [statusDraft, setStatusDraft] = useState<Record<string, ParcelStatus>>({});
  const [remarksDraft, setRemarksDraft] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [agents, setAgents] = useState<AdminUser[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentDraft, setAgentDraft] = useState<Record<string, string>>({});
  const [agentSearchDraft, setAgentSearchDraft] = useState<Record<string, string>>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const saveBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const debounce = window.setTimeout(() => {
      listAdminParcels({
        page,
        limit,
        searchTerm: searchTerm || undefined,
        status: statusFilter || undefined,
      })
        .then((data) => {
          if (!mounted) return;
          setParcels(data.data);
          setMeta(data.meta);
          setError(null);
        })
        .catch((err) => {
          if (!mounted) return;
          setError("Failed to load parcels");
          toastError(err, "Failed to load parcels");
          setParcels([]);
          setMeta(null);
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
  }, [limit, page, searchTerm, statusFilter]);

  const refreshParcels = useCallback(() => {
    return listAdminParcels({
      page,
      limit,
      searchTerm: searchTerm || undefined,
      status: statusFilter || undefined,
    })
      .then((data) => {
        setParcels(data.data);
        setMeta(data.meta);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to load parcels");
        toastError(err, "Failed to load parcels");
        setParcels([]);
        setMeta(null);
      });
  }, [limit, page, searchTerm, statusFilter]);

  const loadAgents = useCallback(() => {
    setAgentsLoading(true);
    return listAdminUsers({ page: 1, limit: 200, role: "AGENT" })
      .then((res) => {
        setAgents(res.data);
      })
      .catch((err) => {
        toastError(err, "Failed to load agents");
        setAgents([]);
      })
      .finally(() => {
        setAgentsLoading(false);
      });
  }, []);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  const toneByStatus: Record<string, string> = {
    BOOKED: "bg-slate-200 text-slate-800",
    PICKED_UP: "bg-cyan-100 text-cyan-700",
    IN_TRANSIT: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-emerald-100 text-emerald-700",
    FAILED: "bg-rose-100 text-rose-700",
  };

  const statusOptions = [
    { label: "All statuses", value: "" },
    { label: "Booked", value: "BOOKED" },
    { label: "Picked up", value: "PICKED_UP" },
    { label: "In transit", value: "IN_TRANSIT" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Failed", value: "FAILED" },
  ];

  const statusUpdateOptions = statusOptions.filter((o) => o.value !== "");

  const agentOptions = useMemo(
    () =>
      agents.map((agent) => ({
        label: `${agent.name}${agent.email ? ` · ${agent.email}` : ""}`,
        value: agent.id,
      })),
    [agents]
  );

  const totalPages = meta?.totalPages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>Parcels</SectionTitle>
          <p className="text-sm text-muted-foreground">Monitor every parcel with pinned navigation and glass panels.</p>
        </div>
        {/* <div className="flex gap-2">
          <Button variant="secondary">Import</Button>
          <Button className="gap-2">
            Add parcel <ArrowRight size={16} />
          </Button>
        </div> */}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr,220px,140px]">
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search parcels…" />
          <Select
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as ParcelStatus | "")}
            options={statusOptions}
            placeholder="Status"
          />
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
          <CardTitle>Recent parcels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3">
              <p className="text-sm text-muted-foreground">Loading parcels...</p>
            </div>
          )}
          {error && !loading && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}
          {!loading && !error && parcels.length === 0 && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3">
              <p className="text-sm text-muted-foreground">No parcels found.</p>
            </div>
          )}
          {!loading &&
            !error &&
            parcels.map((parcel) => (
              <div key={parcel.id} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-foreground">{parcel.trackingNumber}</p>
                  <p className="text-xs text-muted-foreground">{parcel.customer?.name ?? parcel.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${toneByStatus[parcel.status] ?? "bg-slate-200 text-slate-800"}`}
                  >
                    {parcel.status}
                  </span>
                  <Popover
                    onOpenChange={(open) => {
                      if (!open) return;
                      setAgentDraft((prev) => (prev[parcel.id] ? prev : { ...prev, [parcel.id]: "" }));
                      setAgentSearchDraft((prev) => ({ ...prev, [parcel.id]: "" }));
                      if (!agentsLoading && agents.length === 0) void loadAgents();
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button  size="sm">
                        Assign agent
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[360px]">
                      <div className="space-y-3">
                        <div className="text-sm font-semibold">Assign agent</div>
                        <Input
                          value={agentSearchDraft[parcel.id] ?? ""}
                          onChange={(e) => setAgentSearchDraft((prev) => ({ ...prev, [parcel.id]: e.target.value }))}
                          placeholder="Search agent…"
                        />
                        <Select
                          value={agentDraft[parcel.id] ?? ""}
                          onChange={(v) => setAgentDraft((prev) => ({ ...prev, [parcel.id]: v }))}
                          options={agentOptions.filter((o) => {
                            const q = (agentSearchDraft[parcel.id] ?? "").trim().toLowerCase();
                            if (!q) return true;
                            return o.label.toLowerCase().includes(q);
                          })}
                          placeholder={agentsLoading ? "Loading agents…" : "Select agent"}
                        />
                        <Button
                          className="w-full"
                          disabled={assigningId === parcel.id || !(agentDraft[parcel.id] ?? "").trim()}
                          onClick={() => {
                            const agentId = (agentDraft[parcel.id] ?? "").trim();
                            if (!agentId) return;
                            setAssigningId(parcel.id);
                            assignAgentAdmin({ parcelId: parcel.id, agentId })
                              .then((res) => {
                                toastSuccess(res, "Agent assigned");
                                void refreshParcels();
                              })
                              .catch((err) => {
                                toastError(err, "Failed to assign agent");
                              })
                              .finally(() => {
                                setAssigningId((curr) => (curr === parcel.id ? null : curr));
                              });
                          }}
                        >
                          Assign
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Popover
                    onOpenChange={(open) => {
                      if (!open) return;
                      setStatusDraft((prev) => (prev[parcel.id] ? prev : { ...prev, [parcel.id]: parcel.status }));
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="secondary" size="sm">
                        Update status
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[360px]">
                      <div className="space-y-3">
                        <div className="text-sm font-semibold">Update parcel status</div>
                        <Select
                          value={statusDraft[parcel.id] ?? parcel.status}
                          onChange={(v) => setStatusDraft((prev) => ({ ...prev, [parcel.id]: v as ParcelStatus }))}
                          options={statusUpdateOptions}
                          placeholder="Select status"
                        />
                        <Input
                          value={remarksDraft[parcel.id] ?? ""}
                          onChange={(e) => setRemarksDraft((prev) => ({ ...prev, [parcel.id]: e.target.value }))}
                          placeholder="Remarks (optional)"
                        />
                        <Button
                          className="w-full"
                          disabled={updatingId === parcel.id}
                          onClick={() => {
                            const nextStatus = statusDraft[parcel.id] ?? parcel.status;
                            const remarks = (remarksDraft[parcel.id] ?? "").trim();
                            setUpdatingId(parcel.id);
                            updateAdminParcelStatus({
                              parcelId: parcel.id,
                              status: nextStatus,
                              remarks: remarks ? remarks : undefined,
                            })
                              .then((updated) => {
                                setParcels((prev) =>
                                  prev.map((p) => (p.id === updated.id ? { ...p, status: updated.status, updatedAt: updated.updatedAt, customer: updated.customer ?? p.customer } : p))
                                );
                                toastSuccess(updated, "Status updated");
                              })
                              .catch((err) => {
                                toastError(err, "Failed to update status");
                              })
                              .finally(() => {
                                setUpdatingId((curr) => (curr === parcel.id ? null : curr));
                              });
                          }}
                        >
                          Save
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={downloadingId === parcel.id}
                            onClick={() => {
                              setDownloadingId(parcel.id);
                              exportAdminParcelCsv({ parcelId: parcel.id })
                                .then(({ blob, filename }) => {
                                  saveBlob(blob, filename);
                                  toastSuccess("CSV downloaded");
                                })
                                .catch((err) => {
                                  toastError(err, "Failed to download CSV");
                                })
                                .finally(() => setDownloadingId(null));
                            }}
                          >
                            Download CSV
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={downloadingId === parcel.id}
                            onClick={() => {
                              setDownloadingId(parcel.id);
                              exportAdminParcelPdf({ parcelId: parcel.id })
                                .then(({ blob, filename }) => {
                                  saveBlob(blob, filename);
                                  toastSuccess("PDF downloaded");
                                })
                                .catch((err) => {
                                  toastError(err, "Failed to download PDF");
                                })
                                .finally(() => setDownloadingId(null));
                            }}
                          >
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
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
