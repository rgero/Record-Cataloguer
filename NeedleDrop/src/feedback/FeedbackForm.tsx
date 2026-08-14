import { Container, Grid, Stack, TextField, Typography } from "@mui/material"
import { DoNotDisturb, ThumbUpAlt } from "@mui/icons-material";

import Button from "@components/ui/Button";
import toast from "react-hot-toast";
import { useCreateFeedback } from "./hooks/useCreateFeedback";
import { useDialogProvider } from "@context/dialog/DialogContext";
import { useState } from "react"

const FeedbackForm = () => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const {isAdding, addFeedback} = useCreateFeedback();
  const {toggleFeedbackOpen} = useDialogProvider();
  const maxLength:number = 10000;

  const handleSubmit = async () => {
    if (title == "")
    {
      toast.error("Suggestion field cannot be empty")
      return;
    }
    
    addFeedback({title, description: details}, {onSuccess: () => {
      setDetails("");
      setTitle("");
      toggleFeedbackOpen();
    }});
  }

  const clearFeedback = () => {
    setTitle("");
    setDetails("");
  }
  
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
    <Container>
      <Stack spacing={2}>
        <TextField
          id="outlined-controlled suggestion"
          label="Suggestion"
          placeholder="Enter your suggestion here"
          fullWidth
          value={title}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setTitle(event.target.value);
          }}
          required
          disabled={isAdding}
        />
        <div>
          <TextField
            id="outlined-controlled details"
            label="Additional Details"
            placeholder="Enter any additional details here (optional)"
            fullWidth
            multiline
            rows={5}
            value={details}
            slotProps={{
              htmlInput: {
                maxLength: 10000,
              },
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setDetails(event.target.value);
            }}
            disabled={isAdding}
          />
          <Grid container sx={{ justifyContent: "flex-end" }}>
            <Grid>
              <Typography variant="caption">
                {formatNumber(details.length)} / {formatNumber(maxLength)}
              </Typography>
            </Grid>
          </Grid>
        </div>
        <Grid container sx={{ justifyContent: "space-evenly", paddingTop: 4 }}>
          <Grid>
            <Button onClick={clearFeedback} icon={<DoNotDisturb/>} title="Clear" color="error"/>
          </Grid>
          <Grid>
            <Button onClick={handleSubmit} icon={<ThumbUpAlt/>} title="Submit" color="success"/>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  )
}

export default FeedbackForm
