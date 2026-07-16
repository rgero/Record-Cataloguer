import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, IconButton, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme } from "@mui/material";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { DragHandle, RotateLeft } from "@mui/icons-material";
import { useMemo } from "react";

import { DefaultSettings } from "@interfaces/settings/DefaultSettings";
import { useDialogProvider } from "@context/dialog/DialogContext";
import { useUserContext } from "@context/users/UserContext";

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

const ColumnVisibilityDialog = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { getCurrentUserSettings, updateCurrentUserSettings } = useUserContext();
  const { columnVisibilityDialogOpen, columnVisibilityDialogConfig, closeColumnVisibilityDialog } = useDialogProvider();

  const visibilityOptions = useMemo<VisibilityOption[]>(() => {
    const columns = columnVisibilityDialogConfig?.columns ?? [];

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
  }, [columnVisibilityDialogConfig]);

  const defaultColumnOrder = useMemo(() => visibilityOptions.map((option) => option.id), [visibilityOptions]);

  const settingsColumn = columnVisibilityDialogConfig?.settingsColumn;
  const visibilityModel = settingsColumn
    ? getCurrentUserSettings()?.[settingsColumn] ?? DefaultSettings[settingsColumn]
    : null;
  const visibilityState = visibilityModel as unknown as Record<string, boolean | undefined>;

  const currentColumnOrder = useMemo(() => {
    if (!settingsColumn) {
      return [];
    }

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

  if (!columnVisibilityDialogConfig || !settingsColumn) {
    return null;
  }

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
    <Dialog
      fullScreen={isMobile}
      open={columnVisibilityDialogOpen}
      onClose={closeColumnVisibilityDialog}
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
                      <Fade in={columnVisibilityDialogOpen} timeout={{ enter: 180 + index * 45, exit: 120 }}>
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
        <Button onClick={handleResetToDefaults} startIcon={<RotateLeft />} sx={{ "& .MuiButton-startIcon": { marginRight: "1px" } }}>Visibility</Button>
        <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.25 }} />
        <Button onClick={handleResetOrder} startIcon={<RotateLeft />} sx={{ "& .MuiButton-startIcon": { marginRight: "1px" } }}>Order</Button>
        <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.25 }} />
        <Button onClick={closeColumnVisibilityDialog}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnVisibilityDialog;
