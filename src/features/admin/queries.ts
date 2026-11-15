/**
 * Mutations for the studio desk itself — signing in and out, and uploading a
 * photograph. The desk has no server state of its own to read: what it shows
 * comes from the paintings, artist and content features.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login, logout, uploadImage } from "@/features/admin/api";

export function useLogin() {
  return useMutation({
    mutationFn: (password: string) => login(password),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    // Nothing fetched while signed in should outlive the session.
    onSuccess: () => queryClient.clear(),
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => uploadImage(file),
  });
}
