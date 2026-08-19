import { createLocation as createLocationAPI, deleteLocation as deleteLocationAPI, getLocations, updateLocation as updateLocationAPI } from "@services/apiLocations";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Location } from "@interfaces/Location";
import { LocationContext } from "./LocationContext";
import supabase from "@services/supabase";
import { useEffect } from "react";
import { useUserContext } from "@context/users/UserContext";

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { isEditor } = useUserContext();
  const {data: locations = [], error, isLoading, isFetching} = useQuery({queryKey: ["locations"], queryFn: getLocations, placeholderData: (previousData) => previousData});

  useEffect(() => {
    const invalidateLocations = () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    };

    const channel = supabase
      .channel('locations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, invalidateLocations)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vinyls' }, invalidateLocations)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  const createMutation = useMutation({
    mutationFn: (newItem: Omit<Location, 'id'>) => createLocationAPI(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updatedItem }: { id: number; updatedItem: Partial<Location> }) => 
      updateLocationAPI(id, updatedItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return deleteLocationAPI(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  const getLocationById = (id: number): Location | null => {
    return locations.find((location) => location.id === id) || null;
  };

  const createLocation = async (newItem: Omit<Location, 'id'>) => {
    if (!isEditor) throw new Error("Editor permissions required");
    return await createMutation.mutateAsync(newItem);
  };

  const updateLocation = async (id: number, updatedItem: Partial<Location>) => {
      if (!isEditor) throw new Error("Editor permissions required");
      await updateMutation.mutateAsync({ id, updatedItem });
  };

  const deleteLocation = async (id: number) => {
      if (!isEditor) throw new Error("Editor permissions required");
      await deleteMutation.mutateAsync(id);
  }
  
  return (
    <LocationContext.Provider
      value={{
        getLocationById,
        locations,
        error,
        isLoading,
        isFetching,
        createLocation,
        updateLocation,
        deleteLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

