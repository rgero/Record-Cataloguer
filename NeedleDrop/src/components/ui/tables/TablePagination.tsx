import { Box, Button, MenuItem, Select, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

import type { Table } from "@tanstack/react-table";

interface TablePaginationProps<T> {
  table: Table<T>;
}

const TablePagination = <T,>({ table }: TablePaginationProps<T>) => {
  return (
    <Box
      sx={{
        position: "sticky",
        bottom: "0",
        width: "100%",
        maxWidth: { xs: "100%" },
        mx: "auto",
        display: "flex",
        flexDirection: "row",
        justifyContent: { xs: "space-between", sm: "space-between" },
        alignItems: "center",
        gap: { xs: 1, sm: 2 },
        px: 2,
        py: 1,
        backgroundColor: "background.paper",
        borderTop: "1px solid",
        borderBottom: "none",
        borderColor: "rgba(0, 0, 0, 0.08)",
        boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
        zIndex: 1001,
        flexWrap: "wrap",
      }}
    >
      {/* Row Count Display */}
      <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, whiteSpace: "nowrap" }}>
        {table.getFilteredRowModel().rows.length === 0 ? (
          "No rows"
        ) : (
          <>
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of {table.getFilteredRowModel().rows.length}
          </>
        )}
      </Typography>

      {/* Page Size Selector and Navigation */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: "nowrap", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            Rows:
          </Typography>
          <Select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            size="small"
            sx={{ minWidth: "50px", height: "32px" }}
          >
            {[10, 25, 50, 100].map((pageSize) => (
              <MenuItem key={pageSize} value={pageSize}>
                {pageSize}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Pagination Buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            size="small"
            variant="outlined"
            sx={{ minWidth: "32px" }}
          >
            <ChevronLeft />
          </Button>
          <Typography variant="body2" sx={{ minWidth: "35px", textAlign: "center", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
          </Typography>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            size="small"
            variant="outlined"
            sx={{ minWidth: "32px" }}
          >
            <ChevronRight />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TablePagination;
