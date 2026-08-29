import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-gray-50 px-6 py-16">
      <Image
        src="/brand/logo-merca-digital.png"
        alt="Merca Digital"
        width={160}
        height={38}
        className="h-8 w-auto"
        priority
      />
      <SignUp fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
