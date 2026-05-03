import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useParams, Link } from "wouter";
import {
  ArrowLeft, Paperclip, MessageSquare, Calendar, Clock,
  Upload, Send, Plus, FileText, Video
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/cases/StatusBadge";
import { apiFetch, apiUpload } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import type { NoteItem, FileItem, MessageItem, HearingItem, TimelineItem, CaseItem } from "@/types/api";

type Tab = "overview" | "files" | "messages" | "hearings" | "timeline";

const STATUSES = ["FILED", "UNDER_REVIEW", "INVESTIGATION", "HEARING_SCHEDULED", "RESOLVED", "ARCHIVED"];

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: currentUser } = useCurrentUser();
  const [tab, setTab] = useState<Tab>("overview");
  const [messageText, setMessageText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [hearingForm, setHearingForm] = useState({
    title: "", scheduledAt: "", location: "", isVirtual: false, meetingUrl: "", description: ""
  });
  const [showHearingForm, setShowHearingForm] = useState(false);

  const isAdmin = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "LEGAL_ADMIN";
  const isLawyer = currentUser?.role === "LAWYER";
  const isStaff = currentUser?.role === "STAFF";
  const canManage = isAdmin || isLawyer || isStaff;

  const { data: caseData, isLoading } = useQuery<CaseItem>({
    queryKey: ["case", id],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch(`/cases/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    },
  });

  const { data: notes } = useQuery<NoteItem[]>({
    queryKey: ["case-notes", id],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch(`/cases/${id}/notes`, { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: tab === "overview",
  });

  const { data: files } = useQuery<FileItem[]>({
    queryKey: ["case-files", id],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch(`/cases/${id}/files`, { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: tab === "files",
  });

  const { data: messages } = useQuery<MessageItem[]>({
    queryKey: ["case-messages", id],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch(`/cases/${id}/messages`, { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: tab === "messages",
  });

  const { data: hearings } = useQuery<HearingItem[]>({
    queryKey: ["case-hearings", id],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch(`/cases/${id}/hearings`, { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: tab === "hearings",
  });

  const { data: timeline } = useQuery<TimelineItem[]>({
    queryKey: ["case-timeline", id],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch(`/cases/${id}/timeline`, { headers: { Authorization: `Bearer ${token}` } });
    },
    enabled: tab === "timeline",
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const token = await getToken();
      return apiFetch(`/cases/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case", id] });
      qc.invalidateQueries({ queryKey: ["case-timeline", id] });
      toast({ title: "Status updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiFetch(`/cases/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: messageText }),
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      setMessageText("");
      qc.invalidateQueries({ queryKey: ["case-messages", id] });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiFetch(`/cases/${id}/notes`, {
        method: "POST",
        body: JSON.stringify({ content: noteText, isInternal }),
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      setNoteText("");
      qc.invalidateQueries({ queryKey: ["case-notes", id] });
      toast({ title: "Note added" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const scheduleHearingMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiFetch(`/cases/${id}/hearings`, {
        method: "POST",
        body: JSON.stringify(hearingForm),
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      setShowHearingForm(false);
      setHearingForm({ title: "", scheduledAt: "", location: "", isVirtual: false, meetingUrl: "", description: "" });
      qc.invalidateQueries({ queryKey: ["case-hearings", id] });
      toast({ title: "Hearing scheduled" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "OTHER");
      return apiUpload(`/cases/${id}/files`, formData);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-files", id] });
      toast({ title: "File uploaded" });
    },
    onError: (err: Error) => toast({ title: "Upload failed", description: err.message, variant: "destructive" }),
  });

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: FileText },
    { key: "files", label: "Files", icon: Paperclip },
    { key: "messages", label: "Messages", icon: MessageSquare },
    { key: "hearings", label: "Hearings", icon: Calendar },
    { key: "timeline", label: "Timeline", icon: Clock },
  ];

  const backHref = isAdmin ? "/admin/cases" : isLawyer ? "/lawyer/cases" : "/my-cases";

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AppLayout>
    );
  }

  if (!caseData) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <p className="text-gray-500">Case not found.</p>
          <Link href={backHref}><Button variant="outline" className="mt-4">Go Back</Button></Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="shrink-0 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" />Back
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{caseData.title}</h1>
              <StatusBadge status={caseData.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {caseData.caseNumber} · Filed {new Date(caseData.createdAt).toLocaleDateString("en-PH")}
              {caseData.category && ` · ${caseData.category}`}
            </p>
          </div>
          {canManage && (
            <div className="shrink-0">
              <select
                className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white"
                value={caseData.status}
                onChange={(e) => statusMutation.mutate(e.target.value)}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Case info strip */}
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-white rounded-lg border border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">Priority</p>
            <p className={`font-semibold ${caseData.priority === "URGENT" ? "text-red-600" : caseData.priority === "HIGH" ? "text-orange-600" : "text-gray-700"}`}>
              {caseData.priority}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">Assigned Lawyer</p>
            <p className="font-medium text-gray-700">
              {caseData.assignedLawyer
                ? [caseData.assignedLawyer.firstName, caseData.assignedLawyer.lastName].filter(Boolean).join(" ")
                : "Unassigned"}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">Due Date</p>
            <p className="font-medium text-gray-700">
              {caseData.dueDate ? new Date(caseData.dueDate).toLocaleDateString("en-PH") : "Not set"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  tab === key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {tab === "overview" && (
          <div className="space-y-5">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Description</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {caseData.description || "No description provided."}
                </p>
                {caseData.resolution && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs font-medium text-green-700 mb-1">Resolution</p>
                    <p className="text-sm text-green-800">{caseData.resolution}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notes?.map((note) => (
                  <div key={note.id} className={cn("p-3 rounded-lg text-sm", note.isInternal ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50")}>
                    {note.isInternal && <span className="text-xs font-medium text-yellow-700 mb-1 block">Internal Note</span>}
                    <p className="text-gray-700 whitespace-pre-line">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(note.createdAt).toLocaleString("en-PH")}</p>
                  </div>
                ))}
                <div className="space-y-2 pt-1">
                  <Textarea
                    placeholder="Add a note…"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    {canManage && (
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded" />
                        Internal only
                      </label>
                    )}
                    <Button
                      size="sm"
                      disabled={!noteText.trim() || addNoteMutation.isPending}
                      onClick={() => addNoteMutation.mutate()}
                      className="ml-auto"
                    >
                      Add Note
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "files" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Case Files</CardTitle>
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadMutation.mutate(file);
                    e.target.value = "";
                  }}
                  disabled={uploadMutation.isPending}
                />
                <Button size="sm" asChild>
                  <span>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    {uploadMutation.isPending ? "Uploading…" : "Upload File"}
                  </span>
                </Button>
              </label>
            </CardHeader>
            <CardContent>
              {!files?.length ? (
                <div className="text-center py-10 text-gray-400">
                  <Paperclip className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No files uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{f.originalName}</p>
                        <p className="text-xs text-gray-400">
                          {f.category} · {(f.fileSize / 1024).toFixed(1)} KB · {new Date(f.createdAt).toLocaleDateString("en-PH")}
                        </p>
                      </div>
                      <a
                        href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/api/files/${f.id}`}
                        className="text-xs text-blue-600 hover:underline shrink-0"
                        download
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tab === "messages" && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Case Messages</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {!messages?.length ? (
                  <p className="text-center text-gray-400 py-6 text-sm">No messages yet</p>
                ) : messages.map((msg) => {
                  const isMine = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-sm rounded-2xl px-4 py-2.5 text-sm",
                        isMine ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      )}>
                        {!isMine && msg.sender && (
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {[msg.sender.firstName, msg.sender.lastName].filter(Boolean).join(" ") || "User"}
                          </p>
                        )}
                        <p className="whitespace-pre-line">{msg.content}</p>
                        <p className={cn("text-xs mt-1", isMine ? "text-blue-100" : "text-gray-400")}>
                          {new Date(msg.createdAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message…"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
                      e.preventDefault();
                      sendMessageMutation.mutate();
                    }
                  }}
                />
                <Button
                  size="sm"
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  onClick={() => sendMessageMutation.mutate()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "hearings" && (
          <div className="space-y-4">
            {canManage && (
              <div>
                <Button size="sm" onClick={() => setShowHearingForm(!showHearingForm)}>
                  <Plus className="h-4 w-4 mr-1.5" />Schedule Hearing
                </Button>
                {showHearingForm && (
                  <Card className="mt-3">
                    <CardHeader className="pb-3"><CardTitle className="text-sm">New Hearing</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Title</Label>
                          <Input value={hearingForm.title} onChange={(e) => setHearingForm({ ...hearingForm, title: e.target.value })} placeholder="Hearing title" />
                        </div>
                        <div>
                          <Label className="text-xs">Date & Time</Label>
                          <Input type="datetime-local" value={hearingForm.scheduledAt} onChange={(e) => setHearingForm({ ...hearingForm, scheduledAt: e.target.value })} />
                        </div>
                        <div>
                          <Label className="text-xs">Location</Label>
                          <Input value={hearingForm.location} onChange={(e) => setHearingForm({ ...hearingForm, location: e.target.value })} placeholder="Room or address" />
                        </div>
                        <div>
                          <Label className="text-xs">Meeting URL (optional)</Label>
                          <Input value={hearingForm.meetingUrl} onChange={(e) => setHearingForm({ ...hearingForm, meetingUrl: e.target.value })} placeholder="https://meet.google.com/…" />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={hearingForm.isVirtual} onChange={(e) => setHearingForm({ ...hearingForm, isVirtual: e.target.checked })} />
                        Virtual hearing
                      </label>
                      <Button size="sm" onClick={() => scheduleHearingMutation.mutate()} disabled={!hearingForm.title || !hearingForm.scheduledAt || scheduleHearingMutation.isPending}>
                        {scheduleHearingMutation.isPending ? "Scheduling…" : "Schedule"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {!hearings?.length ? (
              <div className="text-center py-10 text-gray-400">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No hearings scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hearings.map((h) => (
                  <Card key={h.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{h.title}</p>
                            {h.isVirtual && (
                              <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Video className="h-3 w-3" />Virtual
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {new Date(h.scheduledAt).toLocaleString("en-PH", { dateStyle: "full", timeStyle: "short" })}
                          </p>
                          {h.location && <p className="text-sm text-gray-600 mt-0.5">{h.location}</p>}
                          {h.meetingUrl && (
                            <a href={h.meetingUrl} className="text-sm text-blue-600 hover:underline mt-0.5 block" target="_blank" rel="noreferrer">
                              Join Meeting
                            </a>
                          )}
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${h.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                          {h.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "timeline" && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Case Timeline</CardTitle></CardHeader>
            <CardContent>
              {!timeline?.length ? (
                <p className="text-center text-gray-400 py-8 text-sm">No timeline events</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
                  <div className="space-y-4">
                    {timeline.map((event) => (
                      <div key={event.id} className="flex gap-4 relative">
                        <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 shrink-0 z-10">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm font-medium text-gray-900">{event.action.replace(/_/g, " ")}</p>
                          {event.description && <p className="text-sm text-gray-600 mt-0.5">{event.description}</p>}
                          <p className="text-xs text-gray-400 mt-1">{new Date(event.createdAt).toLocaleString("en-PH")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
