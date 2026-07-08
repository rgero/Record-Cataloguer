export interface Location {
  id?: number;
  name: string;
  address: string | null;
  recommended: boolean | null;
  percentage?: number | null;
  purchaseCount?: number;
  notes: string | null;
}
