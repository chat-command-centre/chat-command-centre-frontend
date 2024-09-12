import { useState } from "react";
import { useCustomSession } from "~/utils/customAuth";
import { api } from "~/utils/api";

export default function EmailVerificationPopup() {
  const { showVerificationPopup, closeVerificationPopup, session } =
    useCustomSession();
  const [verificationCode, setVerificationCode] = useState("");

  const submitVerification = api.auth.submitEmailVerificationCode.useMutation({
    onSuccess: () => {
      closeVerificationPopup();
    },
  });

  const resendVerification = api.auth.resendEmailVerificationCode.useMutation();

  if (!showVerificationPopup) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVerification.mutate({
      email: session?.user?.email ?? "",
      token: verificationCode,
    });
  };

  const handleResend = () => {
    resendVerification.mutate({ email: session?.user?.email ?? "" });
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
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Verify
          </button>
        </form>
        <button
          onClick={handleResend}
          className="mt-4 text-blue-600 hover:underline"
        >
          Resend verification code
        </button>
        <button
          onClick={closeVerificationPopup}
          className="ml-4 mt-4 text-gray-600 hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
