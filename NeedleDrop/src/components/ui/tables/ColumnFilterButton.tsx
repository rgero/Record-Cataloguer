import { IconButton, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { ColumnDef } from "@tanstack/react-table";
import { useDialogProvider } from "@context/dialog/DialogContext";

interface ColumnFilterButtonProps<T> {
  columns: ColumnDef<T, any>[];
}

const ColumnFilterButton = <T,>({ columns }: ColumnFilterButtonProps<T>) => {
  const { openColumnFilterDialog } = useDialogProvider();

  return (
    <Tooltip title="Table filters">
      <IconButton
        onClick={() => openColumnFilterDialog({ columns: columns as ColumnDef<unknown, any>[] })}
        aria-label="Configure table filters"
      >
        <SearchIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default ColumnFilterButton;
