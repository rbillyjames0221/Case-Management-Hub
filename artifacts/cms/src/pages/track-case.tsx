import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, ArrowRight, FileText, Clock, CheckCircle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/cases/StatusBadge";
import type { PublicCaseResult } from "@/types/api";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function lookupCase(caseNumber: string): Promise<PublicCaseResult | null> {
  const url = `${BASE}/api/cases/search?q=${encodeURIComponent(caseNumber.trim().toUpperCase())}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Lookup failed");
  const data = await res.json();
  return data ?? null;
}

export default function TrackCasePage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["track-case", submitted],
    queryFn: () => lookupCase(submitted),
    enabled: !!submitted,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(query.trim());
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Nav bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Scale className="h-6 w-6 text-blue-700" />
            <span className="font-bold text-gray-900 text-sm">OLA-CMS</span>
          </div>
        </Link>
        <Link href="/sign-in">
          <Button variant="outline" size="sm">Sign In</Button>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Case</h1>
          <p className="text-gray-500">
            Enter your case number to check the current status of your legal case.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <Input
            placeholder="e.g. CSC-2025-12345"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-white"
          />
          <Button type="submit" disabled={!query.trim() || isLoading} className="gap-2">
            <Search className="h-4 w-4" />
            Track
          </Button>
        </form>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {isError && (
          <Card className="border-red-100">
            <CardContent className="py-8 text-center text-red-500">
              Failed to look up case. Please try again.
            </CardContent>
          </Card>
        )}

        {submitted && !isLoading && !isError && !data && (
          <Card>
            <CardContent className="py-12 text-center text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-gray-600">No case found</p>
              <p className="text-sm mt-1">
                No case matching <strong>{submitted}</strong> was found. Please check the case number and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {data && (
          <Card className="border-blue-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Case Number</p>
                  <p className="font-mono font-bold text-blue-700 text-lg">{data.caseNumber}</p>
                </div>
                <StatusBadge status={data.status} />
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="text-xs text-gray-400 mb-0.5">Last Updated</p>
                <p className="font-medium text-gray-700">
                  {new Date(data.updatedAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>

              {data.status === "RESOLVED" && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-4 py-3 text-sm">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>This case has been resolved.</span>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>Sign in to view full case details, documents, and messages.</span>
                <Link href="/sign-in" className="ml-auto">
                  <Button variant="ghost" size="sm" className="text-blue-600 gap-1 text-xs h-auto py-1">
                    Sign In <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-10 text-center text-sm text-gray-400">
          <p>
            Don&apos;t have a case number?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:underline">Sign in</Link>{" "}
            to file a new case or view all your cases.
          </p>
        </div>
      </div>
    </div>
  );
}
