"use client";

import React from "react";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="animate-page-enter w-full min-h-screen">
      {children}
    </div>
  );
};

export default PageTransition;
