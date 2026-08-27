import { Box, Button } from "@mui/material";

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

const FormActions = ({mode, isEditing, isEditor, onCancel, onDelete, onEdit, onSave, saveDisabled = false, createLabel = "Create"}: FormActionsProps) => {
  if (!isEditing) {
    return isEditor ? (
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", width: "100%" }}>
        <Button variant="contained" size="large" onClick={onEdit}>
          Edit
        </Button>
      </Box>
    ) : null;
  }

  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", width: "100%" }}>
      <Button variant="outlined" size="large" onClick={onCancel}>
        Cancel
      </Button>

      {mode === "edit" && onDelete && (
        <Button variant="contained" size="large" onClick={onDelete} color="error">
          Delete
        </Button>
      )}

      <Button variant="contained" size="large" onClick={onSave} color="success" disabled={saveDisabled}>
        {mode === "create" ? createLabel : "Save Changes"}
      </Button>
    </Box>
  );
};

export default FormActions;