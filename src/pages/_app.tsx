import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { useEffect, useRef, useState } from "react";
import { createParticleSystem } from "~/utils/particleSystem";
import { Header } from "~/components/Header";
import { CustomSessionProvider } from "~/utils/customAuth";
import EmailVerificationPopup from "~/components/EmailVerificationPopup";
import ConsentAgreementPopup from "~/components/ConsentAgreementPopup";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      createParticleSystem(canvasRef.current, theme);
    }
  }, [theme]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.body.className = `theme-${newTheme}`;
  };

  return (
    <CustomSessionProvider session={session}>
      <canvas id="particle-canvas" ref={canvasRef}></canvas>
      <Header onThemeChange={handleThemeChange} />
      <div className={`theme-${theme} pt-20`}>
        <Component {...pageProps} />
      </div>
      <EmailVerificationPopup />
      <ConsentAgreementPopup onAccept={() => {}} />
    </CustomSessionProvider>
  );
};

export default api.withTRPC(MyApp);
