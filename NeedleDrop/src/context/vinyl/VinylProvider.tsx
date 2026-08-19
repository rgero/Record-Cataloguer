import {createVinyl as createVinylAPI, deleteVinyl as deleteVinylAPI, getUnplayedVinyls, updateVinyl as updateVinylAPI} from "@services/apiVinyls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { RoundNumber } from "@utils/RoundNumber";
import type { Vinyl } from "@interfaces/Vinyl";
import { VinylContext } from "./VinylContext";
import { getVinyls } from "@services/apiVinyls";
import supabase from "@services/supabase";
import { useAuthenticationContext } from "@context/authentication/AuthenticationContext";
import { useEffect } from "react";
import { useUserContext } from "@context/users/UserContext";
import { vinylPriceOwnerShare } from "@utils/vinylPriceOwnerShare";

export const VinylProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {user} = useAuthenticationContext();
  const { isEditor } = useUserContext();
  const queryClient = useQueryClient();
  const {data: vinyls = [], error, isLoading, isFetching} = useQuery({queryKey: ["vinyls"], queryFn: getVinyls, placeholderData: (previousData) => previousData});
  
  const {data: unplayedVinyls = [], error: unplayedError, isLoading: unplayedLoading, isFetching: unplayedFetching} = useQuery({
    queryKey: ["unplayed_vinyls", user?.id], 
    enabled: !!user?.id, 
    queryFn: () => getUnplayedVinyls(user!.id), 
    placeholderData: (previousData) => previousData
  });

  useEffect(() => {
    const channel = supabase.channel('vinyls-realtime').on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vinyls',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["vinyls"] });
          queryClient.invalidateQueries({ queryKey: ["unplayed_vinyls"] });
        }
      ).on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'playlogs'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["vinyls"] });
          queryClient.invalidateQueries({ queryKey: ["unplayed_vinyls"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (newItem: Omit<Vinyl, 'id'>) => createVinylAPI(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vinyls"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updatedItem }: { id: number; updatedItem: Partial<Vinyl> }) => 
      updateVinylAPI(id, updatedItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vinyls"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return deleteVinylAPI(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vinyls"] });
    },
  });

  const getVinylById = (id: number): Vinyl | null => {
    return vinyls.find((vinyl) => vinyl.id === id) || null;
  };

  const createVinyl = async (newItem: Omit<Vinyl, 'id'>) => {
    if (!isEditor) throw new Error("Editor permissions required");
    return await createMutation.mutateAsync(newItem);
  };

  const updateVinyl = async (id: number, updatedItem: Partial<Vinyl>) => {
    if (!isEditor) throw new Error("Editor permissions required");
    await updateMutation.mutateAsync({ id, updatedItem });
  };

  const deleteVinyl = async (id: number) => {
    if (!isEditor) throw new Error("Editor permissions required");
    await deleteMutation.mutateAsync(id);
  }

  const getVinylsOwnedByUserId = (id: string): Vinyl[] => {
    return vinyls.filter((item: Vinyl) => {
      const ownerIds = item.owners.map((o) => o.id);
      return ownerIds.includes(id);
    })
  }

  const getVinylsBoughtByUserId = (id: string): Vinyl[] => {
    return vinyls.filter((item: Vinyl) => {
      const purchaserIds = item.purchasedBy.map((p) => p.id);
      return purchaserIds.includes(id);
    })
  }

  const calculateValueById = (id: string) => {
    const vinylList = getVinylsOwnedByUserId(id);
    if (vinylList.length === 0) return 0.0;

    const total = vinylList.reduce((sum: number, item: Vinyl) => {
        return sum + vinylPriceOwnerShare(item);
      }, 0)
    return RoundNumber(total);
  }

  const calculateTotalSpentById = (id: string) => {
    const vinylList = getVinylsBoughtByUserId(id);
    if (vinylList.length === 0) return 0.0;

    const total = vinylList.reduce((sum: number, item: Vinyl) => {
        return sum + vinylPriceOwnerShare(item);
      }, 0)
    return RoundNumber(total);
  }

  const calculateTotalPrice = () => {
    const total = vinyls.reduce((sum: number, item: Vinyl) => {
        return sum + vinylPriceOwnerShare(item);
      }, 0)
    return RoundNumber(total);
  }
  
  return (
    <VinylContext.Provider
      value={{
        vinyls,
        unplayedVinyls,
        getVinylById,
        createVinyl,
        getVinylsOwnedByUserId,
        getVinylsBoughtByUserId,
        calculateValueById,
        calculateTotalSpentById,
        calculateTotalPrice,
        updateVinyl,
        deleteVinyl,
        error: error || unplayedError,
        isLoading: isLoading || unplayedLoading,
        isFetching: isFetching || unplayedFetching
      }}
    >
      {children}
    </VinylContext.Provider>
  );
}

