import { useState } from "react";
import { motion } from "framer-motion";
import { LoginModal } from "./login";
import { SignUpModal } from "./signup";

interface AuthGateProps {
  onClose: () => void;
}

export const AuthGate = ({ onClose }: AuthGateProps) => {
  const [type, setType] = useState<"login" | "signup">("login");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50"
    >
      {type === "login" ? (
        <LoginModal onClose={onClose} setType={setType} />
      ) : (
        <SignUpModal onClose={onClose} setType={setType} />
      )}
    </motion.div>
  );
};
