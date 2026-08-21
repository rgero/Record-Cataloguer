import { createContext, useContext } from "react";

import type { Vinyl } from "@interfaces/Vinyl";

export interface VinylContextType {
  vinyls : Vinyl[];
  unplayedVinyls: Vinyl[];
  userVinyls: Vinyl[];
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  calculateValueById: (id: string) => number;
  calculateTotalSpentById: (id: string) => number;
  calculateTotalPrice: () => number;
  getVinylById: (id: number) => Vinyl | null;
  getVinylsOwnedByUserId: (id: string) => Vinyl[];
  getVinylsBoughtByUserId: (id: string) => Vinyl[];
  createVinyl: (newItem: Omit<Vinyl, 'id'>) => Promise<void>;
  updateVinyl: (id: number, updatedItem: Partial<Vinyl>) => Promise<void>;
  deleteVinyl: (id: number) => Promise<void>;  
}

export const VinylContext = createContext<VinylContextType | null>(null);

export const useVinylContext = () => {
  const context = useContext(VinylContext);
  if (!context) {
    throw new Error("useVinylContext must be used within a VinylProvider");
  }
  return context;
};