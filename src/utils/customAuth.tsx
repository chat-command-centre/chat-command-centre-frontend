import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import {
  SessionProvider as NextAuthSessionProvider,
  useSession as useNextAuthSession,
  signOut,
} from "next-auth/react";
import { api } from "~/utils/api";

interface CustomSessionContextType {
  session: any;
  status: "loading" | "authenticated" | "unauthenticated";
  showVerificationPopup: boolean;
  showConsentAgreementPopup: boolean;
  closeVerificationPopup: () => void;
  closeConsentAgreementPopup: () => void;
}

const CustomSessionContext = createContext<
  CustomSessionContextType | undefined
>(undefined);

export function CustomSessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: any;
}) {
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showConsentAgreementPopup, setShowConsentAgreementPopup] =
    useState(false);

  return (
    <NextAuthSessionProvider session={session}>
      <InnerProvider
        showVerificationPopup={showVerificationPopup}
        setShowVerificationPopup={setShowVerificationPopup}
        showConsentAgreementPopup={showConsentAgreementPopup}
        setShowConsentAgreementPopup={setShowConsentAgreementPopup}
      >
        {children}
      </InnerProvider>
    </NextAuthSessionProvider>
  );
}

function InnerProvider({
  children,
  showVerificationPopup,
  setShowVerificationPopup,
  showConsentAgreementPopup,
  setShowConsentAgreementPopup,
}: {
  children: ReactNode;
  showVerificationPopup: boolean;
  setShowVerificationPopup: (show: boolean) => void;
  showConsentAgreementPopup: boolean;
  setShowConsentAgreementPopup: (show: boolean) => void;
}) {
  const { data: session, status } = useNextAuthSession();
  const { data: userData } = api.user.getUser.useQuery(undefined, {
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (session && userData) {
      if (!userData.emailVerified) {
        setShowVerificationPopup(true);
      } else if (!userData.hasAcceptedConsent) {
        setShowConsentAgreementPopup(true);
      }
    }
  }, [session, userData]);

  const closeVerificationPopup = () => setShowVerificationPopup(false);
  const closeConsentAgreementPopup = () => setShowConsentAgreementPopup(false);

  return (
    <CustomSessionContext.Provider
      value={{
        session,
        status,
        showVerificationPopup,
        showConsentAgreementPopup,
        closeVerificationPopup,
        closeConsentAgreementPopup,
      }}
    >
      {children}
    </CustomSessionContext.Provider>
  );
}

export function useCustomSession() {
  const context = useContext(CustomSessionContext);
  if (context === undefined) {
    throw new Error(
      "useCustomSession must be used within a CustomSessionProvider",
    );
  }
  return context;
}
