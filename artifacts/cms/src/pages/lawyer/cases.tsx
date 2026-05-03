import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Link } from "wouter";
import { Gavel, Search } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/cases/StatusBadge";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { CaseItem } from "@/types/api";

const STATUSES = ["", "FILED", "UNDER_REVIEW", "INVESTIGATION", "HEARING_SCHEDULED", "RESOLVED", "ARCHIVED"];
const NEXT_STATUS: Record<string, string[]> = {
  FILED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["INVESTIGATION"],
  INVESTIGATION: ["HEARING_SCHEDULED", "RESOLVED"],
  HEARING_SCHEDULED: ["INVESTIGATION", "RESOLVED"],
};

export default function LawyerCases() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["lawyer-cases", search, status],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      return apiFetch(`/cases?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ caseId, status: newStatus }: { caseId: string; status: string }) => {
      const token = await getToken();
      return apiFetch(`/cases/${caseId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lawyer-cases"] });
      toast({ title: "Status updated" });
    },
    onError: (err: Error) => toast({ title: "Failed to update status", description: err.message, variant: "destructive" }),
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assigned Cases</h1>
          <p className="text-gray-500 text-sm">Manage your assigned legal cases</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search cases…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-input rounded-md px-3 py-2 text-sm bg-white">
            {STATUSES.map((s) => <option key={s} value={s}>{s || "All Statuses"}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{data?.total ?? 0} cases</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : !data?.cases?.length ? (
              <div className="text-center py-12 text-gray-400">
                <Gavel className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No cases found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {(data.cases as CaseItem[]).map((c) => (
                  <div key={c.id} className="py-3.5 flex items-start justify-between gap-4">
                    <Link href={`/cases/${c.id}`} className="flex-1 min-w-0">
                      <div className="cursor-pointer hover:text-blue-600">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 text-sm">{c.title}</p>
                          <StatusBadge status={c.status} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{c.caseNumber} · Filed {new Date(c.createdAt).toLocaleDateString("en-PH")}</p>
                        {c.dueDate && (
                          <p className="text-xs text-orange-600 mt-0.5">Due: {new Date(c.dueDate).toLocaleDateString("en-PH")}</p>
                        )}
                      </div>
                    </Link>
                    {NEXT_STATUS[c.status] && (
                      <div className="shrink-0">
                        <select
                          className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) statusMutation.mutate({ caseId: c.id, status: e.target.value });
                          }}
                        >
                          <option value="">Move to…</option>
                          {NEXT_STATUS[c.status]?.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
