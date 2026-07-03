import {flexRender, 
  type ColumnOrderState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { DefaultSettings } from "@interfaces/settings/DefaultSettings";
import type { UserSettings } from "@interfaces/settings/UserSettings";
import { useEffect, useMemo, useState } from "react";
import { useUserContext } from "@context/users/UserContext";
import { Table, TableBody, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Box } from "@mui/material";
import { StyledTableCell } from "./StyledTableCell";
import { StyledTableRow } from "./StyledTableRow";
import TablePagination from "./TablePagination";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  type BooleanFilterDraft,
  type ColumnFilterDraft,
  type DateFilterDraft,
  type NumberFilterDraft,
  type SelectFilterDraft,
  getFilterableColumnOptions,
  parseColumnFilterDraftMapFromSearchParams,
  toColumnFiltersState,
  writeColumnFilterDraftMapToSearchParams,
} from "./urlColumnFilters";

type TableKeys = Extract<keyof UserSettings, "locations" | "playlogs" | "vinyls" | "wantedItems">;

const tableDetailRouteByKey: Record<TableKeys, string> = {
  locations: "/locations",
  playlogs: "/plays",
  vinyls: "/vinyls",
  wantedItems: "/wantlist",
};

const resolveColumnId = <T,>(columnDef: ColumnDef<T, any>): string | null => {
  if (typeof columnDef.id === "string") {
    return columnDef.id;
  }

  if ("accessorKey" in columnDef && typeof columnDef.accessorKey === "string") {
    return columnDef.accessorKey;
  }

  return null;
};

const normalizeColumnOrder = (order: string[], defaults: string[]) => {
  const seen = new Set<string>();
  const normalized = order.filter((id) => {
    if (!defaults.includes(id) || seen.has(id)) {
      return false;
    }

    seen.add(id);
    return true;
  });

  const missingDefaults = defaults.filter((id) => !seen.has(id));
  return [...normalized, ...missingDefaults];
};

interface ReactTableProps<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  data: T[];
  settingsColumn: TableKeys;
  getRowSx?: (row: T) => object;
}

const ReactTable = <T,>({ columns, data, settingsColumn, getRowSx }: ReactTableProps<T>) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getCurrentUserSettings, updateCurrentUserSettings } = useUserContext();

  const settingsVisibility = useMemo(() => {
    const settings = getCurrentUserSettings()?.[settingsColumn];
    return settings ?? DefaultSettings[settingsColumn];
  }, [getCurrentUserSettings, settingsColumn]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    settingsVisibility as unknown as VisibilityState,
  );

  const settingsSorting = useMemo<SortingState>(() => {
    const sortModels = getCurrentUserSettings()?.sortModels?.[settingsColumn]
      ?? DefaultSettings.sortModels?.[settingsColumn]
      ?? [];

    return sortModels.map((sortModel) => ({
      id: sortModel.field,
      desc: sortModel.sort === "desc",
    }));
  }, [getCurrentUserSettings, settingsColumn]);

  const [sorting, setSorting] = useState<SortingState>(settingsSorting);

  const settingsPageSize = useMemo(() => {
    return getCurrentUserSettings()?.pageSize ?? DefaultSettings.pageSize;
  }, [getCurrentUserSettings]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: settingsPageSize,
  });

  const filterableColumns = useMemo(() => getFilterableColumnOptions(columns), [columns]);

  const defaultColumnOrder = useMemo<ColumnOrderState>(() => {
    return columns
      .map((columnDef) => resolveColumnId(columnDef))
      .filter((columnId): columnId is string => Boolean(columnId));
  }, [columns]);

  const settingsColumnOrder = useMemo<ColumnOrderState>(() => {
    const persistedOrder = getCurrentUserSettings()?.tableColumnOrders?.[settingsColumn]
      ?? DefaultSettings.tableColumnOrders?.[settingsColumn]
      ?? [];

    return normalizeColumnOrder(persistedOrder, defaultColumnOrder);
  }, [defaultColumnOrder, getCurrentUserSettings, settingsColumn]);

  const parsedFilterDraftMap = useMemo(
    () => parseColumnFilterDraftMapFromSearchParams(searchParams, filterableColumns),
    [searchParams, filterableColumns],
  );

  const parsedUrlColumnFilters = useMemo(
    () => toColumnFiltersState(parsedFilterDraftMap),
    [parsedFilterDraftMap],
  );

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(parsedUrlColumnFilters);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(settingsColumnOrder);

  useEffect(() => {
    setColumnVisibility(settingsVisibility as unknown as VisibilityState);
  }, [settingsVisibility]);

  useEffect(() => {
    setSorting(settingsSorting);
  }, [settingsSorting]);

  useEffect(() => {
    setColumnFilters(parsedUrlColumnFilters);
  }, [parsedUrlColumnFilters]);

  useEffect(() => {
    setColumnOrder(settingsColumnOrder);
  }, [settingsColumnOrder]);

  useEffect(() => {
    setPagination((previousState) => ({
      ...previousState,
      pageSize: settingsPageSize,
    }));
  }, [settingsPageSize]);

  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = (updater) => {
    setColumnVisibility((previousState) => {
      const nextState = typeof updater === "function" ? updater(previousState) : updater;

      updateCurrentUserSettings({
        [settingsColumn]: nextState as unknown as UserSettings[TableKeys],
      });

      return nextState;
    });
  };

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((previousState) => {
      const nextState = typeof updater === "function" ? updater(previousState) : updater;
      const currentSortModels = getCurrentUserSettings()?.sortModels ?? DefaultSettings.sortModels;

      updateCurrentUserSettings({
        sortModels: {
          ...currentSortModels,
          [settingsColumn]: nextState.map((sortModel) => ({
            field: String(sortModel.id),
            sort: sortModel.desc ? "desc" : "asc",
          })),
        },
      });

      return nextState;
    });
  };

  const normalizeFilterValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return "";
    }

    if (Array.isArray(value)) {
      return value.map((entry) => normalizeFilterValue(entry)).join(", ");
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (typeof value === "boolean") {
      return value ? "yes true" : "no false";
    }

    if (typeof value === "object") {
      if ("name" in value && typeof value.name === "string") {
        return value.name;
      }

      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }

    return String(value);
  };

  const matchesNumberFilter = (rawValue: unknown, draft: NumberFilterDraft): boolean => {
    const rowValue = Number(rawValue);
    const filterValue = Number(draft.value);

    if (!Number.isFinite(rowValue) || !Number.isFinite(filterValue)) {
      return false;
    }

    if (draft.operator === "gt") {
      return rowValue > filterValue;
    }

    if (draft.operator === "lt") {
      return rowValue < filterValue;
    }

    return rowValue === filterValue;
  };

  const toComparableDateTime = (value: unknown): number | null => {
    if (value instanceof Date) {
      return value.getTime();
    }

    if (typeof value === "string") {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
  };

  const matchesDateFilter = (rawValue: unknown, draft: DateFilterDraft): boolean => {
    const rowDateTime = toComparableDateTime(rawValue);
    if (rowDateTime === null) {
      return false;
    }

    if (draft.operator === "between") {
      const startTime = toComparableDateTime(draft.from);
      const endTime = toComparableDateTime(draft.to);

      if (startTime === null || endTime === null) {
        return false;
      }

      return rowDateTime >= startTime && rowDateTime <= endTime;
    }

    const compareTime = toComparableDateTime(draft.value);
    if (compareTime === null) {
      return false;
    }

    if (draft.operator === "after") {
      return rowDateTime > compareTime;
    }

    return rowDateTime < compareTime;
  };

  const matchesBooleanFilter = (rawValue: unknown, draft: BooleanFilterDraft): boolean => {
    if (draft.value !== "true" && draft.value !== "false") {
      return true;
    }

    const rowBool = Boolean(rawValue);
    return rowBool === (draft.value === "true");
  };

  const matchesSelectFilter = (rawValue: unknown, draft: SelectFilterDraft): boolean => {
    const selectedValue = draft.value.trim().toLowerCase();
    if (!selectedValue) {
      return true;
    }

    const rowValue = normalizeFilterValue(rawValue).trim().toLowerCase();
    return rowValue === selectedValue;
  };

  const includesNormalizedFilter: FilterFn<T> = (row, columnId, filterValue) => {
    const filterDraft = filterValue as ColumnFilterDraft | undefined;

    if (filterDraft?.variant === "select") {
      return matchesSelectFilter(row.getValue(columnId), filterDraft);
    }

    if (filterDraft?.variant === "boolean") {
      return matchesBooleanFilter(row.getValue(columnId), filterDraft);
    }

    if (filterDraft?.variant === "number") {
      return matchesNumberFilter(row.getValue(columnId), filterDraft);
    }

    if (filterDraft?.variant === "date") {
      return matchesDateFilter(row.getValue(columnId), filterDraft);
    }

    if (filterDraft?.variant === "text") {
      const rowValue = normalizeFilterValue(row.getValue(columnId)).toLowerCase();
      const filterText = filterDraft.value.trim().toLowerCase();

      if (!filterText) {
        return true;
      }

      let matches = false;

      if (filterText.includes(",")) {
        const filterTerms = filterText
          .split(",")
          .map((term) => term.trim())
          .filter((term) => term.length > 0);

        if (filterTerms.length === 0) {
          return true;
        }

        const rowTerms = rowValue
          .split(",")
          .map((term) => term.trim())
          .filter((term) => term.length > 0);

        if (rowTerms.length === 0) {
          matches = false;
        } else {
          matches = filterTerms.every((filterTerm) => rowTerms.some((rowTerm) => rowTerm.includes(filterTerm)));
        }
      } else {
        matches = rowValue.includes(filterText);
      }

      // Apply operator logic
      return filterDraft.operator === "includes" ? matches : !matches;
    }

    return true;
  };

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    setColumnFilters((previousState) => {
      const nextState = typeof updater === "function" ? updater(previousState) : updater;

      const draftMap = nextState.reduce<Record<string, ColumnFilterDraft>>((accumulator, filter) => {
        const value = filter.value as ColumnFilterDraft | undefined;
        if (!value) {
          return accumulator;
        }

        accumulator[String(filter.id)] = value;
        return accumulator;
      }, {});

      const nextSearchParams = writeColumnFilterDraftMapToSearchParams(searchParams, draftMap);
      if (nextSearchParams.toString() !== searchParams.toString()) {
        setSearchParams(nextSearchParams, { replace: true });
      }

      return nextState;
    });
  };

  const handleColumnOrderChange: OnChangeFn<ColumnOrderState> = (updater) => {
    setColumnOrder((previousState) => {
      const updatedOrder = typeof updater === "function" ? updater(previousState) : updater;
      const nextState = normalizeColumnOrder(updatedOrder, defaultColumnOrder);
      const currentTableColumnOrders = getCurrentUserSettings()?.tableColumnOrders ?? DefaultSettings.tableColumnOrders;

      updateCurrentUserSettings({
        tableColumnOrders: {
          ...currentTableColumnOrders,
          [settingsColumn]: nextState,
        },
      });

      return nextState;
    });
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    setPagination((previousState) => {
      const nextState = typeof updater === "function" ? updater(previousState) : updater;
      
      // Update user settings when page size changes
      if (nextState.pageSize !== previousState.pageSize) {
        updateCurrentUserSettings({
          pageSize: nextState.pageSize,
        });
      }

      return nextState;
    });
  };

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSortingRemoval: false,
    state: {
      columnVisibility,
      sorting,
      columnFilters,
      columnOrder,
      pagination,
    },
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnOrderChange: handleColumnOrderChange,
    onPaginationChange: handlePaginationChange,
    filterFns: {
      includesNormalizedFilter,
    },
    defaultColumn: {
      filterFn: includesNormalizedFilter,
    },
  });

  const handleRowClick = (row: T) => {
    const rowWithId = row as T & { id?: string | number };
    if (rowWithId.id === undefined || rowWithId.id === null) {
      return;
    }

    navigate(`${tableDetailRouteByKey[settingsColumn]}/${rowWithId.id}`);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table sx={{ minWidth: 700, width: "100%", tableLayout: "fixed" }} aria-label="customized table">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  return (
                    <StyledTableCell
                      key={header.id}
                      sortDirection={isSorted}
                      sx={{ width: header.getSize() }}
                    >
                      <TableSortLabel
                        active={!!isSorted}
                        direction={isSorted || "asc"}
                        onClick={header.column.getToggleSortingHandler()}
                        sx={{
                          color: "inherit !important",
                          whiteSpace: "nowrap",
                          "& .MuiTableSortLabel-icon": {
                            color: "inherit !important",
                          },
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableSortLabel>
                    </StyledTableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <StyledTableRow
                key={row.id}
                sx={{
                  ...(getRowSx ? getRowSx(row.original) : {}),
                  cursor: "pointer",
                }}
                onClick={() => handleRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <StyledTableCell 
                    key={cell.id} 
                    sx={{ width: cell.column.getSize() }} // Maintains structure across columns explicitly
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination table={table} />
    </Box>
  );
};

export default ReactTable;