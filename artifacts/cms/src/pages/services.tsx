import { Link } from "wouter";
import { Scale, FileText, Gavel, Users, AlertTriangle, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SERVICES = [
  {
    icon: FileText,
    title: "Administrative Complaints",
    desc: "Filing of formal administrative complaints against civil servants for violations of civil service laws, rules, and regulations.",
    steps: ["File complaint online or in person", "Preliminary investigation by OLA", "Formal charge if evidence warrants", "Hearing and resolution"],
  },
  {
    icon: Gavel,
    title: "Disciplinary Cases",
    desc: "Processing of disciplinary cases for grave misconduct, simple negligence, discourtesy, and other administrative offenses.",
    steps: ["Case assessment and docketing", "Issuance of notice to respondent", "Submission of answer", "Pre-hearing conference and hearing"],
  },
  {
    icon: AlertTriangle,
    title: "Appeal Proceedings",
    desc: "Handling of appeals from decisions of agencies or persons covered by CSC jurisdiction involving disciplinary and non-disciplinary actions.",
    steps: ["Filing of appeal with memorandum", "Evaluation of completeness", "Review of agency decision", "Issuance of CSC resolution"],
  },
  {
    icon: Users,
    title: "Protest Cases",
    desc: "Resolution of protests on appointments, promotions, and personnel actions that may violate CSC rules on merit and fitness.",
    steps: ["File protest within 15 days", "Notification of parties", "Submission of position papers", "Decision on the protest"],
  },
  {
    icon: BookOpen,
    title: "Requests for Legal Opinion",
    desc: "Issuance of legal opinions on matters involving civil service laws, rules, and regulations upon request by government agencies.",
    steps: ["Submit written request", "Review by OLA lawyers", "Preparation of legal opinion", "Issuance of official opinion"],
  },
  {
    icon: Scale,
    title: "Requests for Clearance",
    desc: "Processing of clearances for employees who have pending administrative cases, ensuring compliance prior to separation or retirement.",
    steps: ["Submit clearance request", "Verification of pending cases", "Processing and evaluation", "Issuance of clearance or notation"],
  },
];

export default function ServicesPage() {
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
            <Link href="/about"><span className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">About</span></Link>
            <Link href="/services"><span className="text-sm font-medium text-blue-600 cursor-pointer">Services</span></Link>
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
            <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">Our Services</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Legal Services We Provide</h1>
          <p className="text-xl text-blue-100 max-w-3xl leading-relaxed">
            The Office of Legal Affairs handles a wide range of civil service legal matters. Learn about the services available to government employees and agencies.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <s.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                <div className="space-y-2">
                  {s.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-gray-600">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-blue-50 border-t border-blue-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <CheckCircle className="h-10 w-10 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to File Your Case?</h2>
          <p className="text-gray-600 mb-6">
            Create an account to access our digital case management system and file your case online.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="font-semibold">
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/track-case">
              <Button size="lg" variant="outline">Track Existing Case</Button>
            </Link>
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
