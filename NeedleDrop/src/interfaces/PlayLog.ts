import type { User } from "./User";

export interface PlayLog {
  id?: number,
  playNumber?: number;
  artist?: string,
  album?: string,
  album_id: number|null,
  listeners: User[],
  date: Date,
  notes?: string,
}

export interface PlaylogDbPayload extends Omit<Partial<PlayLog>, 'playNumber' | 'listeners' | 'date' | 'artist' | 'album'> {
  listeners?: string[];
  date: Date | null;
}