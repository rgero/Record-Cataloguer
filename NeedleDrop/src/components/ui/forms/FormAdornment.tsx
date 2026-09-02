import { Box, IconButton, Tooltip } from "@mui/material";
import { Close, Delete, Edit, Save } from "@mui/icons-material";

type FormMode = "create" | "edit";

interface FormActionsProps {
  mode: FormMode;
  isEditing: boolean;
  isEditor: boolean;
  onCancel: () => void;
  onDelete?: () => void;
  onEdit: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  createLabel?: string;
}

const FormAdornment = ({mode, isEditing, isEditor, onCancel, onDelete, onEdit, onSave, saveDisabled = false, createLabel = "Create"}: FormActionsProps) => {
  const handleEditToggle = () => {
    if (isEditing) {
      onCancel();
      return;
    }

    onEdit();
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        minHeight: 40,
        flexWrap: "nowrap",
        overflow: "hidden",
      }}
    >
      {isEditor && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mr: 1,
            maxWidth: isEditing ? 220 : 0,
            opacity: isEditing ? 1 : 0,
            transform: isEditing ? "translateX(0)" : "translateX(16px)",
            overflow: "hidden",
            transition: "max-width 250ms ease, opacity 180ms ease, transform 250ms ease",
            pointerEvents: isEditing ? "auto" : "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          aria-hidden={!isEditing}
        >
          {mode === "edit" && onDelete && (
            <Tooltip title="Delete">
              <IconButton onClick={onDelete} aria-label="Delete" color="error">
                <Delete />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={mode === "create" ? createLabel : "Save Changes"}>
            <span>
              <IconButton onClick={onSave} aria-label={mode === "create" ? createLabel : "Save Changes"} color="success" disabled={saveDisabled}>
                <Save />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}

      {isEditor && (
        <Tooltip title={isEditing ? "Dismiss" : "Edit"}>
          <IconButton onClick={handleEditToggle} aria-label={isEditing ? "Dismiss edit options" : "Edit"} sx={{ flexShrink: 0 }}>
            {isEditing ? <Close /> : <Edit />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default FormAdornment;