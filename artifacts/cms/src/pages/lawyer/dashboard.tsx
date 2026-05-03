import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Link } from "wouter";
import { Gavel, Clock, CheckCircle, TrendingUp, ArrowRight, Calendar } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/cases/StatusBadge";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { CaseItem, HearingItem } from "@/types/api";

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LawyerDashboard() {
  const { data: user } = useCurrentUser();
  const { getToken } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["lawyer-stats"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: !!user,
  });

  const { data: myCases } = useQuery<CaseItem[]>({
    queryKey: ["lawyer-my-cases"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/dashboard/my-cases?limit=6", { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: !!user,
  });

  const { data: hearings } = useQuery<HearingItem[]>({
    queryKey: ["lawyer-hearings"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/dashboard/upcoming-hearings?limit=5", { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: !!user,
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lawyer Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Counsel"}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Gavel} label="Total Assigned" value={stats?.totalCases ?? 0} color="bg-blue-50 text-blue-600" />
          <StatCard icon={TrendingUp} label="Investigation" value={stats?.activeCases ?? 0} color="bg-purple-50 text-purple-600" />
          <StatCard icon={Clock} label="Hearing Scheduled" value={stats?.scheduledCases ?? 0} color="bg-yellow-50 text-yellow-600" />
          <StatCard icon={CheckCircle} label="Resolved" value={stats?.resolvedCases ?? 0} color="bg-green-50 text-green-600" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">My Cases</CardTitle>
              <Link href="/lawyer/cases">
                <Button variant="ghost" size="sm" className="text-blue-600 h-7 px-2 text-xs">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!myCases?.length ? (
                <p className="text-center text-gray-400 py-8 text-sm">No cases assigned yet</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {myCases.map((c) => (
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
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Hearings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!hearings?.length ? (
                <p className="text-center text-gray-400 py-6 text-sm">No upcoming hearings</p>
              ) : (
                <div className="space-y-3">
                  {hearings.map((h) => (
                    <Link key={h.id} href={`/cases/${h.caseId}`}>
                      <div className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100">
                        <p className="text-sm font-medium text-gray-900">{h.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{h.case?.title}</p>
                        <p className="text-xs text-blue-700 mt-1 font-medium">
                          {new Date(h.scheduledAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {h.location && <p className="text-xs text-gray-500">{h.location}</p>}
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
