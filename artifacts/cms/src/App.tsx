import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import ServicesPage from "@/pages/services";
import TrackCasePage from "@/pages/track-case";
import UserDashboard from "@/pages/user/dashboard";
import UserCases from "@/pages/user/cases";
import FileCasePage from "@/pages/user/file-case";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCases from "@/pages/admin/cases";
import AdminUsers from "@/pages/admin/users";
import AdminAuditLogs from "@/pages/admin/audit-logs";
import LawyerDashboard from "@/pages/lawyer/dashboard";
import LawyerCases from "@/pages/lawyer/cases";
import CaseDetailPage from "@/pages/case-detail";
import NotFound from "@/pages/not-found";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(221, 83%, 53%)",
    colorForeground: "hsl(222, 47%, 11%)",
    colorMutedForeground: "hsl(215, 16%, 47%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorBackground: "hsl(0, 0%, 100%)",
    colorInput: "hsl(214, 32%, 91%)",
    colorInputForeground: "hsl(222, 47%, 11%)",
    colorNeutral: "hsl(214, 32%, 91%)",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-gray-900 font-bold",
    headerSubtitle: "text-gray-500",
    socialButtonsBlockButtonText: "text-gray-700",
    formFieldLabel: "text-gray-700 font-medium",
    footerActionLink: "text-blue-600 hover:text-blue-700",
    footerActionText: "text-gray-500",
    dividerText: "text-gray-400",
    identityPreviewEditButton: "text-blue-600",
    formFieldSuccessText: "text-green-600",
    alertText: "text-gray-700",
    logoBox: "mb-2",
    logoImage: "h-12 w-auto",
    socialButtonsBlockButton: "border border-gray-200 hover:bg-gray-50",
    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
    formFieldInput: "border-gray-200 bg-white text-gray-900",
    footerAction: "border-t border-gray-100",
    dividerLine: "bg-gray-200",
    alert: "bg-red-50 border border-red-200",
    otpCodeFieldInput: "border-gray-200",
    formFieldRow: "gap-2",
    main: "p-6",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function DashboardRedirect() {
  const { data: user, isLoading } = useCurrentUser();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (!user) return <Redirect to="/" />;
  if (user.role === "SUPER_ADMIN" || user.role === "LEGAL_ADMIN") return <Redirect to="/admin/dashboard" />;
  if (user.role === "LAWYER") return <Redirect to="/lawyer/dashboard" />;
  return <Redirect to="/dashboard" />;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><DashboardRedirect /></Show>
      <Show when="signed-out"><HomePage /></Show>
    </>
  );
}

function LoadingSpinner() {
  return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out"><Redirect to="/" /></Show>
    </>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Redirect to="/" />;
  if (user.role !== "SUPER_ADMIN" && user.role !== "LEGAL_ADMIN") return <Redirect to="/dashboard" />;
  return <>{children}</>;
}

function LawyerRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Redirect to="/" />;
  if (user.role !== "LAWYER" && user.role !== "SUPER_ADMIN" && user.role !== "LEGAL_ADMIN") return <Redirect to="/dashboard" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/about" component={AboutPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/track-case" component={TrackCasePage} />
      <Route path="/login"><Redirect to="/sign-in" /></Route>
      <Route path="/register"><Redirect to="/sign-up" /></Route>
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />

      {/* User/Citizen routes */}
      <Route path="/dashboard">
        <ProtectedRoute><UserDashboard /></ProtectedRoute>
      </Route>
      <Route path="/my-cases">
        <ProtectedRoute><UserCases /></ProtectedRoute>
      </Route>
      <Route path="/file-case">
        <ProtectedRoute><FileCasePage /></ProtectedRoute>
      </Route>

      {/* Admin routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>
      </Route>
      <Route path="/admin/cases">
        <ProtectedRoute><AdminRoute><AdminCases /></AdminRoute></ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute><AdminRoute><AdminUsers /></AdminRoute></ProtectedRoute>
      </Route>
      <Route path="/admin/audit-logs">
        <ProtectedRoute><AdminRoute><AdminAuditLogs /></AdminRoute></ProtectedRoute>
      </Route>

      {/* Lawyer routes */}
      <Route path="/lawyer/dashboard">
        <ProtectedRoute><LawyerRoute><LawyerDashboard /></LawyerRoute></ProtectedRoute>
      </Route>
      <Route path="/lawyer/cases">
        <ProtectedRoute><LawyerRoute><LawyerCases /></LawyerRoute></ProtectedRoute>
      </Route>

      {/* Shared */}
      <Route path="/cases/:id">
        <ProtectedRoute><CaseDetailPage /></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "Sign in to OLA-CMS", subtitle: "Office of Legal Affairs Case Management System" } },
        signUp: { start: { title: "Create your account", subtitle: "Join the Office of Legal Affairs CMS" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}
