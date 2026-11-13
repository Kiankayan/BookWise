import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

function AuthLanguageSwitch() {
  const { i18n } = useTranslation();

  return (
    <div className="auth-language-switch">
      <button
        type="button"
        className={i18n.language.startsWith("sv") ? "active" : ""}
        onClick={() => i18n.changeLanguage("sv")}
        aria-pressed={i18n.language.startsWith("sv")}
      >
        {i18n.language.startsWith("sv") && (
          <motion.span
            layoutId="auth-language-indicator"
            className="auth-language-indicator"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span>SV</span>
      </button>

      <button
        type="button"
        className={i18n.language.startsWith("en") ? "active" : ""}
        onClick={() => i18n.changeLanguage("en")}
        aria-pressed={i18n.language.startsWith("en")}
      >
        {i18n.language.startsWith("en") && (
          <motion.span
            layoutId="auth-language-indicator"
            className="auth-language-indicator"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span>EN</span>
      </button>
    </div>
  );
}

export default AuthLanguageSwitch;
