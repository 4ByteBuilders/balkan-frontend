import { BadgePlus, Delete, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { CreateFolderModal } from "../resources/CreateFolder";
import { UploadFileModal } from "../resources/UploadFolder";

interface ActionButtonsProps {
  createFolder: (name: string) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
}

export const ActionButtons = ({
  createFolder,
  uploadFile,
}: ActionButtonsProps) => {
  const [openCreateFolderModal, setOpenCreateFolderModal] =
    useState<boolean>(false);

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
      <Button variant="outline">
        <Delete />
        Delete
      </Button>
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
