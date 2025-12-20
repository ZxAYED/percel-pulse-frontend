import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { SectionTitle } from "../../components/ui/title";
import { cn, toastError } from "../../lib/utils";
import type { AdminUser, ApiRole } from "../../services/types";
import { listAdminUsers } from "../../services/users";

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState<ApiRole | "">("");
  const [meta, setMeta] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const debounce = window.setTimeout(() => {
      listAdminUsers({
        page,
        limit,
        searchTerm: searchTerm || undefined,
        role: role || undefined,
      })
        .then((res) => {
          if (!mounted) return;
          setUsers(res.data);
          setMeta(res.meta);
        })
        .catch((err) => {
          if (!mounted) return;
          setUsers([]);
          setMeta(null);
          setError("Failed to load users");
          toastError(err, "Failed to load users");
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
  }, [limit, page, role, searchTerm]);

  const totalPages = meta?.totalPages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  };

  const initialsFor = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");

  const roleTone: Record<ApiRole, string> = {
    ADMIN: "bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-200",
    AGENT: "bg-cyan-100 text-cyan-700 ring-1 ring-inset ring-cyan-200",
    CUSTOMER: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>Users</SectionTitle>
          <p className="text-sm text-muted-foreground">View all users and bookings that belong to them.</p>
        </div>
       
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr,220px,140px]">
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search users…" />
          <Select
            value={role}
            onChange={(v) => setRole(v as ApiRole | "")}
            options={[
              { label: "All roles", value: "" },
              { label: "Admin", value: "ADMIN" },
              { label: "Agent", value: "AGENT" },
              { label: "Customer", value: "CUSTOMER" },
            ]}
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
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && (
            <div className="space-y-2 rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="h-4 w-40 animate-pulse rounded-full bg-secondary" />
                <div className="h-8 w-36 animate-pulse rounded-full bg-secondary" />
              </div>
              <div className="h-10 w-full animate-pulse rounded-xl bg-secondary" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-secondary" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-secondary" />
            </div>
          )}
          {error && !loading && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}
          {!loading && !error && users.length === 0 && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-secondary px-4 py-3">
              <p className="text-sm text-muted-foreground">No users found.</p>
            </div>
          )}
          {!loading && !error && users.length > 0 && (
            <>
              {/* Mobile cards */}
              <div className="grid gap-3 md:hidden">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm transition hover:shadow-md"
                  >
                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/15" />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/15">
                          {initialsFor(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", roleTone[user.role])}>
                              {user.role}
                            </span>
                            {user.isVerified !== undefined && (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
                                  user.isVerified ? "bg-blue-100 text-blue-700 ring-blue-200" : "bg-slate-100 text-slate-700 ring-slate-200"
                                )}
                              >
                                <span className={cn("h-1.5 w-1.5 rounded-full", user.isVerified ? "bg-blue-600" : "bg-slate-500")} />
                                {user.isVerified ? "Verified" : "Unverified"}
                              </span>
                            )}
                            {user.isActive !== undefined && (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
                                  user.isActive ? "bg-emerald-100 text-emerald-700 ring-emerald-200" : "bg-rose-100 text-rose-700 ring-rose-200"
                                )}
                              >
                                <span className={cn("h-1.5 w-1.5 rounded-full", user.isActive ? "bg-emerald-600" : "bg-rose-600")} />
                                {user.isActive ? "Active" : "Inactive"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>Created: {formatDate(user.createdAt)}</div>
                        <div>Last login: {formatDate(user.lastLoginAt)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white shadow-sm md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-[920px] w-full text-sm">
                    <thead className="bg-white/80 backdrop-blur">
                      <tr className="border-b border-[hsl(var(--border))] text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">User ID</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Last login</th>
                        <th className="px-5 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border))]">
                      {users.map((user, idx) => (
                        <tr
                          key={user.id}
                          className={cn(
                            "group transition",
                            idx % 2 === 0 ? "bg-white" : "bg-secondary/30",
                            "hover:bg-primary/5"
                          )}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/15">
                                {initialsFor(user.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-semibold text-foreground">{user.name}</div>
                                <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", roleTone[user.role])}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{user.id}</td>
                          <td className="px-5 py-3">
                            <div className="flex flex-wrap gap-2">
                              {user.isVerified !== undefined && (
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
                                    user.isVerified ? "bg-blue-100 text-blue-700 ring-blue-200" : "bg-slate-100 text-slate-700 ring-slate-200"
                                  )}
                                >
                                  <span className={cn("h-1.5 w-1.5 rounded-full", user.isVerified ? "bg-blue-600" : "bg-slate-500")} />
                                  {user.isVerified ? "Verified" : "Unverified"}
                                </span>
                              )}
                              {user.isActive !== undefined && (
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
                                    user.isActive ? "bg-emerald-100 text-emerald-700 ring-emerald-200" : "bg-rose-100 text-rose-700 ring-rose-200"
                                  )}
                                >
                                  <span className={cn("h-1.5 w-1.5 rounded-full", user.isActive ? "bg-emerald-600" : "bg-rose-600")} />
                                  {user.isActive ? "Active" : "Inactive"}
                                </span>
                              )}
                              {user.isActive === undefined && user.isVerified === undefined && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{formatDate(user.lastLoginAt)}</td>
                          <td className="px-5 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
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
