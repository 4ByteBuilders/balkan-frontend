import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getObjectsByParentId,
  getRootLevelObjects,
  createNewFolder,
} from "@/api/objects";
import type { Object, ObjectPath } from "@/lib/interfaces";
import { ArrowLeft, Folder, Loader2, BadgePlus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { CreateFolderModal } from "./CreateFolder";
import CustomError from "@/lib/CustomError";
import { AxiosError } from "axios";

interface MoveResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (destinationId: string | undefined) => void;
  isMoving: boolean;
  resourceToMove: Object | null;
  sourceParentId: string;
}

// A simplified list to show only folders for navigation
const MoveTargetList = ({
  folders,
  onFolderClick,
}: {
  folders: Object[];
  onFolderClick: (path: ObjectPath) => void;
}) => {
  return (
    <div className="border rounded-md p-2 h-64 overflow-y-auto bg-white">
      {folders.map((folder) => (
        <div
          key={folder.id}
          onClick={() => onFolderClick({ id: folder.id, name: folder.name })}
          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
        >
          <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className="truncate">{folder.name}</span>
        </div>
      ))}
      {folders.length === 0 && (
        <p className="text-sm text-gray-500 text-center p-4">
          No sub-folders here.
        </p>
      )}
    </div>
  );
};

export const MoveResourceModal = ({
  isOpen,
  onClose,
  onMove,
  isMoving,
  resourceToMove,
  sourceParentId,
}: MoveResourceModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [ids, setIds] = useState<ObjectPath[]>([]);
  const [openCreateFolderModal, setOpenCreateFolderModal] = useState(false);

  const currentFolderId = ids.length === 0 ? "root" : ids[ids.length - 1].id;

  const { data: folders = [], isLoading } = useQuery<Object[], Error>({
    queryKey: ["resources-move-modal", currentFolderId],
    queryFn: async () => {
      const allObjects =
        currentFolderId === "root"
          ? await getRootLevelObjects()
          : await getObjectsByParentId(currentFolderId);
      // Show only folders, and don't show the folder being moved
      return allObjects.filter(
        (obj: { type: string; id: string | undefined }) =>
          obj.type === "folder" && obj.id !== resourceToMove?.id
      );
    },
    enabled: !!user && isOpen,
    staleTime: 1000 * 60, // 1 minute
  });

  const createFolderMutation = useMutation({
    mutationFn: (name: string) =>
      createNewFolder({
        name,
        parentId: currentFolderId === "root" ? undefined : currentFolderId,
      }),
    onSuccess: () => {
      toast.success("Folder created successfully.");
      queryClient.invalidateQueries({
        queryKey: ["resources-move-modal", currentFolderId],
      });
    },
    onError: (err: unknown) => {
      if (err instanceof CustomError || err instanceof AxiosError) {
        toast.error(err.message);
      } else {
        toast.error("An error occurred while creating the folder.");
      }
    },
  });

  const handleFolderClick = (id: ObjectPath) => setIds((prev) => [...prev, id]);
  const handleBack = () => setIds((prev) => prev.slice(0, -1));

  const handleMoveClick = () => {
    const destinationId = currentFolderId;
    const apiDestinationId =
      destinationId === "root" ? undefined : destinationId;

    if (destinationId === sourceParentId) {
      toast.error("This item is already in the destination folder.");
      return;
    }

    if (
      resourceToMove?.type === "folder" &&
      ids.some((p) => p.id === resourceToMove.id)
    ) {
      toast.error("You cannot move a folder into one of its own subfolders.");
      return;
    }

    onMove(apiDestinationId);
  };

  const handleClose = () => {
    setIds([]); // Reset path on close
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Move "{resourceToMove?.name}"</DialogTitle>
          <DialogDescription>
            Select a destination folder and click "Move Here".
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {/* Navigation and Path */}
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              disabled={ids.length === 0}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 text-sm text-gray-600 truncate mx-2">
              <span
                onClick={() => setIds([])}
                className="cursor-pointer hover:underline font-semibold"
              >
                root
              </span>
              {ids.map((folder, index) => (
                <span key={folder.id} className="flex items-center gap-1">
                  <span className="text-gray-400">/</span>
                  <span
                    onClick={() => setIds(ids.slice(0, index + 1))}
                    className="cursor-pointer hover:underline truncate"
                  >
                    {folder.name}
                  </span>
                </span>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenCreateFolderModal(true)}
              title="Create New Folder"
            >
              <BadgePlus className="h-5 w-5" />
            </Button>
          </div>

          {/* Folder List */}
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <MoveTargetList
              folders={folders}
              onFolderClick={handleFolderClick}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleMoveClick} disabled={isMoving}>
            {isMoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Move Here
          </Button>
        </DialogFooter>

        {openCreateFolderModal && (
          <CreateFolderModal
            createFolder={(name) =>
              new Promise<void>((resolve, reject) => {
                createFolderMutation.mutate(name, {
                  onSuccess: () => resolve(),
                  onError: (error) => reject(error),
                });
              })
            }
            toggle={setOpenCreateFolderModal}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
