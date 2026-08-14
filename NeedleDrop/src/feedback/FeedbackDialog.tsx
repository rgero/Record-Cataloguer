import { Container, Dialog, Typography } from "@mui/material"

import FeedbackForm from "./FeedbackForm"
import { useDialogProvider } from "@context/dialog/DialogContext";

const FeedbackDialog = () => {
  const {feedbackOpen, toggleFeedbackOpen} = useDialogProvider();
  return (
    <Dialog open={feedbackOpen} onClose={toggleFeedbackOpen}>
      <Container sx={{padding: "20px", backgroundColor: "background.paper", width: {md: "500px", xs: "100%"}}}>
        <Typography variant="h6" sx={{marginBottom: "10px"}}>
          Feedback
        </Typography>
        <FeedbackForm/>
      </Container>
    </Dialog>
  )
}

export default FeedbackDialog
