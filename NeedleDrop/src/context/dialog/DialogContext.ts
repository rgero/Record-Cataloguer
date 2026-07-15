import { createContext, useContext } from "react";

export type ConfirmAction = () => Promise<void> | void;

export type StatsOrderKey = 'houseStatsSectionOrder' | 'userStatsSectionOrder';

export type DialogDetails = {
  name: string;
  type: string;
}

export interface DialogContextProps {
  columnVisibilityDialogOpen: boolean;
  deleteDialogOpen: boolean;
  settingsDialogOpen: boolean;
  statsOrderDialogOpen: boolean;
  statsOrderKey: StatsOrderKey | null;
  openDeleteDialog: (dialogDetails: DialogDetails, action: ConfirmAction) => void;
  closeDeleteDialog: () => void;
  confirmAction: () => Promise<void> | void;
  dialogDetails: DialogDetails | null;
  setDialogDetails: (details: DialogDetails | null) => void;
  toggleColumnVisibilityDialog: () => void;
  toggleStatsOrderDialog: (open: boolean, key?: StatsOrderKey) => void;
  toggleSettingsDialog: () => void;
}

export const DialogContext = createContext<DialogContextProps | undefined>(undefined);

export const useDialogProvider = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error("DialogContext was used outside of DialogProvider");
  }
  return context;
};