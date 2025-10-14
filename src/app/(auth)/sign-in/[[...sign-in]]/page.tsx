"use client";

import { SignIn } from "@clerk/nextjs";
import { useAppServices } from "@/providers/AppServicesProvider";
import LocalSignIn from "@/components/LocalSignIn";

const SignInPage = () => {
  const { isCloudActive } = useAppServices();

  return (
    <main className="flex min-h-screen w-full items-center justify-center pt-24 pb-12">
      {isCloudActive ? <SignIn /> : <LocalSignIn />}
    </main>
  );
};

export default SignInPage;
