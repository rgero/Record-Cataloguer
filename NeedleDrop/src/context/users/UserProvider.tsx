import { getUsers, updateUserSettings } from "@services/apiUsers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {User as SupabaseUser} from '@supabase/supabase-js';
import type { User } from "@interfaces/User";
import { type UserSettings } from "@interfaces/settings/UserSettings";
import { useAuthenticationContext } from "@context/authentication/AuthenticationContext";
import { UserContext } from "./UserContext";
import { useCallback } from "react";
import { DefaultSettings } from "@interfaces/settings/DefaultSettings";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { user }: { user: SupabaseUser | null } = useAuthenticationContext();
  const { data: users = [], error, isLoading, isFetching } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: Boolean(user?.id),
  });
  const currentUser = users.find((candidate) => candidate.id === user?.id) ?? null;
  const isEditor = currentUser?.editor ?? false;
  const editorUsers = users.filter((candidate) => candidate.editor);

  const getCurrentUserSettings = useCallback((): UserSettings => {
    return currentUser?.settings ?? DefaultSettings;
  }, [currentUser]);

  const updateSettingsMutation = useMutation<
    User,
    Error,
    UserSettings,
    { previousUsers?: User[] }
  >({
    mutationFn: async (newSettings) => {
      if (!user) throw new Error("Not authenticated");
      return updateUserSettings(user.id, newSettings);
    },
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previousUsers = queryClient.getQueryData<User[]>(["users"]);

      queryClient.setQueryData<User[]>(["users"], (old) => {
        if (!old || !user) return old;
        return old.map((existingUser) =>
          existingUser.id === user.id
            ? { ...existingUser, settings: newSettings }
            : existingUser,
        );
      });

      return { previousUsers };
    },
    onError: (_error, _newSettings, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData<User[]>(["users"], context.previousUsers);
      }
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData<User[]>(["users"], (old) => {
        if (!old) return old;
        return old.map(u =>
          u.id === updatedUser.id ? updatedUser : u
        );
      });
    }
  });


  const updateCurrentUserSettings = (updates: Partial<UserSettings>) => {
    const currentUsers = queryClient.getQueryData<User[]>(["users"]) ?? users;
    const currentUser = currentUsers.find((candidate) => candidate.id === user?.id);
    const current = currentUser?.settings ?? DefaultSettings;

    updateSettingsMutation.mutate({
      ...current,
      ...updates
    });
  };

  return (
    <UserContext.Provider
      value={{
        users,
        editorUsers,
        error,
        getCurrentUserSettings,
        updateCurrentUserSettings,
        currentUser,
        isEditor,
        isLoading,
        isFetching
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
