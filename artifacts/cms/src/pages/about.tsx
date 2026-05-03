import { Link } from "wouter";
import { Scale, Shield, Users, Award, Phone, MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src={`${basePath}/logo.svg`} alt="CSC" className="h-9 w-9" />
              <div>
                <p className="font-bold text-gray-900 text-sm leading-tight">Civil Service Commission</p>
                <p className="text-xs text-gray-500">Office of Legal Affairs</p>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/about"><span className="text-sm font-medium text-blue-600 cursor-pointer">About</span></Link>
            <Link href="/services"><span className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">Services</span></Link>
            <Link href="/track-case"><span className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">Track Case</span></Link>
            <Link href="/sign-in"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link href="/sign-up"><Button size="sm">File a Case</Button></Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-blue-300" />
            <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">About Us</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Office of Legal Affairs</h1>
          <p className="text-xl text-blue-100 max-w-3xl leading-relaxed">
            The Office of Legal Affairs (OLA) is the legal arm of the Civil Service Commission, mandated to handle all legal matters, administrative cases, and disciplinary proceedings involving civil service employees.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mandate</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The Civil Service Commission (CSC) is the central personnel agency of the Philippine Government. The Office of Legal Affairs ensures that the rule of law is upheld in all matters affecting civil servants and public employees.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We process administrative complaints, disciplinary cases, appeals, and other legal matters filed against or by government employees, ensuring due process and impartial proceedings.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our digital Case Management System (OLA-CMS) enables transparent, efficient, and accessible legal proceedings for all parties involved.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "Integrity", desc: "We uphold the highest standards of impartiality and due process." },
                { icon: Users, title: "Accessibility", desc: "Legal services made accessible to all civil service employees." },
                { icon: Award, title: "Excellence", desc: "Committed to fair, timely, and well-reasoned legal decisions." },
                { icon: Scale, title: "Justice", desc: "Ensuring equal treatment under the law for all parties." },
              ].map((v) => (
                <div key={v.title} className="bg-blue-50 rounded-xl p-5">
                  <v.icon className="h-7 w-7 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-600">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: MapPin, label: "Address", value: "Constitution Hills, Batasang Pambansa Complex, Quezon City, 1126 Metro Manila" },
              { icon: Phone, label: "Phone", value: "(02) 8951-4981 local 200" },
              { icon: Mail, label: "Email", value: "ola@csc.gov.ph" },
            ].map((c) => (
              <div key={c.label} className="flex gap-3">
                <c.icon className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">{c.label}</p>
                  <p className="text-gray-700 text-sm">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
