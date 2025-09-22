import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export const LoadingPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full flex md:text-xl p-4 items-center justify-center"
    >
      <Loader2 size={40} className="animate-spin mr-2" />
      <h1>We're loading your resources</h1>
    </motion.div>
  );
};
