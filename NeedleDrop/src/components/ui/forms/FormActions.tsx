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

const fadeDuration = 250;
const fadeDelay = 250;

const FormActions = ({mode, isEditing, isEditor, onCancel, onDelete, onEdit, onSave, saveDisabled = false, createLabel = "Create"}: FormActionsProps) => {
  return (
    <Box
      sx={{
        display: "grid",
        width: "100%",
        "& > *": { gridArea: "1 / 1" },
      }}
    >
      {isEditor && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            opacity: isEditing ? 0 : 1,
            visibility: isEditing ? "hidden" : "visible",
            transition: isEditing
              ? `opacity ${fadeDuration}ms ease, visibility 0ms linear ${fadeDuration}ms`
              : `opacity ${fadeDuration}ms ease ${fadeDelay}ms, visibility 0ms linear 0ms`,
            pointerEvents: isEditing ? "none" : "auto",
          }}
          aria-hidden={isEditing}
        >
          <Button variant="contained" size="large" onClick={onEdit}>
            Edit
          </Button>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          opacity: isEditing ? 1 : 0,
          visibility: isEditing ? "visible" : "hidden",
          transition: isEditing
            ? `opacity ${fadeDuration}ms ease ${fadeDelay}ms, visibility 0ms linear 0ms`
            : `opacity ${fadeDuration}ms ease, visibility 0ms linear ${fadeDuration}ms`,
          pointerEvents: isEditing ? "auto" : "none",
        }}
        aria-hidden={!isEditing}
      >
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
    </Box>
  );
};

export default FormActions;