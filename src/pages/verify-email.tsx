import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function VerifyEmail() {
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const submitVerification = api.auth.submitEmailVerificationCode.useMutation({
    onSuccess: () => {
      router.push("/signin");
    },
  });

  const resendVerification = api.auth.resendEmailVerificationCode.useMutation();

  useEffect(() => {
    if (router.isReady) {
      const { email: routerEmail, token } = router.query;
      if (typeof routerEmail === "string") {
        setEmail(routerEmail);
      }
      if (typeof token === "string") {
        setVerificationCode(token);
      }
      // Only submit if both email and token are available
      if (typeof routerEmail === "string" && typeof token === "string") {
        submitVerification.mutate({ email: routerEmail, token });
      }
    }
  }, [router.isReady, router.query]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    submitVerification.mutate({ email, token: verificationCode });
  };

  const handleResend = () => {
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
        >
          Verify Email
        </button>
      </form>
      <button
        onClick={handleResend}
        className="mt-4 text-blue-600 hover:underline"
      >
        Resend verification code
      </button>
    </div>
  );
}
