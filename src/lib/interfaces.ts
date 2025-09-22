export interface User {
  id: string;
  email: string;
  username: string;
}

interface Owner {
  id: string;
  username: string;
}

export interface Object {
  id: string;
  name: string;
  type: string;
  mimeType?: string;
  owner: Owner;
  updatedAt: string;
  createdAt: string;
  parentId?: string;
}

export interface ObjectPath {
  id: string;
  name: string;
}
