import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Link } from "wouter";
import { FolderOpen, Clock, CheckCircle, Search, PlusCircle, ArrowRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/cases/StatusBadge";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { CaseItem, HearingItem } from "@/types/api";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
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

export default function UserDashboard() {
  const { data: user } = useCurrentUser();
  const { getToken } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: !!user,
  });

  const { data: recentCases } = useQuery<CaseItem[]>({
    queryKey: ["dashboard-my-cases"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/dashboard/my-cases?limit=5", { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: !!user,
  });

  const { data: upcomingHearings } = useQuery<HearingItem[]>({
    queryKey: ["dashboard-upcoming-hearings"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/dashboard/upcoming-hearings?limit=4", { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: !!user,
  });

  const firstName = user?.firstName ?? "there";

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
            <p className="text-gray-500 text-sm mt-0.5">Track and manage your legal cases</p>
          </div>
          <Link href="/file-case">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              File New Case
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FolderOpen} label="Total Cases" value={stats?.totalCases ?? 0} color="bg-blue-50 text-blue-600" />
          <StatCard icon={Clock} label="Filed / Pending" value={stats?.filedCases ?? 0} color="bg-yellow-50 text-yellow-600" />
          <StatCard icon={Search} label="Under Review" value={stats?.underReviewCases ?? 0} color="bg-purple-50 text-purple-600" />
          <StatCard icon={CheckCircle} label="Resolved" value={stats?.resolvedCases ?? 0} color="bg-green-50 text-green-600" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent Cases</CardTitle>
              <Link href="/my-cases">
                <Button variant="ghost" size="sm" className="text-blue-600 h-7 px-2 text-xs">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!recentCases?.length ? (
                <div className="text-center py-8 text-gray-400">
                  <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    No cases yet.{" "}
                    <Link href="/file-case">
                      <span className="text-blue-600 cursor-pointer">File your first case</span>
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCases.map((c) => (
                    <Link key={c.id} href={`/cases/${c.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                          <p className="text-xs text-gray-500">{c.caseNumber}</p>
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
                <div className="text-center py-6 text-gray-400">
                  <p className="text-sm">No upcoming hearings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingHearings.map((h) => (
                    <div key={h.id} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{h.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{h.case?.title}</p>
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        {new Date(h.scheduledAt).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {h.location && <p className="text-xs text-gray-500">{h.location}</p>}
                    </div>
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
