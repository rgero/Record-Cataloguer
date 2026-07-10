import {Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, IconButton, List, ListItem, ListItemIcon, ListItemText, Tooltip, useMediaQuery, useTheme} from "@mui/material";
import { useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";

import type { ColumnDef } from "@tanstack/react-table";
import { DefaultSettings } from "@interfaces/settings/DefaultSettings";
import { DragHandle } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import type { UserSettings } from "@interfaces/settings/UserSettings";
import { useUserContext } from "@context/users/UserContext";
import {RotateLeft} from '@mui/icons-material';

type TableKeys = Extract<keyof UserSettings, "locations" | "playlogs" | "vinyls" | "wantedItems">;

interface ColumnVisibilityButtonProps<T> {
  columns: ColumnDef<T, any>[];
  settingsColumn: TableKeys;
}

interface VisibilityOption {
  id: string;
  label: string;
}

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

const prettifyColumnId = (value: string) => {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

const ColumnVisibilityButton = <T,>({ columns, settingsColumn }: ColumnVisibilityButtonProps<T>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const { getCurrentUserSettings, updateCurrentUserSettings } = useUserContext();

  const visibilityOptions = useMemo<VisibilityOption[]>(() => {
    return columns
      .map((columnDef) => {
        const rawId = typeof columnDef.id === "string" ? columnDef.id : "accessorKey" in columnDef && typeof columnDef.accessorKey === "string" ? columnDef.accessorKey : null;
        if (!rawId) {
          return null;
        }

        const rawHeader = columnDef.header;
        const label = typeof rawHeader === "string" ? rawHeader : prettifyColumnId(rawId);

        return {
          id: rawId,
          label,
        };
      })
      .filter((option): option is VisibilityOption => Boolean(option));
  }, [columns]);

  const defaultColumnOrder = useMemo(() => visibilityOptions.map((option) => option.id), [visibilityOptions]);

  const visibilityModel =
    getCurrentUserSettings()?.[settingsColumn] ??
    DefaultSettings[settingsColumn];
  const visibilityState = visibilityModel as unknown as Record<string, boolean | undefined>;

  const currentColumnOrder = useMemo(() => {
    const persistedOrder = getCurrentUserSettings()?.tableColumnOrders?.[settingsColumn]
      ?? DefaultSettings.tableColumnOrders?.[settingsColumn]
      ?? [];

    return normalizeColumnOrder(persistedOrder, defaultColumnOrder);
  }, [defaultColumnOrder, getCurrentUserSettings, settingsColumn]);

  const orderedVisibilityOptions = useMemo(() => {
    const optionsById = new Map(visibilityOptions.map((option) => [option.id, option]));
    return currentColumnOrder
      .map((columnId) => optionsById.get(columnId))
      .filter((option): option is VisibilityOption => Boolean(option));
  }, [currentColumnOrder, visibilityOptions]);

  const handleToggle = (columnId: string) => {
    updateCurrentUserSettings({
      [settingsColumn]: {
        ...visibilityModel,
        [columnId]: !(visibilityState[columnId] ?? true),
      },
    });
  };

  const handleResetToDefaults = () => {
    updateCurrentUserSettings({
      [settingsColumn]: {
        ...DefaultSettings[settingsColumn],
      },
    });
  };

  const handleResetOrder = () => {
    const currentTableColumnOrders = getCurrentUserSettings()?.tableColumnOrders ?? DefaultSettings.tableColumnOrders;

    updateCurrentUserSettings({
      tableColumnOrders: {
        ...currentTableColumnOrders,
        [settingsColumn]: defaultColumnOrder,
      },
    });
  };

  const handleReorder = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const reordered = Array.from(orderedVisibilityOptions);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);

    const nextOrder = reordered.map((option) => option.id);
    const currentTableColumnOrders = getCurrentUserSettings()?.tableColumnOrders ?? DefaultSettings.tableColumnOrders;

    updateCurrentUserSettings({
      tableColumnOrders: {
        ...currentTableColumnOrders,
        [settingsColumn]: nextOrder,
      },
    });
  };

  return (
    <>
      <Tooltip title="Table columns">
        <IconButton
          onClick={() => setOpen(true)}
          aria-label="Configure visible columns"
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog
        fullScreen={isMobile}
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
        slots={{ transition: Fade }}
        transitionDuration={{ enter: 300, exit: 200 }}
      >
        <DialogTitle>Columns & Order</DialogTitle>
        <DialogContent dividers>
          <DragDropContext onDragEnd={handleReorder}>
            <Droppable droppableId="table-column-order" type="DEFAULT">
              {(provided) => (
                <List ref={provided.innerRef} {...provided.droppableProps} disablePadding>
                  {orderedVisibilityOptions.map((option, index) => (
                    <Draggable key={option.id} draggableId={option.id} index={index}>
                      {(draggableProvided, snapshot) => (
                        <Fade in={open} timeout={{ enter: 180 + index * 45, exit: 120 }}>
                          <ListItem
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            sx={{
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 1,
                              mb: 0.5,
                              bgcolor: snapshot.isDragging ? "action.hover" : "background.paper",
                              boxShadow: snapshot.isDragging ? 3 : 0,
                            }}
                            secondaryAction={
                              <IconButton edge="end" {...draggableProvided.dragHandleProps} aria-label={`Reorder ${option.label}`}>
                                <DragHandle />
                              </IconButton>
                            }
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Checkbox
                                edge="start"
                                checked={visibilityState[option.id] ?? true}
                                onChange={() => handleToggle(option.id)}
                              />
                            </ListItemIcon>
                            <ListItemText primary={option.label} />
                          </ListItem>
                        </Fade>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetToDefaults} startIcon={<RotateLeft/>} sx={{ '& .MuiButton-startIcon': { marginRight: '1px' } }}>Visibility</Button>
          <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.25 }} />
          <Button onClick={handleResetOrder} startIcon={<RotateLeft/>} sx={{ '& .MuiButton-startIcon': { marginRight: '1px' } }}>Order</Button>
          <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.25 }} />
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ColumnVisibilityButton;