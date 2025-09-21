import { gqlRequest } from "@/lib/axios";
import CustomError from "@/lib/CustomError";

export const loginAPI = async (email: string, password: string) => {
  const query = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

  const response = await gqlRequest(query, { email, password });
  if (!response.data)
    throw new CustomError("User Not Found or Incorrect Password", 404);

  return response.data["login"];
};

export const registerAPI = async (
  username: string,
  email: string,
  password: string
) => {
  const query = `
    mutation Register($username: String!, $email: String!, $password: String!) {
      register(username: $username, email: $email, password: $password) {
        token
        user {
          id
          username
          email
        }
      }
    }
  `;

  const response = await gqlRequest(query, { username, email, password });

  if (!response.data) throw new CustomError("Registration failed", 400);

  if (response.errors) {
    throw new CustomError(response.errors[0].message, 400);
  }

  return response.data.register;
};
