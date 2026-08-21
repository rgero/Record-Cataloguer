import type { Vinyl } from "@interfaces/Vinyl";

export const checkIsComplete = (v: Vinyl): boolean => {
  return !!(
    v.artist && 
    v.album && 
    v.purchaseDate && 
    v.purchaseLocation && 
    v.owners?.length > 0
  );
};

export const checkComplete = (row: Vinyl) => {
  const isComplete = checkIsComplete(row);
  return {
    backgroundColor: isComplete ? 'inherit' : 'rgba(211, 47, 47, 0.15) !important',
    '&:hover': {
      backgroundColor: isComplete ? 'inherit' : 'rgba(211, 47, 47, 0.25) !important',
    }
  }
};