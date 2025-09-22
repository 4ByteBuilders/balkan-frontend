import {
  createNewFolder,
  deleteResourceAPI,
  moveResourceAPI,
  getObjectsByParentId,
  getRootLevelObjects,
  uploadFileAPI,
  renameResourceAPI,
  searchResourcesAPI,
  type SearchFilters,
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
import { MoveResourceModal } from "../resources/MoveResourceModal";
import { RenameResourceModal } from "../resources/RenameResourceModal";
import { SearchBar } from "./SearchBar";

interface ResourcesProps {
  ids: ObjectPath[];
  setIds: React.Dispatch<React.SetStateAction<ObjectPath[]>>;
}

export const Resources = ({ ids, setIds }: ResourcesProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(
    null
  );
  const isSearching = searchFilters !== null;
  const currentFolderId = ids.length === 0 ? "root" : ids[ids.length - 1].id;

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
    enabled: !!user && !isSearching,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: searchResults = [],
    isLoading: isSearchingLoading,
    error: searchError,
  } = useQuery<Object[], Error>({
    queryKey: ["search-resources", searchFilters],
    queryFn: () => searchResourcesAPI({ filters: searchFilters! }),
    enabled: isSearching,
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

  const deleteResourceMutation = useMutation({
    mutationFn: (id: string) => {
      const fileType = objects.find((obj) => obj.id === id)?.type;
      return deleteResourceAPI({
        id,
        type: fileType === "folder" ? "folder" : "file",
      });
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

  // Mutation: Move Resource
  const moveResourceMutation = useMutation({
    mutationFn: ({
      resourceId,
      parentId,
    }: {
      resourceId: string;
      parentId: string | undefined;
    }) => {
      const resourceToMove = objects.find((obj) => obj.id === resourceId);
      if (!resourceToMove) {
        // This should ideally not happen if an item is selected
        return Promise.reject(
          new Error("Could not find the selected resource to move.")
        );
      }
      return moveResourceAPI({
        object_id: resourceId,
        parent_id: parentId,
        type: resourceToMove.type === "folder" ? "folder" : "file",
      });
    },
    onSuccess: (_, variables) => {
      toast.success("Resource moved successfully.");
      // Invalidate the cache for the source folder (where the item was moved from)
      queryClient.invalidateQueries({
        queryKey: ["resources", currentFolderId],
      });
      // Invalidate the cache for the destination folder (where the item was moved to)
      queryClient.invalidateQueries({
        queryKey: ["resources", variables.parentId || "root"],
      });
      setSelectedId(null);
      setIsMoveModalOpen(false);
    },
    onError: (err: unknown) => {
      if (err instanceof CustomError) {
        toast.error(err.message);
      } else if (err instanceof AxiosError) {
        toast.error(err.message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Some unusual error occurred. Please try again later.");
      }
    },
  });

  // Mutation: Rename Resource
  const renameResourceMutation = useMutation({
    mutationFn: ({
      resourceId,
      newName,
    }: {
      resourceId: string;
      newName: string;
    }) => {
      const resourceToRename =
        displayData.find((obj) => obj.id === resourceId) || null;
      if (!resourceToRename) {
        return Promise.reject(
          new Error("Could not find the selected resource to rename.")
        );
      }
      return renameResourceAPI({
        id: resourceId,
        newName,
        type: resourceToRename.type === "folder" ? "folder" : "file",
      });
    },
    onSuccess: () => {
      toast.success("Resource renamed successfully.");
      queryClient.invalidateQueries({
        queryKey: ["resources", currentFolderId],
      });
      queryClient.invalidateQueries({ queryKey: ["search-resources"] });
      setIsRenameModalOpen(false);
      setSelectedId(null);
    },
    onError: (err: unknown) => {
      if (err instanceof CustomError || err instanceof AxiosError) {
        toast.error(err.message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An error occurred while renaming the resource.");
      }
    },
  });

  const handleFolderClick = (clickedObject: ObjectPath) => {
    if (isSearching) {
      // When a folder is clicked from search results, exit search mode
      // and navigate to that folder from the root.
      // NOTE: This doesn't preserve the folder's full path as the search API
      // doesn't return it. The user will see the folder as if it's at the root.
      setSearchFilters(null);
      setIds([clickedObject]);
    } else {
      setIds((prev) => [...prev, clickedObject]);
    }
    setSelectedId(null);
  };

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setSelectedId(null);
  };

  const clearSearch = () => {
    setSearchFilters(null);
    setSelectedId(null);
  };

  const displayLoading = isLoading || isSearchingLoading;
  const displayError = error || searchError;
  const displayData = isSearching ? searchResults : objects;

  if (displayLoading) {
    return <LoadingPage />;
  }

  if (displayError) {
    return (
      <ErrorPage
        error={new Error(displayError.message)}
        onRetry={() => refetch()}
      />
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
        {isSearching ? (
          <div className="font-semibold text-gray-700">
            Search Results{" "}
            {searchFilters?.name && `for "${searchFilters.name}"`}
          </div>
        ) : (
          <>
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
                className="cursor-pointer hover:underline"
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
          </>
        )}
      </div>

      {/* Action buttons and Search Bar */}
      <div className="flex justify-between items-center gap-4">
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
          onRenameClick={() => setIsRenameModalOpen(true)}
          onMoveClick={() => setIsMoveModalOpen(true)}
          isDeleting={deleteResourceMutation.isPending}
          selectedId={selectedId}
          handleDelete={() => {
            if (selectedId) {
              deleteResourceMutation.mutate(selectedId);
            }
          }}
        />
        <SearchBar
          onSearch={handleSearch}
          isSearching={isSearching}
          clearSearch={clearSearch}
        />
      </div>

      {/* Resources list */}
      <div className="h-full space-y-2">
        {displayData.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            {isSearching
              ? "No results found for your search."
              : "This folder is empty."}
          </p>
        ) : (
          <ResourcesList
            resourceArray={displayData}
            handleFolderClick={handleFolderClick}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
      </div>

      {isMoveModalOpen && (
        <MoveResourceModal
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          resourceToMove={
            displayData.find((obj) => obj.id === selectedId) || null
          }
          isMoving={moveResourceMutation.isPending}
          sourceParentId={currentFolderId}
          onMove={(destinationId) => {
            if (selectedId) {
              moveResourceMutation.mutate({
                resourceId: selectedId,
                parentId: destinationId,
              });
            }
          }}
        />
      )}

      {isRenameModalOpen && (
        <RenameResourceModal
          isOpen={isRenameModalOpen}
          onClose={() => setIsRenameModalOpen(false)}
          currentName={
            displayData.find((obj) => obj.id === selectedId)?.name || ""
          }
          isRenaming={renameResourceMutation.isPending}
          onRename={(newName) => {
            if (selectedId) {
              renameResourceMutation.mutate({
                resourceId: selectedId,
                newName,
              });
            }
          }}
        />
      )}
    </motion.div>
  );
};
