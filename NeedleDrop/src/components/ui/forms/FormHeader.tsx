import { Grid, Typography } from "@mui/material"

const FormHeader = ({isCreateMode,rightAdornment = null}: {isCreateMode: boolean, rightAdornment?: React.ReactNode}) => {
  return (
    <Grid
      container
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        mb: 4
      }}>
      <Grid container sx={{
        alignItems: "center"
      }}>
        <Typography 
          variant="h4" 
          sx={{ fontWeight: 'bold' }}
        >
          {isCreateMode ? "Add New" : "Details"}
        </Typography>
      </Grid>
      {rightAdornment && (
        <Grid>
          {rightAdornment}
        </Grid>
      )}
    </Grid>
  );
}

export default FormHeader
