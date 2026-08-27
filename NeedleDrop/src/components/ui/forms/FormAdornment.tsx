import { Box, IconButton, Tooltip } from "@mui/material";
import { Cancel, Delete, Edit, Save } from "@mui/icons-material";

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
  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      {isEditor && (
        <Box
          sx={{
            width: isEditing ? 0 : 48,
            opacity: isEditing ? 0 : 1,
            transform: isEditing ? "translateX(-8px)" : "translateX(0)",
            overflow: "hidden",
            flexShrink: 0,
            transition: "width 250ms ease, opacity 180ms ease, transform 250ms ease",
            pointerEvents: isEditing ? "none" : "auto",
          }}
          aria-hidden={isEditing}
        >
          <Tooltip title="Edit">
            <IconButton onClick={onEdit} aria-label="Edit">
              <Edit />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isEditing ? "1fr" : "0fr",
          opacity: isEditing ? 1 : 0,
          transform: isEditing ? "translateX(0)" : "translateX(16px)",
          transition: "grid-template-columns 250ms ease, opacity 180ms ease, transform 250ms ease",
          pointerEvents: isEditing ? "auto" : "none",
        }}
          aria-hidden={!isEditing}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", minWidth: 0, overflow: "hidden" }}>
        <Tooltip title="Cancel">
          <IconButton onClick={onCancel} aria-label="Cancel">
            <Cancel />
          </IconButton>
        </Tooltip>

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
      </Box>
    </Box>
  );
};

export default FormAdornment;