import { ArrowRight, Route } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SectionTitle } from "../../components/ui/title";
import { adminAssignments } from "../../data/admin";

export default function Assignments() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>Assignments</SectionTitle>
          <p className="text-sm text-muted-foreground">Ensure the correct agent owns every parcel without losing context.</p>
        </div>
        <Button className="gap-2">
          <Route size={16} /> Assign agent
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {adminAssignments.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.id}</p>
                <p className="text-xs text-muted-foreground">{item.status} · {item.lane}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">Agent: {item.agent}</span>
                <ArrowRight size={16} className="text-primary" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
