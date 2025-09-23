export interface User {
  id: string;
  email: string;
  username: string;
}

interface Owner {
  id: string;
  username: string;
  email?: string;
}

export type Role = "VIEWER" | "EDITOR";

export interface Permission {
  user: User;
  role: Role;
}

export interface Object {
  id: string;
  name: string;
  type: string;
  mimeType?: string;
  owner: Owner;
  updatedAt: string;
  createdAt: string;
  sizeBytes?: number;
  shareToken: string;
  parentId?: string;
  permissions?: Permission[];
  children?: Object[];
  isPublic: boolean;
}

export interface ObjectPath {
  id: string;
  name: string;
}
