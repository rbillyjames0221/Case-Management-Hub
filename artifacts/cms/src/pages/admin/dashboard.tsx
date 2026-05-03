import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Link } from "wouter";
import { FolderOpen, Users, Clock, CheckCircle, TrendingUp, Gavel, ArrowRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/cases/StatusBadge";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { CaseItem, HearingItem } from "@/types/api";

function StatCard({ icon: Icon, label, value, color, sub }: { icon: React.ElementType; label: string; value: number; color: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: user } = useCurrentUser();
  const { getToken } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: !!user,
  });

  const { data: recentCases } = useQuery<CaseItem[]>({
    queryKey: ["admin-recent-cases"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/dashboard/my-cases?limit=8", { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: !!user,
  });

  const { data: upcomingHearings } = useQuery<HearingItem[]>({
    queryKey: ["admin-hearings"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/dashboard/upcoming-hearings?limit=5", { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: !!user,
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Office of Legal Affairs — Case Management Overview</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard icon={FolderOpen} label="Total Cases" value={stats?.totalCases ?? 0} color="bg-blue-50 text-blue-600" />
          <StatCard icon={Clock} label="Filed" value={stats?.filedCases ?? 0} color="bg-yellow-50 text-yellow-600" />
          <StatCard icon={TrendingUp} label="Under Review" value={stats?.activeCases ?? 0} color="bg-purple-50 text-purple-600" />
          <StatCard icon={CheckCircle} label="Resolved" value={stats?.resolvedCases ?? 0} color="bg-green-50 text-green-600" />
          <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} color="bg-indigo-50 text-indigo-600" />
          <StatCard icon={Gavel} label="Lawyers" value={stats?.totalLawyers ?? 0} color="bg-orange-50 text-orange-600" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent Cases</CardTitle>
              <Link href="/admin/cases">
                <Button variant="ghost" size="sm" className="text-blue-600 h-7 px-2 text-xs">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!recentCases?.length ? (
                <p className="text-center text-gray-400 py-8 text-sm">No cases yet</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentCases.map((c) => (
                    <Link key={c.id} href={`/cases/${c.id}`}>
                      <div className="py-3 flex items-center justify-between hover:bg-gray-50 px-1 rounded cursor-pointer">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                          <p className="text-xs text-gray-500">{c.caseNumber} · {c.priority}</p>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upcoming Hearings</CardTitle>
            </CardHeader>
            <CardContent>
              {!upcomingHearings?.length ? (
                <p className="text-center text-gray-400 py-6 text-sm">No upcoming hearings</p>
              ) : (
                <div className="space-y-3">
                  {upcomingHearings.map((h) => (
                    <Link key={h.id} href={`/cases/${h.caseId}`}>
                      <div className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100">
                        <p className="text-sm font-medium text-gray-900">{h.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{h.case?.title}</p>
                        <p className="text-xs text-blue-700 mt-1 font-medium">
                          {new Date(h.scheduledAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
