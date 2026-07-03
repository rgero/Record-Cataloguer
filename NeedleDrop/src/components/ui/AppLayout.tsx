import { Box, Container } from "@mui/material"

import BottomNav from "@components/ui/BottomNav"
import HeaderBar from "../header/HeaderBar"
import { Outlet } from "react-router-dom"

const AppLayout = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(var(--vh, 1vh) * 100)"
      }}>
      <HeaderBar/>
      <Box
        id="scroll-container"
        sx={{
          flexGrow: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          mt: "1rem",
        }}>
        <Container disableGutters sx={{ width: { xs: "95%", md: "90%" } }}>
          <Outlet />
        </Container>
      </Box>
      <BottomNav/>
    </Box>
  );
}

export default AppLayout
