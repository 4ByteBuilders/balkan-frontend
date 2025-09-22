import {
  BadgePlus,
  Delete,
  FilePenLine,
  Loader2,
  Move,
  Upload,
} from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateFolderModal } from "../resources/CreateFolder";
import { UploadFileModal } from "../resources/UploadFolder";

interface ActionButtonsProps {
  createFolder: (name: string) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  selectedId: string | null;
  isDeleting: boolean;
  handleDelete: () => void;
  onMoveClick: () => void;
  onRenameClick: () => void;
}

export const ActionButtons = ({
  createFolder,
  uploadFile,
  selectedId,
  isDeleting,
  handleDelete,
  onMoveClick,
  onRenameClick,
}: ActionButtonsProps) => {
  const [openCreateFolderModal, setOpenCreateFolderModal] =
    useState<boolean>(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [openUploadFile, setOpenUploadFile] = useState<boolean>(false);

  return (
    <div className="flex flex-row gap-2">
      <Button variant="outline" onClick={() => setOpenUploadFile(true)}>
        <Upload />
        Upload File
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          setOpenCreateFolderModal(true);
        }}
      >
        <BadgePlus />
        New Folder
      </Button>
      <Button variant="outline" onClick={onRenameClick} disabled={!selectedId}>
        <FilePenLine />
        Rename
      </Button>
      <Button variant="outline" onClick={onMoveClick} disabled={!selectedId}>
        <Move />
        Move
      </Button>
      <Button
        variant="outline"
        onClick={() => setIsConfirmOpen(true)}
        disabled={!selectedId}
      >
        <Delete />
        Delete
      </Button>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected resource.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {openCreateFolderModal && (
        <CreateFolderModal
          createFolder={createFolder}
          toggle={setOpenCreateFolderModal}
        />
      )}

      {openUploadFile && (
        <UploadFileModal uploadFile={uploadFile} toggle={setOpenUploadFile} />
      )}
    </div>
  );
};
