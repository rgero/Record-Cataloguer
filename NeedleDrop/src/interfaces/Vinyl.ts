import type { Location } from "./Location";
import type { PlayLog } from "./PlayLog";
import type { User } from "./User";

export interface Vinyl {
  id?: number;
  purchaseNumber?: number;
  artist: string;
  album: string;
  color?: string;
  purchaseDate: Date;
  purchaseLocation: Location|null;
  price?: number;
  owners: User[];
  purchasedBy: User[];
  length: number;
  notes?: string;
  playCount?: number;
  likedBy: User[];
  imageUrl?: string;
  doubleLP: boolean;
  tags: string[];
  archived?: boolean;
  playlogs?: PlayLog[];
}

export interface VinylDbPayload extends Omit<Partial<Vinyl>, 'owners' | 'likedBy' | 'purchaseLocation' | 'purchaseDate' | 'purchasedBy'> {
  owners?: string[] | null;
  likedBy?: string[] | null;
  purchasedBy: string[] | null;
  purchaseLocation?: number | null;
  purchaseDate?: string | null;
}