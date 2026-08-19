import type { Location } from "@interfaces/Location";
import supabase from "./supabase";

export const getLocations = async () => {
  const { data, error } = await supabase
    .from('locations')
    .select('*, vinyls!purchaseLocation(count)')
    .eq('vinyls.archived', false);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("No location data returned");
  }

  const locations = data.map((loc: any) => ({
    ...loc,
    purchaseCount: loc.vinyls?.[0]?.count ?? 0,
  }));

  const totalPurchases = locations.reduce(
    (sum: number, loc: any) => sum + loc.purchaseCount,
    0
  );

  return locations.map((loc: any) => ({
    ...loc,
    percentage:
      totalPurchases > 0 ? (loc.purchaseCount / totalPurchases) * 100 : 0,
  }));
};

export const updateLocation = async (id: number, updatedItem: Partial<Location>): Promise<void> => {
  const { error } = await supabase.from("locations").update(updatedItem).eq("id", id);
  if (error) {
    console.error("Error updating location:", error);
    throw new Error(error.message);
  }
};

export const createLocation = async (newItem: Omit<Location, 'id'>): Promise<Location | null> => {
  const { data, error } = await supabase.from("locations").insert(newItem).select().single();
  if (error) {
    console.error("Error creating location:", error);
    throw new Error(error.message);
  }
  return data;
};

export const deleteLocation = async (id: number): Promise<void> => {
  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) {
    console.error("Error deleting location:", error);
    throw new Error(error.message);
  }
};