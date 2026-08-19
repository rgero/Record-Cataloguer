import type { PlayLog, PlaylogDbPayload } from "@interfaces/PlayLog";

import supabase from "./supabase";

export const getPlaylogs = async () => {
  const { data: plays, error } = await supabase
    .from('ordered_playlogs')
    .select('*, "playNumber", vinyls(artist, album)');

  if (error) {
    console.error(error);
    throw error;
  }
  if (!plays) {
    throw new Error("No playlog data returned");
  }

  const { data: users } = await supabase.from('users').select('*');
  const userMap = Object.fromEntries((users ?? []).map(u => [u.id, u]));

  return plays.map(p => ({
    ...p,
    date: p.date ? new Date(p.date) : null,
    artist: p.vinyls?.artist || "Unknown Artist",
    album: p.vinyls?.album || "Unknown Album",
    listeners: p.listeners?.map((id: string) => userMap[id]).filter(Boolean) ?? []
  }));
}

export const createPlaylog = async (newItem: Omit<PlayLog, 'id'>) => {
  const { data, error } = await supabase.from('playlogs').insert([
    {
      ...newItem,
      date: newItem.date ?? null,
      listeners: newItem.listeners?.map(u => u.id) ?? []
    }
  ]).select().single(); 
  if (error) {
    throw error;
  }
  return {
    ...data,
    date: data.date ? new Date(data.date) : null,
    listeners: newItem.listeners
  };
}

export const updatePlaylog = async (id: number, updatedItem: Partial<PlayLog>) => {
  const cleansedUpdate: Partial<PlaylogDbPayload> = {
    album_id: updatedItem.album_id,
    date: updatedItem.date ?? null,
    listeners: updatedItem.listeners?.map(u => u.id) ?? [],
    notes: updatedItem.notes
  }

  const { data, error } = await supabase.from('playlogs').update(cleansedUpdate).eq('id', id).select().single();

  if (error) {
    throw error;
  }
  
  return {
    ...data,
    date: data.date ? new Date(data.date) : null,
    listeners: updatedItem.listeners
  };
}

export const deletePlaylog = async (id: number) => {
  const { error } = await supabase.from('playlogs').delete().eq('id', id);
  if (error) {
    throw error;
  }
}