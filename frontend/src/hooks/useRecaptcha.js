// frontend/src/hooks/useRecaptcha.js
// Custom React-18-compatible reCAPTCHA v2 hook
// Injects the Google reCAPTCHA script directly — no third-party package required.

import { useEffect, useRef, useCallback, useState } from "react";

const RECAPTCHA_SCRIPT_ID = "google-recaptcha-script";

export const useRecaptcha = (siteKey) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [token, setToken] = useState("");
  const [isReady, setIsReady] = useState(false);

  const resetCaptcha = useCallback(() => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetIdRef.current);
      setToken("");
    }
  }, []);

  useEffect(() => {
    if (!siteKey) return;

    // Callback that Google reCAPTCHA calls once the API is ready
    window.__recaptchaOnLoad = () => {
      setIsReady(true);
    };

    // Inject the script if it hasn't been injected yet
    if (!document.getElementById(RECAPTCHA_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = RECAPTCHA_SCRIPT_ID;
      script.src = `https://www.google.com/recaptcha/api.js?onload=__recaptchaOnLoad&render=explicit`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (window.grecaptcha && window.grecaptcha.render) {
      // Script already loaded
      setIsReady(true);
    }

    return () => {
      // Cleanup the global callback on unmount
      delete window.__recaptchaOnLoad;
    };
  }, [siteKey]);

  useEffect(() => {
    if (!isReady || !containerRef.current || !siteKey) return;
    if (widgetIdRef.current !== null) return; // Already rendered

    widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
      sitekey: siteKey,
      callback: (value) => setToken(value || ""),
      "expired-callback": () => setToken(""),
      "error-callback": () => setToken(""),
    });
  }, [isReady, siteKey]);

  return { containerRef, token, resetCaptcha };
};
