import { IconButton, Tooltip } from "@mui/material";

import SettingsIcon from "@mui/icons-material/Settings";
import { useDialogProvider } from "@context/dialog/DialogContext";
import type { TableSettingsKey } from "@context/dialog/tableDialogTypes";

import type { ColumnDef } from "@tanstack/react-table";

interface ColumnVisibilityButtonProps<T> {
  columns: ColumnDef<T, any>[];
  settingsColumn: TableSettingsKey;
}

const ColumnVisibilityButton = <T,>({ columns, settingsColumn }: ColumnVisibilityButtonProps<T>) => {
  const { openColumnVisibilityDialog } = useDialogProvider();

  return (
    <Tooltip title="Table columns">
      <IconButton
        onClick={() => openColumnVisibilityDialog({ columns: columns as ColumnDef<unknown, any>[], settingsColumn })}
        aria-label="Configure visible columns"
      >
        <SettingsIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default ColumnVisibilityButton;