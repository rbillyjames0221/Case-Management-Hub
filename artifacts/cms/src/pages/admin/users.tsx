import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Users, Search, UserPlus, X, Trash2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserItem } from "@/types/api";

const ROLES = ["USER", "STAFF", "LAWYER", "LEGAL_ADMIN", "SUPER_ADMIN"];
const ROLE_COLORS: Record<string, string> = {
  USER: "bg-gray-100 text-gray-700",
  STAFF: "bg-blue-100 text-blue-700",
  LAWYER: "bg-purple-100 text-purple-700",
  LEGAL_ADMIN: "bg-orange-100 text-orange-700",
  SUPER_ADMIN: "bg-red-100 text-red-700",
};

interface InviteForm {
  emailAddress: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>({
    emailAddress: "",
    firstName: "",
    lastName: "",
    role: "USER",
  });
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: currentUser } = useCurrentUser();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, roleFilter],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      return apiFetch(`/auth/users?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const token = await getToken();
      return apiFetch(`/auth/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role updated" });
    },
    onError: (err: Error) => toast({ title: "Failed to update role", description: err.message, variant: "destructive" }),
  });

  const deactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = await getToken();
      return apiFetch(`/auth/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User deactivated" });
    },
    onError: (err: Error) => toast({ title: "Failed to deactivate", description: err.message, variant: "destructive" }),
  });

  const inviteMutation = useMutation({
    mutationFn: async (form: InviteForm) => {
      const token = await getToken();
      return apiFetch("/auth/users", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast({ title: "Invitation sent", description: `An invite email has been sent to ${inviteForm.emailAddress}` });
      setShowInvite(false);
      setInviteForm({ emailAddress: "", firstName: "", lastName: "", role: "USER" });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: Error) => toast({ title: "Failed to send invite", description: err.message, variant: "destructive" }),
  });

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-500 text-sm">Manage system users and their roles</p>
          </div>
          <Button onClick={() => setShowInvite(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
        </div>

        {showInvite && (
          <Card className="border-blue-100">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Invite New User</CardTitle>
              <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1 block">Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="user@agency.gov.ph"
                    value={inviteForm.emailAddress}
                    onChange={(e) => setInviteForm({ ...inviteForm, emailAddress: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Role</Label>
                  <select
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">First Name</Label>
                  <Input
                    placeholder="Juan"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Last Name</Label>
                  <Input
                    placeholder="dela Cruz"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  disabled={!inviteForm.emailAddress.trim() || inviteMutation.isPending}
                  onClick={() => inviteMutation.mutate(inviteForm)}
                >
                  {inviteMutation.isPending ? "Sending…" : "Send Invitation"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowInvite(false)}>Cancel</Button>
              </div>
              <p className="text-xs text-gray-400">
                The user will receive an email invitation and their account will be created with the selected role when they accept.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border border-input rounded-md px-3 py-2 text-sm bg-white">
            <option value="">All Roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{data?.total ?? 0} users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : !data?.users?.length ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 uppercase">Joined</th>
                      {isSuperAdmin && <th className="py-2.5 px-2" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(data.users as UserItem[]).map((u) => (
                      <tr key={u.id} className={`hover:bg-gray-50 ${!u.isActive ? "opacity-50" : ""}`}>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2.5">
                            {u.imageUrl ? (
                              <img src={u.imageUrl} alt="" className="h-7 w-7 rounded-full" />
                            ) : (
                              <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                                {(u.firstName?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium text-gray-900">
                              {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-600">{u.email}</td>
                        <td className="py-3 px-2">
                          {isSuperAdmin && u.id !== currentUser?.id ? (
                            <select
                              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                              value={u.role}
                              onChange={(e) => roleMutation.mutate({ userId: u.id, role: e.target.value })}
                            >
                              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                          ) : (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-gray-500 text-xs">{u.department ?? "—"}</td>
                        <td className="py-3 px-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-xs text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString("en-PH")}
                        </td>
                        {isSuperAdmin && (
                          <td className="py-3 px-2">
                            {u.id !== currentUser?.id && u.isActive && (
                              <button
                                onClick={() => {
                                  if (confirm(`Deactivate ${u.email}? They will lose access to the system.`)) {
                                    deactivateMutation.mutate(u.id);
                                  }
                                }}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                                title="Deactivate user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
