import { Download, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SectionTitle } from "../../components/ui/title";
import { adminBookings, adminReports } from "../../data/admin";

export default function Reports() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle>Reports</SectionTitle>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary">
            <FileDown size={16} /> Export CSV
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary">
            <Download size={16} /> Export PDF
          </button>
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
