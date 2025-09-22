import type { Object, ObjectPath } from "@/lib/interfaces";
import { File, Folder } from "lucide-react";
import dayjs from "dayjs";
import { Checkbox } from "../ui/checkbox";

interface ResourcesListProps {
  resourceArray: Object[];
  handleFolderClick: (id: ObjectPath) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) {
    return "Invalid Date";
  }

  const parsableDate = dateString
    .substring(0, dateString.lastIndexOf(" "))
    .replace(" ", "T");

  return dayjs(parsableDate).format("YYYY-MM-DD");
};

export const ResourcesList = ({
  resourceArray,
  handleFolderClick,
  selectedId,
  onSelect,
}: ResourcesListProps) => {
  const handleSelect = (id: string) => {
    if (selectedId === id) {
      onSelect(null); // Deselect if already selected
    } else {
      onSelect(id); // Select new one
    }
  };

  return (
    <div className="w-full border rounded-lg overflow-hidden">
      {/* Header Row */}
      <div className="grid grid-cols-[min-content_1fr_1fr_1fr_1fr_1fr_1fr] md:grid-cols-[min-content_2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 bg-gray-100 px-3 py-2 font-semibold text-sm text-gray-700 items-center">
        <span className="w-min" />
        <span className="col-span-2 flex items-center">Name</span>
        <span className="hidden sm:block">Type</span>
        <span className="hidden md:block">Owner</span>
        <span className="hidden md:block">Created</span>
        <span className="hidden sm:block">Updated</span>
      </div>

      {/* Data Rows */}
      {resourceArray.map((item) => (
        <div
          key={item.id}
          className={`grid grid-cols-[min-content_1fr_1fr_1fr_1fr_1fr_1fr] md:grid-cols-[min-content_2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 border-t px-3 py-2 text-sm items-center hover:bg-gray-50 cursor-pointer ${
            selectedId === item.id ? "bg-blue-50" : ""
          }`}
          onClick={() => handleSelect(item.id)}
        >
          {/* Checkbox */}
          <div
            className="w-min flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={selectedId === item.id}
              onCheckedChange={() => handleSelect(item.id)}
              className="w-4 h-4 min-w-0"
            />
          </div>

          {/* Name with Icon */}
          <div
            className="col-span-2 flex items-center gap-2"
            onClick={(e) => {
              if (item.type === "folder") {
                e.stopPropagation();
                handleFolderClick({ id: item.id, name: item.name });
              }
            }}
          >
            {item.type === "folder" ? (
              <Folder className="h-4 w-4 text-blue-500" />
            ) : (
              <File className="h-4 w-4 text-gray-600" />
            )}
            <span className="truncate">{item.name}</span>
          </div>

          {/* Type */}
          <span className="hidden sm:block capitalize">
            {item.type === "folder"
              ? "folder"
              : item.mimeType?.split("/")[0] ?? "Unknown"}
          </span>

          {/* Owner */}
          <span className="hidden md:block">{item.owner?.username ?? ""}</span>

          {/* Created Date */}
          <span className="hidden md:block">{formatDate(item.createdAt)}</span>

          {/* Updated Date */}
          <span className="hidden sm:block">{formatDate(item.updatedAt)}</span>
        </div>
      ))}
    </div>
  );
};
