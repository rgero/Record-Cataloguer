import type { ColumnDef } from "@tanstack/react-table";

import type { UserSettings } from "@interfaces/settings/UserSettings";

export type TableSettingsKey = Extract<keyof UserSettings, "locations" | "playlogs" | "vinyls" | "wantedItems">;

export type ColumnVisibilityDialogConfig = {
  columns: ColumnDef<unknown, any>[];
  settingsColumn: TableSettingsKey;
};

export type ColumnFilterDialogConfig = {
  columns: ColumnDef<unknown, any>[];
};