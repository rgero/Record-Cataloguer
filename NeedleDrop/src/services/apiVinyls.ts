import type { Vinyl, VinylDbPayload } from "@interfaces/Vinyl";

import { format } from "date-fns";
import { resolveIds } from "./resolveIds";
import supabase from "./supabase";

const hydrateVinylData = async (rawVinyls: any[]): Promise<Vinyl[]> => {
  const userIds = new Set<string>();
  const locationIds = new Set<number>();

  rawVinyls.forEach((v) => {
    const owners = v.owners ?? v.owners;
    const purchasedBy = v.purchasedBy ?? v.purchased_by;
    const likedBy = v.likedBy ?? v.liked_by;
    const location = v.purchaseLocation ?? v.purchase_location;

    owners?.forEach((id: string) => userIds.add(id));
    purchasedBy?.forEach((id: string) => userIds.add(id));
    likedBy?.forEach((id: string) => userIds.add(id));
    if (location) locationIds.add(location);
  });

  const [userMap, locationMap] = await Promise.all([
    resolveIds("users", [...userIds]),
    resolveIds("locations", [...locationIds]),
  ]);

  return rawVinyls.map((v) => {
    const rawDate = v.purchaseDate ?? v.purchase_date;
    const rawOwners = v.owners ?? v.owners;
    const rawPurchasedBy = v.purchasedBy ?? v.purchased_by;
    const rawLikedBy = v.likedBy ?? v.liked_by;
    const rawLocation = v.purchaseLocation ?? v.purchase_location;

    return {
      ...v,
      purchaseNumber: v.purchaseNumber ?? v.purchase_number,
      playCount: v.playCount ?? v.play_count,
      doubleLP: v.doubleLP ?? v.double_lp,
      imageUrl: v.imageUrl ?? v.image_url,
      
      purchaseDate: rawDate ? new Date(rawDate + 'T12:00:00') : null,
      owners: rawOwners?.map((id: string) => userMap[id]).filter(Boolean) ?? [],
      purchasedBy: rawPurchasedBy?.map((id: string) => userMap[id]).filter(Boolean) ?? [],
      likedBy: rawLikedBy?.map((id: string) => userMap[id]).filter(Boolean) ?? [],
      purchaseLocation: rawLocation ? locationMap[rawLocation] : null,
    };
  });
};

export const getVinyls = async (): Promise<Vinyl[]> => {
  const { data: vinyls, error } = await supabase
    .from("ordered_vinyls")
    .select('*,"purchaseNumber"')
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    throw error;
  }
  if (!vinyls) {
    throw new Error("No vinyl data returned");
  }

  return hydrateVinylData(vinyls);
};

export const getUnplayedVinyls = async (userId?: string): Promise<Vinyl[]> => {
  if (!userId) return []; 
  
  const { data: vinyls, error } = await supabase.rpc('get_unplayed_vinyls', { target_user_id: userId });
  
  if (error || !vinyls) {
    console.error(error);
    return [];
  }

  return hydrateVinylData(vinyls);
};

export const createVinyl = async (newItem: Omit<Vinyl, 'id'>): Promise<void> => {
  const payload = {
    ...newItem,
    playCount: 0,
    tags: newItem.tags?.map(t => t.trim().toLowerCase()) || [],
    purchaseDate: newItem.purchaseDate ? format(newItem.purchaseDate, "yyyy-MM-dd") : null,
    owners: newItem.owners.map((o) => o.id),
    likedBy: newItem.likedBy.map((u) => u.id),
    purchasedBy: newItem.purchasedBy.map((o) => o.id),
    purchaseLocation: newItem.purchaseLocation?.id || null,
  };

  const { data, error } = await supabase.from("vinyls").insert(payload).select("*").single();
  if (error || !data) {
    console.error("Error creating vinyl:", error);
    throw new Error(error?.message || "Unknown error");
  }
};

export const updateVinyl = async (id: number, updatedItem: Partial<Vinyl>): Promise<void> => {
  const { purchaseDate, purchasedBy, owners, likedBy, purchaseLocation, purchaseNumber, tags, ...rest } = updatedItem;
  void purchaseNumber;

  const payload: Partial<VinylDbPayload> = { 
    ...rest,
    ...(tags !== undefined && { tags: tags.map(t => t.trim().toLowerCase()) }),
    ...(purchaseDate !== undefined && {
      purchaseDate: purchaseDate ? format(purchaseDate, "yyyy-MM-dd") : null,
    }),
    ...(owners !== undefined && { owners: owners.map((u) => u.id).filter(Boolean) }),
    ...(purchasedBy !== undefined && { purchasedBy: purchasedBy.map((u) => u.id).filter(Boolean) }),
    ...(likedBy !== undefined && { likedBy: likedBy.map((u) => u.id).filter(Boolean) }),
    ...(purchaseLocation !== undefined && { purchaseLocation: purchaseLocation?.id ?? null }),
  };

  const { error } = await supabase.from("vinyls").update(payload).eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Failed to update vinyl");
  }
}

export const deleteVinyl = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from("vinyls")
    .update({ archived: true })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Failed to archive vinyl");
  }
};