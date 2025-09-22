import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { resolveShareLinkAPI, getObjectsByParentId } from "@/api/objects";
import { LoadingPage } from "@/components/common/loading";
import { ErrorPage } from "@/components/common/error";
import { File, Folder, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import type { Object, ObjectPath } from "@/lib/interfaces";
import { useParams } from "react-router";
import { ResourcesList } from "@/components/dashboard/ResourcesList";

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const SharedFolderView = ({ folder }: { folder: Object }) => {
  const [path, setPath] = useState<ObjectPath[]>([]);

  useEffect(() => {
    if (folder) {
      setPath([{ id: folder.id, name: folder.name }]);
    }
  }, [folder]);

  const currentFolderId = path[path.length - 1]?.id;

  const {
    data: children = [],
    isLoading,
    error,
  } = useQuery<Object[], Error>({
    queryKey: ["shared-folder", currentFolderId],
    queryFn: () => getObjectsByParentId(currentFolderId),
    enabled: !!currentFolderId,
  });

  const handleFolderClick = (folder: ObjectPath) => {
    setPath((prev) => [...prev, folder]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setPath((prev) => prev.slice(0, index + 1));
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-8 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap border-b pb-4">
        {path.map((p, i) => (
          <React.Fragment key={p.id}>
            {i > 0 && <span className="text-gray-400">/</span>}
            <button
              onClick={() => handleBreadcrumbClick(i)}
              className={`hover:underline ${
                i === path.length - 1 ? "font-semibold text-gray-800" : ""
              }`}
              disabled={i === path.length - 1}
            >
              {p.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">
          Error loading folder contents.
        </div>
      ) : children.length === 0 ? (
        <p className="text-center text-gray-500 py-8">This folder is empty.</p>
      ) : (
        <ResourcesList
          resourceArray={children}
          handleFolderClick={handleFolderClick}
          selectedId={null}
          onSelect={() => {}}
        />
      )}
    </div>
  );
};

const SharedFileView = ({ resource }: { resource: Object }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const serverBaseUrl =
    import.meta.env.VITE_SERVER_URL?.replace("/query", "") ||
    "http://localhost:8080";
  const downloadUrl = `${serverBaseUrl}/download/${resource.id}`;

  const handleDownload = async () => {
    setIsDownloading(true);
    // Assuming the token is stored in localStorage with the key "token"
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Authentication token not found in localStorage.");
      // Optionally, show a toast message to the user.
      setIsDownloading(false);
      return;
    }

    try {
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = resource.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Download error:", error);
      // Optionally, show a toast message to the user.
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 space-y-6">
      <div className="flex items-center space-x-4">
        {resource.type === "folder" ? (
          <Folder className="h-12 w-12 text-blue-500 flex-shrink-0" />
        ) : (
          <File className="h-12 w-12 text-gray-600 flex-shrink-0" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 break-all">
            {resource.name}
          </h1>
          <p className="text-sm text-gray-500">
            Shared by {resource.owner?.username || "Unknown"}
          </p>
        </div>
      </div>

      <div className="border-t pt-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-600">Size:</span>
          <span className="text-gray-800">
            {formatBytes(resource.sizeBytes ?? 0)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-600">Last updated:</span>
          <span className="text-gray-800">
            {dayjs(resource.updatedAt).format("YYYY-MM-DD HH:mm")}
          </span>
        </div>
      </div>

      {resource.type !== "folder" && (
        <div className="border-t pt-6">
          <Button
            className="w-full"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isDownloading ? "Downloading..." : "Download File"}
          </Button>
        </div>
      )}
    </div>
  );
};

export const SharedResourcePage = () => {
  const { shareToken } = useParams<{ shareToken: string }>();

  const {
    data: resource,
    isLoading,
    error,
    refetch,
  } = useQuery<Object, Error>({
    queryKey: ["shared-resource", shareToken],
    queryFn: () => {
      if (!shareToken) {
        throw new Error("No share token provided.");
      }
      return resolveShareLinkAPI(shareToken);
    },
    enabled: !!shareToken,
    retry: false,
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} onRetry={() => refetch()} />;
  }

  if (!resource) {
    return <ErrorPage error={new Error("Resource not found.")} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {resource.type === "folder" ? (
        <SharedFolderView folder={resource} />
      ) : (
        <SharedFileView resource={resource} />
      )}
    </div>
  );
};
