import { Link } from "wouter";
import { Scale, Shield, FileText, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={`${basePath}/logo.svg`} alt="CSC" className="h-9 w-9" />
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Civil Service Commission</p>
              <p className="text-xs text-gray-500">Office of Legal Affairs</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about"><span className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer hidden sm:inline">About</span></Link>
            <Link href="/services"><span className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer hidden sm:inline">Services</span></Link>
            <Link href="/track-case"><span className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer hidden sm:inline">Track Case</span></Link>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">File a Case</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-700/50 text-blue-100 px-3 py-1 rounded-full text-sm mb-6">
              <Shield className="h-3.5 w-3.5" />
              Official Government System
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Legal Case Management System
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              File and track civil service complaints, administrative cases, and legal matters with the Office of Legal Affairs of the Civil Service Commission.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/sign-up">
                <Button size="lg" className="bg-white text-blue-800 hover:bg-blue-50 font-semibold">
                  File a Case <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  Track Existing Case
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">A transparent, efficient process for resolving civil service legal matters</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: "File Your Case", desc: "Submit your complaint or legal matter online. Provide all necessary details and supporting documents." },
              { icon: Scale, title: "Legal Review", desc: "Our team of lawyers reviews your case, conducts hearings, and keeps you updated throughout." },
              { icon: CheckCircle, title: "Resolution", desc: "Receive a formal decision on your case with full documentation and audit trail." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { label: "Cases Filed", value: "10,000+" },
              { label: "Cases Resolved", value: "8,500+" },
              { label: "Legal Staff", value: "50+" },
              { label: "Response Time", value: "< 3 days" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold mb-1">{s.value}</div>
                <div className="text-blue-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Types of Cases We Handle</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Administrative Complaints",
              "Disciplinary Cases",
              "Civil Service Violations",
              "Appeal Proceedings",
              "Protest Cases",
              "Requests for Clearance",
            ].map((s) => (
              <div key={s} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                <span className="text-gray-700 font-medium">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to File Your Case?</h2>
          <p className="text-gray-600 mb-6">Create an account to begin the case filing process. It's free and only takes a few minutes.</p>
          <Link href="/sign-up">
            <Button size="lg" className="font-semibold">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={`${basePath}/logo.svg`} alt="CSC" className="h-7 w-7 opacity-80" />
            <span className="text-sm">Civil Service Commission — Office of Legal Affairs</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Republic of the Philippines. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
