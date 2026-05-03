import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Link } from "wouter";
import { FolderOpen, PlusCircle, Search } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/cases/StatusBadge";
import { apiFetch } from "@/lib/api";
import type { CaseItem } from "@/types/api";

const STATUSES = ["", "FILED", "UNDER_REVIEW", "INVESTIGATION", "HEARING_SCHEDULED", "RESOLVED", "ARCHIVED"];

export default function UserCases() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["my-cases", search, status],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      return apiFetch(`/cases?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    },
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Cases</h1>
            <p className="text-gray-500 text-sm">Track the status of all your filed cases</p>
          </div>
          <Link href="/file-case">
            <Button><PlusCircle className="h-4 w-4 mr-2" />File New Case</Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search cases…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-input rounded-md px-3 py-2 text-sm bg-white text-gray-700"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s || "All Statuses"}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {data?.total ?? 0} case{data?.total !== 1 ? "s" : ""} found
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : !data?.cases?.length ? (
              <div className="text-center py-12 text-gray-400">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No cases found</p>
                <p className="text-sm mt-1">Try adjusting your filters or file a new case</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {(data.cases as CaseItem[]).map((c) => (
                  <Link key={c.id} href={`/cases/${c.id}`}>
                    <div className="py-3.5 flex items-start justify-between hover:bg-gray-50 px-1 rounded cursor-pointer gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 text-sm">{c.title}</p>
                          <StatusBadge status={c.status} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{c.caseNumber} · Filed {new Date(c.createdAt).toLocaleDateString("en-PH")}</p>
                        {c.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{c.description}</p>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
