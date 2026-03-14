"use client";

import { useState, useCallback } from "react";

export function TranslateButton({
  onLanguageChange,
}: {
  onLanguageChange?: (isKorean: boolean) => void;
}) {
  const [isKorean, setIsKorean] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleTranslation = useCallback(async () => {
    if (isKorean) {
      // Restore original — easiest way is to remove the Google Translate cookie and reload
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + window.location.hostname;
      setIsKorean(false);
      onLanguageChange?.(false);
      window.location.reload();
      return;
    }

    setLoading(true);

    // Set cookie for Google Translate
    document.cookie = "googtrans=/en/ko; path=/;";
    document.cookie = "googtrans=/en/ko; path=/; domain=." + window.location.hostname;

    // Inject Google Translate script if not already present
    if (!document.getElementById("google-translate-script")) {
      // Hidden element required by Google Translate
      const div = document.createElement("div");
      div.id = "google_translate_element";
      div.style.display = "none";
      document.body.appendChild(div);

      // Config function
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element"
        );
        // Give it a moment to initialize and translate
        setTimeout(() => {
          setLoading(false);
          setIsKorean(true);
          onLanguageChange?.(true);
        }, 1500);
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    } else {
      // Script already loaded, just reload with the cookie set
      setIsKorean(true);
      onLanguageChange?.(true);
      window.location.reload();
    }
  }, [isKorean, onLanguageChange]);

  return (
    <button
      onClick={toggleTranslation}
      disabled={loading}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        isKorean
          ? "bg-blue-600 text-white hover:bg-blue-500"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } ${loading ? "opacity-50 cursor-wait" : ""}`}
      title={isKorean ? "Switch to English" : "한국어로 번역"}
    >
      {loading ? "..." : isKorean ? "English" : "한국어"}
    </button>
  );
}
