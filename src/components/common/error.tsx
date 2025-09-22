import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Redo2 } from "lucide-react";

interface ErrorPageProps {
  error: Error;
  onRetry: () => void;
}

export const ErrorPage = ({ error, onRetry }: ErrorPageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full flex md:text-xl text-center p-4 items-center justify-center flex-col"
    >
      <div className="text-red-600 mb-4">Error: {error.message}</div>
      <Button variant={"outline"} onClick={onRetry}>
        <Redo2 className="mr-2" />
        Retry
      </Button>
    </motion.div>
  );
};
