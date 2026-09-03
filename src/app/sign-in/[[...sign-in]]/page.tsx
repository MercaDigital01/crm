import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-md-admin-bg px-6 py-16">
      <span className="rounded-2xl bg-md-admin-cream p-2.5">
        <Image
          src="/brand/logo-merca-digital.png"
          alt="Merca Digital"
          width={160}
          height={38}
          className="h-7 w-auto"
          priority
        />
      </span>
      <SignIn fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
