import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Link } from "wouter";
import { FolderOpen, Search } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/cases/StatusBadge";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { CaseItem, UserItem } from "@/types/api";

const STATUSES = ["", "FILED", "UNDER_REVIEW", "INVESTIGATION", "HEARING_SCHEDULED", "RESOLVED", "ARCHIVED"];

export default function AdminCases() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-cases", search, status, page],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      return apiFetch(`/cases?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    },
  });

  const { data: lawyers } = useQuery<UserItem[]>({
    queryKey: ["lawyers"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/auth/lawyers", { headers: { Authorization: `Bearer ${token}` } });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ caseId, lawyerId }: { caseId: string; lawyerId: string | null }) => {
      const token = await getToken();
      return apiFetch(`/cases/${caseId}/assign-lawyer`, {
        method: "PATCH",
        body: JSON.stringify({ lawyerId }),
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-cases"] });
      toast({ title: "Lawyer assigned" });
    },
    onError: (err: Error) => toast({ title: "Assignment failed", description: err.message, variant: "destructive" }),
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Cases</h1>
          <p className="text-gray-500 text-sm">Manage and review all legal cases</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by title or case number…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border border-input rounded-md px-3 py-2 text-sm bg-white">
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
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No cases found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Case #</th>
                        <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Assign Lawyer</th>
                        <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Filed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(data.cases as CaseItem[]).map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <Link href={`/cases/${c.id}`}>
                              <span className="text-blue-600 font-mono text-xs cursor-pointer hover:underline">{c.caseNumber}</span>
                            </Link>
                          </td>
                          <td className="py-3 px-2 max-w-xs">
                            <Link href={`/cases/${c.id}`}>
                              <span className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 line-clamp-1">{c.title}</span>
                            </Link>
                          </td>
                          <td className="py-3 px-2"><StatusBadge status={c.status} /></td>
                          <td className="py-3 px-2">
                            <span className={`text-xs font-medium ${c.priority === "URGENT" ? "text-red-600" : c.priority === "HIGH" ? "text-orange-600" : "text-gray-600"}`}>
                              {c.priority}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <select
                              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                              value={c.assignedLawyerId ?? ""}
                              onChange={(e) => assignMutation.mutate({ caseId: c.id, lawyerId: e.target.value || null })}
                            >
                              <option value="">Unassigned</option>
                              {lawyers?.map((l) => (
                                <option key={l.id} value={l.id}>
                                  {[l.firstName, l.lastName].filter(Boolean).join(" ")}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-2 text-xs text-gray-500">
                            {new Date(c.createdAt).toLocaleDateString("en-PH")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Page {page}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={data.cases.length < 20}>Next</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
