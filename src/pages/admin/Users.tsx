import { UserPlus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SectionTitle } from "../../components/ui/title";
import { adminUsers } from "../../data/admin";

export default function Users() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle>Users</SectionTitle>
          <p className="text-sm text-muted-foreground">View all users and bookings that belong to them.</p>
        </div>
        <Button className="gap-2">
          <UserPlus size={16} /> Add user
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {adminUsers.map((user) => (
            <div key={user.name} className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.tone}`}>{user.status}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
