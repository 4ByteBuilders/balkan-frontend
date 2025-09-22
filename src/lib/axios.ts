import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:8080/query",
});

// Attach token if present
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const gqlRequest = async (
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: Record<string, any>
) => {
  const response = await api.post("", {
    query,
    variables,
  });
  return response.data;
};

export const uploadGqlRequest = async (
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: Record<string, any>
) => {
  // 1. Create a FormData object
  const formData = new FormData();

  // 2. Isolate the file from other variables
  const file = variables.file;

  // 3. Construct the 'operations' part
  const operations = JSON.stringify({
    query,
    variables: {
      ...variables,
      file: null, // The file is nulled out in the variables
    },
  });
  formData.append("operations", operations);

  // 4. Construct the 'map' part
  const map = JSON.stringify({
    "0": ["variables.file"],
  });
  formData.append("map", map);

  // 5. Append the actual file
  formData.append("0", file);

  // 6. Make the request
  // Axios will automatically set the correct 'Content-Type: multipart/form-data' header
  const response = await api.post("", formData);
  return response.data;
};

export default api;
