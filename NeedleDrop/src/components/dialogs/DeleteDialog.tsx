import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"

import { useDialogProvider } from "@context/dialog/DialogContext";

const DeleteDialog = () => {
  const {dialogDetails, deleteDialogOpen, confirmAction, closeDeleteDialog} = useDialogProvider();

  const handleConfirm = async () => {
    await confirmAction();
    closeDeleteDialog();
  };

  return (
    <Dialog 
        open={deleteDialogOpen} 
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
    >
      <DialogTitle id="delete-dialog-title">Delete {dialogDetails?.type}?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete <strong>{dialogDetails?.name}</strong>? 
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={closeDeleteDialog}>Cancel</Button>
        <Button onClick={handleConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteDialog
