"use client";

import { useEffect, useRef } from "react";

interface Props {
  verificationCode: string;
  companyName?: string;
  logoUrl?: string;
}

export default function EmbodiTrustWidget({
  verificationCode,
  companyName = "Your Company",
  logoUrl = "",
}: Props) {
  const containerId = `et-widget-${verificationCode}`;
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = () => {
      if (window.EmbodiTrust) {
        instanceRef.current = window.EmbodiTrust.init({
          container: `#${containerId}`,
          verificationCode,
          companyName,
          logoUrl,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://emboditrust.com/widget.js";
      script.async = true;
      script.onload = () => {
        if (window.EmbodiTrust) {
          instanceRef.current = window.EmbodiTrust.init({
            container: `#${containerId}`,
            verificationCode,
            companyName,
            logoUrl,
          });
        }
      };
      document.body.appendChild(script);
    };

    // Wait for the DOM to be ready
    if (document.readyState === "complete") {
      init();
    } else {
      window.addEventListener("load", init);
      return () => window.removeEventListener("load", init);
    }
  }, [verificationCode, companyName, logoUrl, containerId]);

  return <div id={containerId} />;
}
