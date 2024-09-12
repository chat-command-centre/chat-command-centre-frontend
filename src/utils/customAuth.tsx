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
  const { data: userData, isLoading: userDataLoading } =
    api.user.getUser.useQuery(undefined, {
      enabled: !!session?.user?.id,
    });

  useEffect(() => {
    if (status === "authenticated" && userData && !userDataLoading) {
      if (!userData.emailVerified) {
        setShowVerificationPopup(true);
        setShowConsentAgreementPopup(false);
      } else if (!userData.hasAcceptedConsent) {
        setShowVerificationPopup(false);
        setShowConsentAgreementPopup(true);
      } else {
        setShowVerificationPopup(false);
        setShowConsentAgreementPopup(false);
      }
    } else {
      setShowVerificationPopup(false);
      setShowConsentAgreementPopup(false);
    }
  }, [status, userData, userDataLoading]);

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
