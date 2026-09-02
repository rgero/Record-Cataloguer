import { Divider, Grid, Typography } from "@mui/material"

const FormHeader = ({isCreateMode,rightAdornment = null}: {isCreateMode: boolean, rightAdornment?: React.ReactNode}) => {
  return (
    <>
    <Grid
      container
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        columnGap: 2,
        flexWrap: "nowrap",
      }}
    >
      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          minWidth: 0,
          flex: 1,
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', lineHeight: 1.2 }}
        >
          {isCreateMode ? "Add New" : "Details"}
        </Typography>
      </Grid>

      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          minWidth: 0,
          flexShrink: 0,
        }}
      >
        {rightAdornment}
      </Grid>
    </Grid>
    <Divider sx={{mt: 1, mb: 2}}/>
    </>
  );
}

export default FormHeader
