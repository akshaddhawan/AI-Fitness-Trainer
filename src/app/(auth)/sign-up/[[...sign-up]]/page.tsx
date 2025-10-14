"use client";

import { SignUp } from "@clerk/nextjs";
import { useAppServices } from "@/providers/AppServicesProvider";
import LocalSignUp from "@/components/LocalSignUp";

const SignUpPage = () => {
  const { isCloudActive } = useAppServices();

  return (
    <main className="flex min-h-screen w-full items-center justify-center pt-24 pb-12">
      {isCloudActive ? <SignUp /> : <LocalSignUp />}
    </main>
  );
};

export default SignUpPage;
