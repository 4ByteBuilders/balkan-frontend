import type { Object, ObjectPath } from "@/lib/interfaces";
import { File, Folder } from "lucide-react";

interface ResourcesListProps {
  resourceArray: Object[];
  handleFolderClick: (id: ObjectPath) => void;
}

export const ResourcesList = ({
  resourceArray,
  handleFolderClick,
}: ResourcesListProps) => {
  return (
    // main container
    <div className="flex flex-col w-full border">
      {resourceArray.map((item, idx) => (
        // each item
        <div
          className="h-10 border-b flex items-center px-2 hover:bg-gray-200/30 cursor-pointer"
          key={idx}
          onClick={() =>
            handleFolderClick({
              id: item.id,
              name: item.name,
            })
          }
        >
          <div className="flex flex-row gap-3">
            {item.type === "folder" ? <Folder /> : <File />}
            <span>{item.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
