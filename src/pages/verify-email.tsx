import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";

export default function VerifyEmail() {
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      void router.push(`/profile/${session.user.username}`);
    }
  }, [session, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return null;
  }

  const submitVerification = api.auth.submitEmailVerificationCode.useMutation({
    onSuccess: () => {
      router.push("/signin");
    },
    onError: (error) => {
      console.error("Error verifying email:", error);
      setError("Failed to verify email. Please try again.");
    },
  });

  const resendVerification = api.auth.resendEmailVerificationCode.useMutation({
    onSuccess: () => {
      setError(null);
      alert("Verification code resent. Please check your email.");
    },
    onError: (error) => {
      console.error("Error resending verification code:", error);
      setError("Failed to resend verification code. Please try again.");
    },
  });

  useEffect(() => {
    if (router.isReady) {
      const { email: routerEmail, token } = router.query;
      if (typeof routerEmail === "string") {
        setEmail(routerEmail);
      }
      if (typeof token === "string") {
        setVerificationCode(token);
        handleSubmit();
      }
    }
  }, [router.isReady, router.query]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    submitVerification.mutate({ email, token: verificationCode });
  };

  const handleResend = () => {
    setError(null);
    resendVerification.mutate({ email });
  };

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="mb-4 text-2xl font-bold">Verify Your Email</h1>
      <p className="mb-4">
        Please enter the verification code sent to your email.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label htmlFor="verificationCode" className="block">
            Verification Code
          </label>
          <input
            type="text"
            id="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
            className="w-full rounded border p-2"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white"
          disabled={submitVerification.isPending}
        >
          {submitVerification.isPending ? "Verifying..." : "Verify Email"}
        </button>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      <button
        onClick={handleResend}
        className="mt-4 text-blue-600 hover:underline"
        disabled={resendVerification.isPending}
      >
        {resendVerification.isPending
          ? "Sending..."
          : "Resend verification code"}
      </button>
    </div>
  );
}
