"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function useRequireAuth() {
  const router = useRouter();
  const { organization, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !organization) {
      router.replace("/login");
    }
  }, [isLoading, organization, router]);

  return { organization, isLoading, isReady: !isLoading && !!organization };
}
