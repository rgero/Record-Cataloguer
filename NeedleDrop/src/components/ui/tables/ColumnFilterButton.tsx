import { useMemo, useState } from "react";
import {alpha, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Fade, IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography, useMediaQuery, useTheme} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TagIcon from "@mui/icons-material/Tag";
import NumbersIcon from "@mui/icons-material/Numbers";
import EventIcon from "@mui/icons-material/Event";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ListAltIcon from "@mui/icons-material/ListAlt";
import type { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "react-router-dom";
import {type BooleanFilterValue, type ColumnFilterDraft, type ColumnFilterDraftMap, type DateFilterOperator, type FilterableColumnOption, type NumberFilterOperator, type TextFilterOperator, getFilterableColumnOptions, isFilterDraftActive, parseColumnFilterDraftMapFromSearchParams, writeColumnFilterDraftMapToSearchParams} from "./urlColumnFilters";

interface ColumnFilterButtonProps<T> {
  columns: ColumnDef<T, any>[];
}

const ColumnFilterButton = <T,>({ columns }: ColumnFilterButtonProps<T>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  const filterOptions = useMemo(() => {
    const options = getFilterableColumnOptions(columns);
    return options.filter((option) => {
      const matchingColumn = columns.find((col) => col.id === option.id);
      return !matchingColumn?.meta?.disableFilter;
    });
  }, [columns]);

  const activeFilterMap = useMemo(
    () => parseColumnFilterDraftMapFromSearchParams(searchParams, filterOptions),
    [searchParams, filterOptions],
  );

  const [draftFilterMap, setDraftFilterMap] = useState<ColumnFilterDraftMap>({});

  const handleOpen = () => {
    setDraftFilterMap(activeFilterMap);
    setOpen(true);
  };

  const handleApply = () => {
    const nextParams = writeColumnFilterDraftMapToSearchParams(searchParams, draftFilterMap);
    setSearchParams(nextParams, { replace: true });
    setOpen(false);
  };

  const handleReset = () => {
    const nextParams = writeColumnFilterDraftMapToSearchParams(searchParams, {});
    setSearchParams(nextParams, { replace: true });
    setDraftFilterMap({});
  };

  const activeFilterCount = Object.values(activeFilterMap).filter((draft) => isFilterDraftActive(draft)).length;

  const updateDraft = (columnId: string, updater: (draft: ColumnFilterDraft) => ColumnFilterDraft) => {
    setDraftFilterMap((previous) => {
      const current = previous[columnId] ?? activeFilterMap[columnId];
      if (!current) {
        return previous;
      }

      return {
        ...previous,
        [columnId]: updater(current),
      };
    });
  };

  const getVariantIcon = (variant: ColumnFilterDraft["variant"]) => {
    if (variant === "number") {
      return <NumbersIcon fontSize="small" />;
    }

    if (variant === "date") {
      return <EventIcon fontSize="small" />;
    }

    if (variant === "boolean") {
      return <ToggleOnIcon fontSize="small" />;
    }

    if (variant === "select") {
      return <ListAltIcon fontSize="small" />;
    }

    return <TagIcon fontSize="small" />;
  };

  const renderFilterInput = (option: FilterableColumnOption) => {
    const draft = draftFilterMap[option.id] ?? activeFilterMap[option.id];
    if (!draft) {
      return null;
    }

    if (draft.variant === "number") {
      return (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <TextField
            select
            label="Condition"
            value={draft.operator}
            size="small"
            sx={{ minWidth: 170 }}
            onChange={(event) => {
              const nextOperator = event.target.value as NumberFilterOperator;
              updateDraft(option.id, (current) => {
                if (current.variant !== "number") {
                  return current;
                }

                return {
                  ...current,
                  operator: nextOperator,
                };
              });
            }}
          >
            <MenuItem value="gt">Greater Than</MenuItem>
            <MenuItem value="lt">Less Than</MenuItem>
            <MenuItem value="eq">Equal To</MenuItem>
          </TextField>
          <TextField
            label="Value"
            type="number"
            value={draft.value}
            size="small"
            fullWidth
            onChange={(event) => {
              updateDraft(option.id, (current) => {
                if (current.variant !== "number") {
                  return current;
                }

                return {
                  ...current,
                  value: event.target.value,
                };
              });
            }}
          />
        </Stack>
      );
    }

    if (draft.variant === "date") {
      return (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <TextField
            select
            label="Condition"
            value={draft.operator}
            size="small"
            sx={{ minWidth: 170 }}
            onChange={(event) => {
              const nextOperator = event.target.value as DateFilterOperator;
              updateDraft(option.id, (current) => {
                if (current.variant !== "date") {
                  return current;
                }

                return {
                  ...current,
                  operator: nextOperator,
                };
              });
            }}
          >
            <MenuItem value="eq">Equals</MenuItem>
            <MenuItem value="after">After</MenuItem>
            <MenuItem value="before">Before</MenuItem>
            <MenuItem value="between">Between</MenuItem>
          </TextField>

          {draft.operator === "between" ? (
            <>
              <TextField
                label="From"
                type="date"
                size="small"
                value={draft.from}
                onChange={(event) => {
                  updateDraft(option.id, (current) => {
                    if (current.variant !== "date") {
                      return current;
                    }

                    return {
                      ...current,
                      from: event.target.value,
                    };
                  });
                }}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
              <TextField
                label="To"
                type="date"
                size="small"
                value={draft.to}
                onChange={(event) => {
                  updateDraft(option.id, (current) => {
                    if (current.variant !== "date") {
                      return current;
                    }

                    return {
                      ...current,
                      to: event.target.value,
                    };
                  });
                }}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            </>
          ) : (
            <TextField
              label="Date"
              type="date"
              size="small"
              value={draft.value}
              onChange={(event) => {
                updateDraft(option.id, (current) => {
                  if (current.variant !== "date") {
                    return current;
                  }

                  return {
                    ...current,
                    value: event.target.value,
                  };
                });
              }}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          )}
        </Stack>
      );
    }

    if (draft.variant === "boolean") {
      return (
        <TextField
          select
          label="Value"
          value={draft.value}
          size="small"
          fullWidth
          onChange={(event) => {
            const nextValue = event.target.value as BooleanFilterValue;
            updateDraft(option.id, (current) => {
              if (current.variant !== "boolean") {
                return current;
              }

              return {
                ...current,
                value: nextValue,
              };
            });
          }}
        >
          <MenuItem value="">Any</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </TextField>
      );
    }

    if (draft.variant === "select") {
      return (
        <TextField
          select
          label="Value"
          value={draft.value}
          size="small"
          fullWidth
          onChange={(event) => {
            updateDraft(option.id, (current) => {
              if (current.variant !== "select") {
                return current;
              }

              return {
                ...current,
                value: event.target.value,
              };
            });
          }}
        >
          <MenuItem value="">Any</MenuItem>
          {option.options.map((value) => (
            <MenuItem key={value} value={value}>{value}</MenuItem>
          ))}
        </TextField>
      );
    }

    return (
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
        <TextField
          select
          label="Condition"
          value={draft.operator}
          size="small"
          sx={{ minWidth: 170 }}
          onChange={(event) => {
            const nextOperator = event.target.value as TextFilterOperator;
            updateDraft(option.id, (current) => {
              if (current.variant !== "text") {
                return current;
              }

              return {
                ...current,
                operator: nextOperator,
              };
            });
          }}
        >
          <MenuItem value="includes">Includes</MenuItem>
          <MenuItem value="excludes">Does not include</MenuItem>
        </TextField>
        <TextField
          label="Value"
          value={draft.value}
          onChange={(event) => {
            updateDraft(option.id, (current) => {
              if (current.variant !== "text") {
                return current;
              }

              return {
                ...current,
                value: event.target.value,
              };
            });
          }}
          fullWidth
          size="small"
        />
      </Stack>
    );
  };

  return (
    <>
      <Tooltip title="Table filters">
        <IconButton
          onClick={handleOpen}
          aria-label="Configure table filters"
          color={activeFilterCount > 0 ? "primary" : "default"}
        >
          <SearchIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog
        fullScreen={isMobile}
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        slots={{ transition: Fade }}
        transitionDuration={{ enter: 300, exit: 200 }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <SearchIcon fontSize="small" />
            <Typography variant="h6" component="span">Column Filters</Typography>
            {activeFilterCount > 0 ? <Chip size="small" color="primary" label={`${activeFilterCount} active`} /> : null}
          </Stack>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 1)} 45%)`,
          }}
        >
          <Stack spacing={1.5} sx={{ pt: 0.75 }}>
            {filterOptions.map((option, index) => {
              const draft = draftFilterMap[option.id] ?? activeFilterMap[option.id];
              if (!draft) {
                return null;
              }

              return (
                <Fade
                  key={option.id}
                  in={open}
                  timeout={{ enter: 180 + index * 45, exit: 120 }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      px: 1.5,
                      py: 1.25,
                      borderRadius: 2,
                      borderColor: isFilterDraftActive(draft) ? alpha(theme.palette.primary.main, 0.55) : "divider",
                      backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="subtitle2">{option.label}</Typography>
                        <Chip
                          icon={getVariantIcon(draft.variant)}
                          label={draft.variant}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                      <Box>{renderFilterInput(option)}</Box>
                    </Stack>
                  </Paper>
                </Fade>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReset}>Reset</Button>
          <Button onClick={handleApply} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ColumnFilterButton;
