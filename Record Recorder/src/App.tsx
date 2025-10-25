import { Container, Typography } from "@mui/material"

import DarkModeProvider from "./context/theme/DarkModeProvider"

const App = () => {
  return (
    <DarkModeProvider>
      <Container>
        <Typography>Coming soon!</Typography>
      </Container>
    </DarkModeProvider>
  )
}

export default App
