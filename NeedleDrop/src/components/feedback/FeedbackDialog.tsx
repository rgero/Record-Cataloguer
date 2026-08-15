import { Dialog, DialogContent, DialogTitle } from "@mui/material"

import FeedbackForm from "./FeedbackForm"
import { useDialogProvider } from "@context/dialog/DialogContext";

const FeedbackDialog = () => {
  const {feedbackOpen, toggleFeedbackOpen} = useDialogProvider();
  return (
    <Dialog open={feedbackOpen} onClose={toggleFeedbackOpen} fullWidth maxWidth="sm" aria-labelledby="feedback-dialog-title">
      <DialogTitle id="feedback-dialog-title">Feedback</DialogTitle>
      <DialogContent>
        <FeedbackForm/>
      </DialogContent>
    </Dialog>
  )
}

export default FeedbackDialog
