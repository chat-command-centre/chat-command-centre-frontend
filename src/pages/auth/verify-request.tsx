import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import { api } from "~/utils/api";

export default function VerifyRequest() {
  const router = useRouter();
  const { token } = router.query;
  const { data: session, status } = useSession();
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");

  const verifyEmail = api.auth.verifyEmail.useMutation({
    onSuccess: async () => {
      setVerificationStatus("success");
      // Sign in the user after successful verification
      await signIn("credentials", { callbackUrl: "/" });
    },
    onError: () => {
      setVerificationStatus("error");
    },
  });

  useEffect(() => {
    if (token && typeof token === "string" && status === "unauthenticated") {
      verifyEmail.mutate({ token });
    }
  }, [token, status]);

  useEffect(() => {
    if (status === "authenticated") {
      void router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || verificationStatus === "verifying") {
    return <div>Verifying your email...</div>;
  }

  if (verificationStatus === "error") {
    return (
      <div>
        <h1>Verification Failed</h1>
        <p>
          There was an error verifying your email. The link may have expired or
          been used already.
        </p>
        <p>
          <a href="/auth/signin">Click here to sign in</a> or request a new
          verification email.
        </p>
      </div>
    );
  }

  if (verificationStatus === "success") {
    return (
      <div>
        <h1>Email Verified</h1>
        <p>Your email has been successfully verified. Redirecting...</p>
      </div>
    );
  }

  return null;
}
