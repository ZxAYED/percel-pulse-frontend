import { Download, FileDown } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select } from "../../components/ui/select";
import { SectionTitle } from "../../components/ui/title";
import { adminBookings, adminReports } from "../../data/admin";
import { toastError, toastSuccess } from "../../lib/utils";
import { exportAdminParcelsCsv, exportAdminParcelsPdf, exportAdminUsersCsv, exportAdminUsersPdf } from "../../services/reports";

export default function Reports() {
  const [entity, setEntity] = useState<"parcels" | "users">("parcels");
  const [downloading, setDownloading] = useState<"csv" | "pdf" | null>(null);

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

  const onExport = (format: "csv" | "pdf") => {
    setDownloading(format);
    const runner =
      entity === "parcels"
        ? format === "csv"
          ? exportAdminParcelsCsv
          : exportAdminParcelsPdf
        : format === "csv"
          ? exportAdminUsersCsv
          : exportAdminUsersPdf;

    runner()
      .then(({ blob, filename }) => {
        saveBlob(blob, filename);
        toastSuccess("Export downloaded");
      })
      .catch((err) => {
        toastError(err, "Failed to export");
      })
      .finally(() => setDownloading(null));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle>Reports</SectionTitle>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-48">
            <Select
              value={entity}
              onChange={(v) => setEntity(v as "parcels" | "users")}
              options={[
                { label: "Parcels", value: "parcels" },
                { label: "Users", value: "users" },
              ]}
            />
          </div>
          <Button variant="secondary" disabled={downloading !== null} onClick={() => onExport("csv")} className="gap-2">
            <FileDown size={16} /> Export CSV
          </Button>
          <Button variant="secondary" disabled={downloading !== null} onClick={() => onExport("pdf")} className="gap-2">
            <Download size={16} /> Export PDF
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Monthly stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {adminReports.map((item) => (
              <div key={item.label}>
                <div className="text-muted-foreground">{item.label}</div>
                <div className="text-2xl font-bold text-foreground">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 h-2 rounded-full bg-secondary">
            <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-primary to-emerald-300" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Performance against SLA target of 95%.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bookings & exports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {adminBookings.map((item) => (
            <div key={item.title} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {item.badge}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
