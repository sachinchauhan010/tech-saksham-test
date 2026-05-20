import apiClient from "@/lib/api-client";

export const getCurrentUser = async () => {
  const response = await apiClient.get("/api/auth/me",);

  if (!response.data.success) {
    throw new Error("Unauthorized");
  }

  return response.data.user;
};