import { useState } from "react";
import { useAuth } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Administrative Complaint",
  "Disciplinary Case",
  "Civil Service Violation",
  "Appeal",
  "Protest",
  "Request for Clearance",
  "Other",
];

const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];

export default function FileCasePage() {
  const { getToken } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "NORMAL",
    dueDate: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiFetch("/cases", {
        method: "POST",
        body: JSON.stringify({ ...form, dueDate: form.dueDate || undefined }),
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["my-cases"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ title: "Case filed successfully", description: `Case ${data.caseNumber} has been created.` });
      setLocation(`/cases/${data.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to file case", description: err.message, variant: "destructive" });
    },
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">File a New Case</h1>
          <p className="text-gray-500 text-sm mt-1">Complete the form below to file your legal case with the Office of Legal Affairs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Case Information</CardTitle>
            <CardDescription>Provide as much detail as possible to help process your case</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Case Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  placeholder="Brief description of your case"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                  >
                    <option value="">Select category…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="Describe your case in detail. Include all relevant facts, dates, and parties involved…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Requested Resolution Date (optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={mutation.isPending} className="flex-1">
                  {mutation.isPending ? "Filing…" : "File Case"}
                </Button>
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
