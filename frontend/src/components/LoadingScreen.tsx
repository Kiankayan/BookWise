import { motion } from "motion/react";
import "./LoadingScreen.css";

function LoadingScreen() {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="loading-logo"
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{
          opacity: 1,
          scale: [1, 1.05, 1],
          y: [0, -8, 0],
        }}
        transition={{
          opacity: { duration: 0.6 },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        B
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Bookwise
      </motion.h1>

      <p className="loading-subtitle">Library management</p>

      <div className="loading-dots" aria-label="Laddar" role="status">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            animate={{ opacity: [0.35, 1, 0.35], y: [0, -5, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: dot * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default LoadingScreen;
