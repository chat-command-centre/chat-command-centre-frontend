import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { useRouter } from "next/navigation"; // Changed back to 'next/navigation'
import { useSession } from "next-auth/react";

interface ConsentAgreementPopupProps {
  onAccept: () => void;
}

export default function ConsentAgreementPopup({
  onAccept,
}: ConsentAgreementPopupProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(true);

  const acceptAgreementMutation = api.user.acceptConsentAgreement.useMutation({
    onSuccess: () => {
      onAccept();
      setShowPopup(false);
    },
    onError: (error: unknown) => {
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

  const { data: userData, isLoading: userDataLoading } =
    api.user.getUser.useQuery(undefined, {
      enabled: status === "authenticated",
    });

  useEffect(() => {
    if (
      status !== "authenticated" ||
      userDataLoading ||
      !!userData?.hasAcceptedConsent
    ) {
      setShowPopup(false);
    }
  }, [status, userDataLoading, userData]);

  if (!showPopup) {
    return null;
  }

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
          disabled={!isAgreementAccepted || acceptAgreementMutation.isPending}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
        >
          {acceptAgreementMutation.isPending
            ? "Processing..."
            : "Accept and Continue"}
        </button>
      </div>
    </div>
  );
}
