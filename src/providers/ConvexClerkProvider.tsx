"use client";

import React from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { AppServicesProvider, isCloudActive } from "./AppServicesProvider";
import { ToastProvider } from "@/components/ToastProvider";

let convex: ConvexReactClient | null = null;
try {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (isCloudActive && convexUrl && (convexUrl.startsWith("http://") || convexUrl.startsWith("https://"))) {
    convex = new ConvexReactClient(convexUrl);
  }
} catch (e) {
  console.error("Failed to initialize Convex client:", e);
}

function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  if (!isCloudActive || !convex) {
    return (
      <ToastProvider>
        <AppServicesProvider>
          {children}
        </AppServicesProvider>
      </ToastProvider>
    );
  }

  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexProviderWithClerk client={convex!} useAuth={useAuth}>
        <ToastProvider>
          <AppServicesProvider>
            {children}
          </AppServicesProvider>
        </ToastProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default ConvexClerkProvider;
