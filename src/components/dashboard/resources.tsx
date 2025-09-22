import {
  createNewFolder,
  getObjectsByParentId,
  getRootLevelObjects,
  uploadFileAPI,
} from "@/api/objects";
import { useAuth } from "@/context/AuthContext";
import CustomError from "@/lib/CustomError";
import type { Object, ObjectPath } from "@/lib/interfaces";
import { useEffect, useState } from "react";
import { ErrorPage } from "../common/error";
import { ActionButtons } from "./action_buttons";
import { LoadingPage } from "../common/loading";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { ResourcesList } from "./ResourcesList";
import { ArrowLeft } from "lucide-react";

interface ResourcesProps {
  ids: ObjectPath[];
  setIds: React.Dispatch<React.SetStateAction<ObjectPath[]>>;
}

export const Resources = ({ ids, setIds }: ResourcesProps) => {
  const { user } = useAuth();

  const [objects, setObjects] = useState<Object[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFolderClick = async (id: ObjectPath) => {
    setIds((prev) => [...prev, id]);
  };

  const fetchObjects = async () => {
    setLoading(true);
    try {
      if (ids.length === 0) {
        const data = await getRootLevelObjects();
        setObjects(data);
      } else {
        const data = await getObjectsByParentId(ids[ids.length - 1].id);
        setObjects(data);
      }
    } catch (err) {
      setError((err as CustomError).message);
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (name: string) => {
    try {
      await createNewFolder({
        name,
        parentId: ids.length === 0 ? undefined : ids[ids.length - 1].id,
      });
      toast.success("Successfully created folder in current directory");
      await fetchObjects();
    } catch (err) {
      if (err instanceof CustomError) {
        toast.error(err.message);
      } else if (err instanceof AxiosError) {
        toast.error(err.message);
      } else {
        toast.error("Some unusual error occured. Please try again later.");
      }
    }
  };

  const uploadFile = async (file: File) => {
    try {
      await uploadFileAPI({
        file,
        parentId: ids.length === 0 ? undefined : ids[ids.length - 1].id,
      });
      toast.success("Successfully uploaded file.");
    } catch (err) {
      if (err instanceof CustomError) {
        toast.error(err.message);
      } else if (err instanceof AxiosError) {
        toast.error(err.message);
      } else {
        toast.error("Some unusual error occured. Try again later.");
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchObjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ids]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={new Error(error)} onRetry={fetchObjects} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-3 h-full"
    >
      {/* Top bar with path + back button */}
      <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
        {/* Back Button */}
        <button
          onClick={() => setIds((prev) => prev.slice(0, -1))}
          disabled={ids.length === 0}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition
            ids.length === 0 ? "text-gray-50" : ""
          `}
        >
          <ArrowLeft />
        </button>

        {/* Path */}
        <div className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
          <span
            onClick={() => setIds([])}
            className="cursor-pointer font-semibold hover:underline"
          >
            root
          </span>
          {ids.map((folderId, index) => (
            <span key={folderId.id} className="flex items-center gap-1">
              <span className="text-gray-400">/</span>
              <span
                onClick={() =>
                  setIds(ids.slice(0, index + 1) as unknown as ObjectPath[])
                }
                className="cursor-pointer hover:underline"
              >
                {folderId.name}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Action buttons (upload, create folder) */}
      <ActionButtons createFolder={createFolder} uploadFile={uploadFile} />

      {/* Resources list */}
      <div className="h-full space-y-2">
        {objects.length === 0 ? (
          <p>No resources found. Start by uploading or creating new ones!</p>
        ) : (
          <ResourcesList
            resourceArray={objects}
            handleFolderClick={handleFolderClick}
          />
        )}
      </div>
    </motion.div>
  );
};
