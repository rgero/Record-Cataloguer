import React, { useState } from "react";
import { DialogContext, type ConfirmAction, type DialogDetails, type StatsOrderKey } from "./DialogContext";
import type { ColumnFilterDialogConfig, ColumnVisibilityDialogConfig } from "./tableDialogTypes";
import DeleteDialog from "@components/dialogs/DeleteDialog";
import StatsSettingsDialog from "@components/dialogs/StatsSettingsDialog";
import SettingsDialog from "@components/dialogs/SettingsDialog";
import ColumnVisibilityDialog from "@components/dialogs/ColumnVisibilityDialog";
import ColumnFilterDialog from "@components/dialogs/ColumnFilterDialog";
import FeedbackDialog from "../../feedback/FeedbackDialog";

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const [columnFilterDialogOpen, setColumnFilterDialogOpen] = useState(false);
  const [columnFilterDialogConfig, setColumnFilterDialogConfig] = useState<ColumnFilterDialogConfig | null>(null);
  const [columnVisibilityDialogOpen, setColumnVisibilityDialogOpen] = useState(false);
  const [columnVisibilityDialogConfig, setColumnVisibilityDialogConfig] = useState<ColumnVisibilityDialogConfig | null>(null);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
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

  const toggleFeedbackOpen = () => setFeedbackOpen(prev => !prev);

  const openColumnFilterDialog = (config: ColumnFilterDialogConfig) => {
    setColumnFilterDialogConfig(config);
    setColumnFilterDialogOpen(true);
  };

  const closeColumnFilterDialog = () => {
    setColumnFilterDialogOpen(false);
    setColumnFilterDialogConfig(null);
  };

  const openColumnVisibilityDialog = (config: ColumnVisibilityDialogConfig) => {
    setColumnVisibilityDialogConfig(config);
    setColumnVisibilityDialogOpen(true);
  };

  const closeColumnVisibilityDialog = () => {
    setColumnVisibilityDialogOpen(false);
    setColumnVisibilityDialogConfig(null);
  };

  return (
    <DialogContext.Provider
      value={{
        columnFilterDialogOpen,
        columnFilterDialogConfig,
        columnVisibilityDialogOpen,
        columnVisibilityDialogConfig,
        deleteDialogOpen,
        feedbackOpen,
        settingsDialogOpen,
        statsOrderDialogOpen,
        statsOrderKey,
        openColumnFilterDialog,
        closeColumnFilterDialog,
        openColumnVisibilityDialog,
        closeColumnVisibilityDialog,
        toggleFeedbackOpen,
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
      <ColumnFilterDialog />
      <ColumnVisibilityDialog />
      <FeedbackDialog/>
      {children}
    </DialogContext.Provider>
  );
};