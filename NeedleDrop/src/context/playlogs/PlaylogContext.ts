import { createContext, useContext } from "react";

import type { PlayLog } from "@interfaces/PlayLog";

export interface PlaylogContextType {
  playlogs : PlayLog[];
  getPlaylogById: (id: number) => PlayLog | null;
  getPlaylogsByAlbumId: (albumId: number) => PlayLog[];
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  createPlaylog: (newItem: Omit<PlayLog, 'id'>) => Promise<PlayLog>;
  getPlaylogsByUserId: (id: string) => PlayLog[];
  updatePlaylog: (id: number, updatedItem: Partial<PlayLog>) => Promise<void>;
  deletePlaylog: (id: number) => Promise<void>;
}

export const PlaylogContext = createContext<PlaylogContextType | null>(null);

export const usePlaylogContext = () => {
  const context = useContext(PlaylogContext);
  if (!context) {
    throw new Error("usePlaylogContext must be used within a PlaylogProvider");
  }
  return context;
};