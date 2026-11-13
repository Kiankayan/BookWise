import { motion } from "motion/react";
import { BookOpen, Tag, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";

type AuthBrandPanelProps = {
  variant: "login" | "register";
};

function AuthBrandPanel({ variant }: AuthBrandPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="auth-brand-panel">
      <div className="auth-brand">
        <div className="auth-brand-logo">B</div>
        <div className="auth-brand-text">
          <span>BookWise</span>
        </div>
      </div>

      <div className="auth-brand-content">
        <p className="auth-brand-description">
          {t(`${variant}.brandDescription`)}
        </p>

        <h1>{t(`${variant}.heroTitle`)}</h1>

        <p>{t(`${variant}.heroDescription`)}</p>

        <motion.img
          className="auth-illustration"
          src="/images/bookwise-auth-illustration.png"
          alt="Illustration of books representing BookWise"
          animate={{
            y: [0, -12, 0],
            rotate: [0, -1.5, 1.5, 0],
            scale: [1, 1.025, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="auth-features">
          <div className="auth-feature">
            <span className="auth-feature-icon">
              <BookOpen size={13} />
            </span>
            <span>{t(`${variant}.featureManage`)}</span>
          </div>

          <div className="auth-feature">
            <span className="auth-feature-icon">
              <Tag size={13} />
            </span>
            <span>{t(`${variant}.featureBorrow`)}</span>
          </div>

          <div className="auth-feature">
            <span className="auth-feature-icon">
              <UserRound size={13} />
            </span>
            <span>{t(`${variant}.featureLoans`)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthBrandPanel;
