"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Hook to protect routes from unauthenticated access
 * Redirects to /login if not authenticated
 * 
 * Usage:
 * ```
 * export default function ProtectedPage() {
 *   useProtectedRoute();
 *   // ... rest of component
 * }
 * ```
 */
export const useProtectedRoute = () => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Wait for auth state to load before checking
    if (loading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Return loading state so components can show spinner
  return { loading };
};

/**
 * Optional: Higher-order component version for more control
 */
export const withProtectedRoute = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function ProtectedComponent(props: P) {
    const { loading } = useProtectedRoute();
    const { isAuthenticated } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect via useEffect
    }

    return <Component {...props} />;
  };
};