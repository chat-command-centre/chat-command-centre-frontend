import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

export default function EmailVerificationPopup() {
  const { data: session, status } = useSession();
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submitVerification = api.auth.submitEmailVerificationCode.useMutation({
    onSuccess: () => {
      router.reload();
    },
    onError: (error: unknown) => {
      console.error("Error verifying email:", error);
      setError("Failed to verify email. Please try again.");
    },
  });

  const resendVerification = api.auth.resendEmailVerificationCode.useMutation({
    onSuccess: () => {
      setError(null);
      // Optionally, show a success message
    },
    onError: (error: unknown) => {
      console.error("Error resending verification code:", error);
      setError("Failed to resend verification code. Please try again.");
    },
  });

  const { data: userData, isLoading: userDataLoading } =
    api.user.getUser.useQuery(undefined, {
      enabled: status === "authenticated",
    });

  if (
    status !== "authenticated" ||
    userDataLoading ||
    !!userData?.emailVerified
  ) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    submitVerification.mutate({
      email: session?.user?.email ?? "",
      token: verificationCode,
    });
  };

  const handleResend = () => {
    setError(null);
    resendVerification.mutate({ email: session?.user?.email ?? "" });
  };

  const handleClose = () => {
    router.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">Verify Your Email</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            className="w-full rounded border p-2"
          />
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
            disabled={submitVerification.isPending}
          >
            {submitVerification.isPending ? "Verifying..." : "Verify"}
          </button>
        </form>
        <button
          onClick={handleResend}
          className="mt-4 text-blue-600 hover:underline disabled:text-gray-400"
          disabled={resendVerification.isPending}
        >
          {resendVerification.isPending
            ? "Sending..."
            : "Resend verification code"}
        </button>
        <button
          onClick={handleClose}
          className="ml-4 mt-4 text-gray-600 hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
