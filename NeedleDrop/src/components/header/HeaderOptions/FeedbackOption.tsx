import { Feedback } from "@mui/icons-material";
import MenuOption from "@interfaces/MenuOption";
import { useDialogProvider } from "@context/dialog/DialogContext";

const FeedbackOption = () => {
  const {toggleFeedbackOpen} = useDialogProvider();
  return (
    <MenuOption icon={<Feedback />} text="Log Feedback" onClick={toggleFeedbackOpen} />
  )
}

export default FeedbackOption
