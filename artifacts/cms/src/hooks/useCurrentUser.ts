import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";

export interface DbUser {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "SUPER_ADMIN" | "LEGAL_ADMIN" | "LAWYER" | "STAFF" | "USER";
  phone: string | null;
  department: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useCurrentUser() {
  const { isSignedIn, getToken } = useAuth();
  return useQuery<DbUser>({
    queryKey: ["me"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: !!isSignedIn,
  });
}

export function useIsAdmin(user?: DbUser | null) {
  return user?.role === "SUPER_ADMIN" || user?.role === "LEGAL_ADMIN";
}

export function useIsLawyer(user?: DbUser | null) {
  return user?.role === "LAWYER";
}
