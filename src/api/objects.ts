import { gqlRequest, uploadGqlRequest } from "@/lib/axios";
import CustomError from "@/lib/CustomError";
import { AxiosError } from "axios";

export const getRootLevelObjects = async () => {
  try {
    const query = `
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
    const response = await gqlRequest(query, { folderId: null });
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
    const query = `
        query GetRootLevelObjects($folderId: ID) {
        resources(folderId: $folderId) {
          id
          name
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
      }`;
    const response = await gqlRequest(query, { folderId });
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

export const deleteObjectAPI = async (id: string) => {
  const query = `
    mutation DeleteObject($id: ID!) {
      deleteObject(id: $id)
    }
  `;
  const response = await gqlRequest(query, { id });

  if (!response.data) {
    throw new CustomError("Failed to delete object", 500);
  }

  return response.data;
};

export const getMe = async () => {
  try {
    const query = `
      query GetMe {
        me {
          id
          username
          email
          Role
          StorageUsed
          DeduplicationStorageUsed
        }
      }
    `;
    const response = await gqlRequest(query);
    return response.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      throw new CustomError(
        err.response?.data.errors[0].message || "Failed to fetch user profile",
        err.response?.status || 500
      );
    }
    throw new CustomError("Failed to fetch user profile", 500);
  }
};
