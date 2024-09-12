import { useState } from "react";
import { api } from "~/utils/api";
import { useCustomSession } from "~/utils/customAuth";
import { useRouter } from "next/router";

interface ConsentAgreementPopupProps {
  onAccept: () => void;
}

export default function ConsentAgreementPopup({
  onAccept,
}: ConsentAgreementPopupProps) {
  const { session } = useCustomSession();
  const router = useRouter();

  const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptAgreementMutation = api.user.acceptConsentAgreement.useMutation({
    onSuccess: () => {
      onAccept();
    },
    onError: (error) => {
      console.error("Error accepting consent agreement:", error);
      setError("Failed to accept the agreement. Please try again.");
    },
  });

  const handleAccept = () => {
    if (!session) {
      console.error("User is not signed in");
      router.push("/auth/signin");
      return;
    }

    if (isAgreementAccepted) {
      acceptAgreementMutation.mutate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">Consent Agreement</h2>
        <p className="mb-4">
          By using Totally Rad Blog, you agree to our Terms of Service and
          Privacy Policy. Please read them carefully before proceeding.
        </p>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAgreementAccepted}
              onChange={(e) => setIsAgreementAccepted(e.target.checked)}
              className="mr-2"
            />
            I have read and agree to the Terms of Service and Privacy Policy
          </label>
        </div>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <button
          onClick={handleAccept}
          disabled={!isAgreementAccepted || acceptAgreementMutation.isLoading}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
        >
          {acceptAgreementMutation.isLoading
            ? "Processing..."
            : "Accept and Continue"}
        </button>
      </div>
    </div>
  );
}
