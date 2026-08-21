import { Box, Container, Typography, useTheme } from "@mui/material";

const Empty = ({title} : {title: string}) => {
  const theme = useTheme();

  return (
    <Container
      disableGutters
      sx={{padding: 3, alignItems: 'center', justifyContent: 'center', display: 'flex'}}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "90%",
          paddingY: 5,
          bgcolor: theme.palette.background.default,
        }}
      >
        <Typography>{title}</Typography>
      </Box>
    </Container>
  )
}

export default Empty
