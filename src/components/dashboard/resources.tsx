import {
  createNewFolder,
  getObjectsByParentId,
  getRootLevelObjects,
  uploadFileAPI,
} from "@/api/objects";
import { useAuth } from "@/context/AuthContext";
import CustomError from "@/lib/CustomError";
import type { Object, ObjectPath } from "@/lib/interfaces";
import { ErrorPage } from "../common/error";
import { ActionButtons } from "./action_buttons";
import { LoadingPage } from "../common/loading";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { ResourcesList } from "./ResourcesList";
import { ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface ResourcesProps {
  ids: ObjectPath[];
  setIds: React.Dispatch<React.SetStateAction<ObjectPath[]>>;
}

export const Resources = ({ ids, setIds }: ResourcesProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Current folder key (root = "root")
  const currentFolderId = ids.length === 0 ? "root" : ids[ids.length - 1].id;

  // Fetch objects for current folder
  const {
    data: objects = [],
    error,
    isLoading,
    refetch,
  } = useQuery<Object[], Error>({
    queryKey: ["resources", currentFolderId],
    queryFn: async () => {
      if (currentFolderId === "root") {
        return await getRootLevelObjects();
      }
      return await getObjectsByParentId(currentFolderId);
    },
    enabled: !!user, // only run if user exists
    staleTime: 1000 * 60 * 5, // cache for 5 mins
  });

  // Mutation: Create Folder
  const createFolderMutation = useMutation({
    mutationFn: (name: string) =>
      createNewFolder({
        name,
        parentId: currentFolderId === "root" ? undefined : currentFolderId,
      }),
    onSuccess: () => {
      toast.success("Successfully created folder in current directory");
      queryClient.invalidateQueries({
        queryKey: ["resources", currentFolderId],
      });
    },
    onError: (err: unknown) => {
      if (err instanceof CustomError) {
        toast.error(err.message);
      } else if (err instanceof AxiosError) {
        toast.error(err.message);
      } else {
        toast.error("Some unusual error occurred. Please try again later.");
      }
    },
  });

  // Mutation: Upload File
  const uploadFileMutation = useMutation({
    mutationFn: (file: File) =>
      uploadFileAPI({
        file,
        parentId: currentFolderId === "root" ? undefined : currentFolderId,
      }),
    onSuccess: () => {
      toast.success("Successfully uploaded file.");
      queryClient.invalidateQueries({
        queryKey: ["resources", currentFolderId],
      });
    },
    onError: (err: unknown) => {
      if (err instanceof CustomError) {
        toast.error(err.message);
      } else if (err instanceof AxiosError) {
        toast.error(err.message);
      } else {
        toast.error("Some unusual error occurred. Try again later.");
      }
    },
  });

  // TODO: Implement deleteResourceAPI in @/api/objects.ts
  const deleteResourceMutation = useMutation({
    mutationFn: (id: string) => {
      console.log("Deleting resource with id:", id);
      // return deleteResourceAPI(id);
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success("Successfully deleted resource.");
      queryClient.invalidateQueries({
        queryKey: ["resources", currentFolderId],
      });
      setSelectedId(null); // Deselect after deletion
    },
    onError: (err: unknown) => {
      if (err instanceof CustomError) {
        toast.error(err.message);
      } else if (err instanceof AxiosError) {
        toast.error(err.message);
      } else {
        toast.error("Some unusual error occurred. Try again later.");
      }
    },
  });

  const handleFolderClick = (id: ObjectPath) => {
    setIds((prev) => [...prev, id]);
    setSelectedId(null);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <ErrorPage error={new Error(error.message)} onRetry={() => refetch()} />
    );
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
          onClick={() => {
            setIds((prev) => prev.slice(0, -1));
            setSelectedId(null);
          }}
          disabled={ids.length === 0}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
            ids.length === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <ArrowLeft />
        </button>

        {/* Path */}
        <div className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
          <span
            onClick={() => {
              setIds([]);
              setSelectedId(null);
            }}
            className="cursor-pointer font-semibold hover:underline"
          >
            root
          </span>
          {ids.map((folder, index) => (
            <span key={folder.id} className="flex items-center gap-1">
              <span className="text-gray-400">/</span>
              <span
                onClick={() => {
                  setIds(ids.slice(0, index + 1) as ObjectPath[]);
                  setSelectedId(null);
                }}
                className="cursor-pointer hover:underline"
              >
                {folder.name}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Action buttons (upload, create folder) */}
      <ActionButtons
        createFolder={(name) =>
          new Promise<void>((resolve, reject) => {
            createFolderMutation.mutate(name, {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            });
          })
        }
        uploadFile={(file) =>
          new Promise<void>((resolve, reject) => {
            uploadFileMutation.mutate(file, {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            });
          })
        }
        selectedId={selectedId}
        handleDelete={() => {
          if (selectedId) {
            deleteResourceMutation.mutate(selectedId);
          }
        }}
      />

      {/* Resources list */}
      <div className="h-full space-y-2">
        {objects.length === 0 ? (
          <p>No resources found. Start by uploading or creating new ones!</p>
        ) : (
          <ResourcesList
            resourceArray={objects}
            handleFolderClick={handleFolderClick}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
      </div>
    </motion.div>
  );
};
