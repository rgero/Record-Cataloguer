import React, { useState } from "react";
import { DialogContext, type ConfirmAction, type DialogDetails, type StatsOrderKey } from "./DialogContext";
import DeleteDialog from "@components/dialogs/DeleteDialog";
import StatsSettingsDialog from "@components/dialogs/StatsSettingsDialog";
import SettingsDialog from "@components/dialogs/SettingsDialog";

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const [columnFilterDialogOpen, setColumnFilterDialogOpen] = useState(false);
  const [columnVisibilityDialogOpen, setColumnVisibilityDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [statsOrderDialogOpen, setStatsOrderDialogOpen] = useState(false);
  const [statsOrderKey, setStatsOrderKey] = useState<StatsOrderKey | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(() => () => {});
  const [dialogDetails, setDialogDetails] = useState<DialogDetails | null>(null);

  const openDeleteDialog = (details: DialogDetails, action: ConfirmAction) => {
    setDialogDetails(details);
    setConfirmAction(() => action);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => setDeleteDialogOpen(false);

  const toggleStatsOrderDialog = (open: boolean, key?: StatsOrderKey) => {
    if (key) setStatsOrderKey(key);
    setStatsOrderDialogOpen(open);
  };

  const toggleSettingsDialog = () => { setSettingsDialogOpen(prev => !prev) };
  const toggleColumnFilterDialog = () => { setColumnFilterDialogOpen(prev => !prev) };
  const toggleColumnVisibilityDialog = () => { setColumnVisibilityDialogOpen(prev => !prev) };

  return (
    <DialogContext.Provider
      value={{
        columnFilterDialogOpen,
        columnVisibilityDialogOpen,
        deleteDialogOpen,
        settingsDialogOpen,
        statsOrderDialogOpen,
        statsOrderKey,
        toggleColumnFilterDialog,
        toggleColumnVisibilityDialog,
        toggleSettingsDialog,
        toggleStatsOrderDialog,
        dialogDetails,
        setDialogDetails,
        openDeleteDialog,
        closeDeleteDialog,
        confirmAction,
      }}
    >
      <DeleteDialog />
      <SettingsDialog/>
      <StatsSettingsDialog />
      {children}
    </DialogContext.Provider>
  );
};