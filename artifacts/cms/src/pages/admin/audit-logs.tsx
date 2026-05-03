import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { ScrollText } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import type { AuditLogItem } from "@/types/api";

export default function AdminAuditLogs() {
  const [page, setPage] = useState(1);
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch(`/audit-logs?page=${page}&limit=50`, { headers: { Authorization: `Bearer ${token}` } });
    },
  });

  const ACTION_COLORS: Record<string, string> = {
    CREATE: "bg-green-100 text-green-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
    STATUS_CHANGE: "bg-yellow-100 text-yellow-700",
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 text-sm">Complete history of all system actions</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activity History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : !data?.logs?.length ? (
              <div className="text-center py-12 text-gray-400">
                <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No audit logs found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Actor</th>
                        <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Resource</th>
                        <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Resource ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(data.logs as AuditLogItem[]).map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-2 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString("en-PH")}
                          </td>
                          <td className="py-2.5 px-2 text-xs">
                            {log.actor ? (
                              <span className="text-gray-700">{[log.actor.firstName, log.actor.lastName].filter(Boolean).join(" ") || log.actor.email}</span>
                            ) : <span className="text-gray-400">System</span>}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-700"}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-xs text-gray-600 capitalize">{log.resource}</td>
                          <td className="py-2.5 px-2 text-xs text-gray-400 font-mono">
                            {log.resourceId ? `${log.resourceId.slice(0, 8)}…` : "—"}
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
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={data.logs.length < 50}>Next</Button>
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
