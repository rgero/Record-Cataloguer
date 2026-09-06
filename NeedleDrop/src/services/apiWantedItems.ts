import type { WantedItem, WantedItemDbPayload } from "@interfaces/WantedItem";

import supabase from "./supabase";

export const getWantedItems = async (): Promise<WantedItem[]> => {
  const { data: wanteditems, error } = await supabase.from("wanted_items").select("*");

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  if (!wanteditems) {
    throw new Error("No wanted items data returned");
  }

  const userIds = new Set<string>();

  wanteditems.forEach(v => {
    v.searcher?.forEach((id: string) => userIds.add(id));
  });

  const [{ data: users }] = await Promise.all([
    userIds.size ? supabase.from("users").select("*").in("id", [...userIds]) : Promise.resolve({ data: [] })]);

  const userMap = Object.fromEntries((users ?? []).map(u => [u.id, u]));

  return wanteditems.map(v => ({
    id: v.id,
    artist: v.artist,
    album: v.album,
    notes: v.notes,
    length: v.length ?? null,
    imageUrl: v.imageUrl,
    searcher: v.searcher ?.map((id: string) => {
      return userMap[id]
    }).filter(Boolean) ?? [],
    created_at: v.created_at ? new Date(v.created_at) : undefined,
    weight: v.weight
  }));
};

export const updateWantedItem = async (id: number, updatedItem: Partial<WantedItem>): Promise<void> => {
  const { searcher, ...otherFields } = updatedItem;
  
  const payload: WantedItemDbPayload = { ...otherFields };

  if (searcher) {
    payload.searcher = searcher.map(user => {
      if (typeof user === 'object' && user !== null && 'id' in user) {
        return user.id;
      }
      return String(user); 
    });
  }

  const { error } = await supabase.from("wanted_items").update(payload).eq("id", id);
  if (error) {
    console.error("Error updating wanted item:", error);
    throw new Error(error.message);
  }
};

export const deleteWantedItem = async (id: number): Promise<void> => {
  const { error } = await supabase.from("wanted_items").delete().eq("id", id);
  if (error) {
    console.error("Error deleting wanted item:", error);
    throw new Error(error.message);
  }
};

export const createWantedItem = async (newItem: Omit<WantedItem, 'id'>): Promise<WantedItem> => {
  const payload: WantedItemDbPayload = {
    ...newItem,
    searcher: newItem.searcher.map(user => {
      if (typeof user === 'object' && user !== null && 'id' in user) {
        return user.id;
      }
      return String(user); 
    }),
  };
  const { data, error } = await supabase.from("wanted_items").insert(payload).select("*").single();

  if (error || !data) {
    console.error("Error creating wanted item:", error);
    throw new Error(error?.message || "Unknown error");
  }
  return data;
}