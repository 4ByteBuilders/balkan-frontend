export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Object {
  id: string;
  name: string;
  type: string;
  owner: string;
  updatedAt: string;
  createdAt: string;
  parentId?: string;
}

export interface ObjectPath {
  id: string;
  name: string;
}
