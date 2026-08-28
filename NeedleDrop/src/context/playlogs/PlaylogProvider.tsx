import { createPlaylog as createPlaylogAPI, deletePlaylog as deletePlaylogAPI, getPlaylogs, updatePlaylog as updatePlaylogAPI } from "@services/apiPlaylogs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PlayLog } from "@interfaces/PlayLog";
import { PlaylogContext } from "./PlaylogContext";
import supabase from "@services/supabase";
import { useEffect } from "react";
import { useUserContext } from "@context/users/UserContext";

export const PlaylogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { isEditor } = useUserContext();
  const {data: playlogs = [], error, isLoading, isFetching} = useQuery({queryKey: ["playlogs"], queryFn: getPlaylogs, placeholderData: (previousData) => previousData});

  useEffect(() => {
    const channel = supabase.channel('playlogs-realtime').on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'playlogs',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["playlogs"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  const createMutation = useMutation({
    mutationFn: (newItem: Omit<PlayLog, 'id'>) => createPlaylogAPI(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlogs"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updatedItem }: { id: number; updatedItem: Partial<PlayLog> }) => 
      updatePlaylogAPI(id, updatedItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlogs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return deletePlaylogAPI(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlogs"] });
    },
  });

  const getPlaylogById = (id: number): PlayLog | null => {
    return playlogs.find((playlog) => playlog.id === id) || null;
  };

  const createPlaylog = async (newItem: Omit<PlayLog, 'id'>) => {
    if (!isEditor) throw new Error("Editor permissions required");
    return await createMutation.mutateAsync(newItem);
  };

  const updatePlaylog = async (id: number, updatedItem: Partial<PlayLog>) => {
      if (!isEditor) throw new Error("Editor permissions required");
      await updateMutation.mutateAsync({ id, updatedItem });
  };

  const deletePlaylog = async (id: number) => {
      if (!isEditor) throw new Error("Editor permissions required");
      await deleteMutation.mutateAsync(id);
  }

  const getPlaylogsByUserId = (id: string): PlayLog[] => {
    return playlogs.filter((item: PlayLog) => {
      const listenerIds = item.listeners.map((l) => l.id);
      return listenerIds.includes(id);
    })
  }

  const getPlaylogsByAlbumId = (albumId: number): PlayLog[] => {
    return playlogs.filter((item: PlayLog) => item.album_id === albumId);
  }
  
  return (
    <PlaylogContext.Provider
      value={{
        getPlaylogById,
        getPlaylogsByUserId,
        getPlaylogsByAlbumId,
        playlogs,
        error,
        isLoading,
        isFetching,
        createPlaylog,
        updatePlaylog,
        deletePlaylog
      }}
    >
      {children}
    </PlaylogContext.Provider>
  );
}

