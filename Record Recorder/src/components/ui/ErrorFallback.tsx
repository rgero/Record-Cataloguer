import { Box, Grid, Typography, useTheme } from "@mui/material";

import { useEffect } from "react";

const ErrorFallback = () => {
  const theme = useTheme();

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();
    window.addEventListener("resize", setVh);

    return () => {
      window.removeEventListener("resize", setVh);
    };
  }, []);

  return (
    <>
      <Box display="flex" flexDirection="column" height="calc(var(--vh, 1vh) * 100)" bgcolor={theme.palette.background.default}>
        <Grid
          container
          sx={{ height: "100vh", paddingTop: "2rem" }}
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h6" align="center">
            An error has occurred. Probably because you did something weird. Be proud and tell us how you got here.
          </Typography>
        </Grid>
      </Box>
    </>

  );
};

export default ErrorFallback;
