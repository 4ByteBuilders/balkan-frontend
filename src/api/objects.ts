import { gqlRequest, uploadGqlRequest } from "@/lib/axios";
import CustomError from "@/lib/CustomError";
import { AxiosError } from "axios";
const RESOURCES_QUERY_FRAGMENT = `
      query GetRootLevelObjects($folderId: ID) {
        resources(folderId: $folderId) {
          id
          name
          owner {
            id
            username
          }
          createdAt
          updatedAt
          shareToken
          ... on File {
            sizeBytes
            mimeType
            type
            tags {
              id
              name
            }
            permissions {
              user {
                id
                username
              }
              role
            }
          }
          ... on Folder {
            type
            children {
              id
              name
            }
            tags {
              id
              name
            }
            permissions {
              user {
                id
                username
              }
              role
            }
          }
        }
      }
`;

export const getRootLevelObjects = async () => {
  try {
    const response = await gqlRequest(RESOURCES_QUERY_FRAGMENT, {
      folderId: null,
    });
    console.log(response.data.resources);
    return response.data.resources;
  } catch (err) {
    console.log(err);
    if (err instanceof AxiosError) {
      throw new CustomError(
        err.response?.data.errors[0].message || "Failed to fetch objects",
        err.response?.status || 500
      );
    }
    throw new CustomError("Failed to fetch objects", 500);
  }
};

export const getObjectsByParentId = async (folderId: string) => {
  try {
    const response = await gqlRequest(RESOURCES_QUERY_FRAGMENT, { folderId });
    return response.data.resources;
  } catch (err) {
    console.log(err);
    if (err instanceof AxiosError) {
      throw new CustomError(
        err.response?.data.errors[0].message || "Failed to fetch objects",
        err.response?.status || 500
      );
    }
    throw new CustomError("Failed to fetch objects", 500);
  }
};

export const createNewFolder = async ({
  name,
  parentId,
}: {
  name: string;
  parentId?: string;
}) => {
  const query = `
    mutation CreateFolder($name: String!, $parentId: ID) {
      createFolder(name: $name, parentId: $parentId) {
        id
        name
        type
        parent {
          id
          name
        }
        createdAt
        updatedAt
        owner {
          id
          username
          email
        }
        shareToken
        permissions {
          user {
            id
            username
          }
          role
        }
        children {
          id
          name
        }
      }
    }
  `;
  const response = await gqlRequest(query, { name, parentId });

  if (!response.data) {
    throw new CustomError("Failed to create folder", 500);
  }

  return response.data;
};

export const uploadFileAPI = async ({
  file,
  parentId,
}: {
  file: File;
  parentId?: string;
}) => {
  const query = `
    mutation UploadFile($file: Upload!, $parentId: ID) {
      uploadFile(file: $file, parentId: $parentId) {
        id
        name
        type
        sizeBytes
        mimeType
        createdAt
        updatedAt
        parent {
          id
          name
        }
        owner {
          id
          username
        }
        shareToken
        permissions {
          user {
            id
            username
          }
          role
        }
        storage {
          originalSizeBytes
          deduplicatedSizeBytes
          savedBytes
          savedPercentage
        }
      }
    }
  `;
  console.log("uploafing");
  const res = await uploadGqlRequest(query, { file, parentId });
  console.log(res);
};

export const deleteResourceAPI = async ({
  id,
  type,
}: {
  id: string;
  type: string;
}) => {
  let query;
  if (type === "folder") {
    query = `
    mutation DeleteFolder($id: ID!) {
      deleteFolder(id: $id)
  }`;
  } else {
    query = `
    mutation DeleteFile($id: ID!) {
      deleteFile(id: $id)
  }`;
  }

  const response = await gqlRequest(query, { id });

  if (!response.data) {
    throw new CustomError("Failed to delete object", 500);
  }

  return response.data;
};

export const moveResourceAPI = async ({
  object_id,
  parent_id,
  type,
}: {
  object_id: string;
  parent_id?: string;
  type: "file" | "folder";
}) => {
  try {
    const isFolder = type === "folder";
    const query = isFolder
      ? `
      mutation MoveFolder($folderId: ID!, $newParentId: ID) {
        moveFolder(folderId: $folderId, newParentId: $newParentId) {
          id
          name
          parent {
            id
            name
          }
        }
      }
    `
      : `
      mutation MoveFile($fileId: ID!, $newParentId: ID) {
        moveFile(fileId: $fileId, newParentId: $newParentId) {
          id
          name
          parent {
            id
            name
          }
        }
      }
    `;

    const variables = isFolder
      ? { folderId: object_id, newParentId: parent_id }
      : { fileId: object_id, newParentId: parent_id };

    const response = await gqlRequest(query, variables);

    if (!response.data) {
      throw new CustomError("Failed to move object", 500);
    }

    return isFolder ? response.data.moveFolder : response.data.moveFile;
  } catch (err) {
    console.log(err);
    if (err instanceof AxiosError) {
      throw new CustomError(
        err.response?.data.errors[0].message || "Failed to move object",
        err.response?.status || 500
      );
    }
    throw new CustomError("Failed to move object", 500);
  }
};

export interface SearchFilters {
  name?: string;
  types?: ("file" | "folder")[];
  mimeTypes?: string[];
  minSizeBytes?: number;
  maxSizeBytes?: number;
  afterDate?: string; // ISO 8601 format
  tags?: string[];
  uploaderName?: string;
}

export const searchResourcesAPI = async ({
  filters,
  offset,
  limit,
}: {
  filters: SearchFilters;
  offset?: number;
  limit?: number;
}) => {
  try {
    const query = `
      query SearchResources($filters: SearchFilters!, $offset: Int, $limit: Int) {
        searchResources(filters: $filters, offset: $offset, limit: $limit) {
          id
          name
          ... on File {
            type
            sizeBytes
            mimeType
            shareToken
          }
          ... on Folder {
            type
            children {
              id
              name
            }
            shareToken
          }
          tags {
            id
            name
          }
          owner {
            id
            username
          }
          createdAt
          updatedAt
        }
      }
    `;

    const response = await gqlRequest(query, { filters, offset, limit });

    if (!response.data) {
      throw new CustomError("Failed to search resources", 500);
    }

    return response.data.searchResources;
  } catch (err) {
    console.log(err);
    if (err instanceof AxiosError) {
      throw new CustomError(
        err.response?.data.errors[0].message || "Failed to search resources",
        err.response?.status || 500
      );
    }
    throw new CustomError("Failed to search resources", 500);
  }
};

export const renameResourceAPI = async ({
  id,
  newName,
  type,
}: {
  id: string;
  newName: string;
  type: "file" | "folder";
}) => {
  try {
    const isFolder = type === "folder";
    const query = isFolder
      ? `
      mutation RenameFolder($id: ID!, $newName: String!) {
        renameFolder(id: $id, newName: $newName) {
          id
          name
          type
        }
      }
    `
      : `
      mutation RenameFile($id: ID!, $newName: String!) {
        renameFile(id: $id, newName: $newName) {
          id
          name
          type
        }
      }
    `;

    const variables = { id, newName };

    const response = await gqlRequest(query, variables);

    if (!response.data) {
      throw new CustomError("Failed to rename resource", 500);
    }

    return isFolder ? response.data.renameFolder : response.data.renameFile;
  } catch (err) {
    console.log(err);
    if (err instanceof AxiosError) {
      throw new CustomError(
        err.response?.data.errors[0].message || "Failed to rename resource",
        err.response?.status || 500
      );
    }
    throw new CustomError("Failed to rename resource", 500);
  }
};

export const resolveShareLinkAPI = async (token: string, expectedType: string) => {
  try {
    const query = `
      query ResolveShareLink($token: String!, $expectedType: String!) {
        resolveShareLink(token: $token, expectedType: $expectedType) {
          id
          name
          createdAt
          updatedAt
          shareToken
          owner {
            id
            username
            email
          }
          ... on File {
            type
            sizeBytes
            mimeType
          }
          ... on Folder {
            type
          }
        }
      }
    `;
    const response = await gqlRequest(query, { token, expectedType });
    if (!response.data || !response.data.resolveShareLink) {
      throw new CustomError("Resource not found or access denied", 404);
    }
    return response.data.resolveShareLink;
  } catch (err) {
    console.error(err);
    if (err instanceof CustomError) {
      throw err;
    }
    if (err instanceof AxiosError) {
      const message =
        err.response?.data?.errors?.[0]?.message ||
        "Failed to fetch shared resource";
      throw new CustomError(message, err.response?.status || 500);
    }
    throw new CustomError("Failed to fetch shared resource", 500);
  }
};

export const grantPermissionAPI = async ({
  resourceId,
  email,
  role,
}: {
  resourceId: string;
  email: string;
  role: "VIEWER" | "EDITOR";
}) => {
  try {
    const query = `
      mutation GrantPermission($resourceId: ID!, $email: String!, $role: Role!) {
        grantPermission(resourceId: $resourceId, email: $email, role: $role) {
          id
          name
          permissions {
            user {
              id
              username
              email
            }
            role
          }
        }
      }
    `;
    const response = await gqlRequest(query, { resourceId, email, role });
    if (!response.data || !response.data.grantPermission) {
      throw new CustomError("Failed to grant permission", 500);
    }
    return response.data.grantPermission;
  } catch (err) {
    console.error(err);
    if (err instanceof CustomError) {
      throw err;
    }
    if (err instanceof AxiosError) {
      const message =
        err.response?.data?.errors?.[0]?.message ||
        "Failed to grant permission";
      throw new CustomError(message, err.response?.status || 500);
    }
    throw new CustomError("Failed to grant permission", 500);
  }
};
