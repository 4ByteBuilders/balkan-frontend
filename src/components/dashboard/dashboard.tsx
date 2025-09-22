import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Resources } from "@/components/dashboard/resources";
import { useState } from "react";
import type { ObjectPath } from "@/lib/interfaces";

export const Dashboard = () => {
  const { user } = useAuth();
  const [ids, setIds] = useState<ObjectPath[]>([]);
  return (
    <div className="min-h-[calc(100vh-64px)] p-4">
      <h1 className="text-xl font-bold">Welcome {user?.username}!</h1>
      {/* files and folders */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Container for object list */}
        <div className="mt-4 p-4 border rounded-lg shadow-sm bg-secondary h-full">
          <h2 className="text-lg font-semibold mb-2">Your Resources</h2>
          {/* List of objects */}
          <Resources ids={ids} setIds={setIds} />
        </div>
      </motion.div>
    </div>
  );
};
