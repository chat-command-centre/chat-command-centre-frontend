import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { useEffect, useRef, useState } from "react";
import { createParticleSystem } from "~/utils/particleSystem";
import { Header } from "~/components/Header";
import EmailVerificationPopup from "~/components/EmailVerificationPopup";
import ConsentAgreementPopup from "~/components/ConsentAgreementPopup";
import { CreatePostButton } from "~/components/CreatePostButton";
import { SessionProvider } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "~/components/PageTransition";
import { useRouter } from "next/router";
import { Loader } from "~/components/Loader";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      createParticleSystem(canvasRef.current, theme);
    }

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [theme]);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.body.className = `theme-${newTheme}`;
  };

  return (
    <SessionProvider session={session}>
      <canvas
        id="particle-canvas"
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: -1,
          width: "100%",
          height: "100%",
        }}
      ></canvas>
      <Header onThemeChange={handleThemeChange} />
      <div className={`theme-${theme} pt-20`}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <Loader key="loader" />
          ) : (
            <PageTransition key={router.pathname}>
              <Component {...pageProps} />
            </PageTransition>
          )}
        </AnimatePresence>
      </div>
      <CreatePostButton />
      <EmailVerificationPopup />
      <ConsentAgreementPopup onAccept={() => {}} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
