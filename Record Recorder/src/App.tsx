import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Container, CssBaseline, Typography } from "@mui/material"

import DarkModeProvider from "./context/theme/DarkModeProvider"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "./components/ui/ErrorFallback"
import LandingPage from "./pages/LandingPage"

const App = () => {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={()=> window.location.replace("/")}>
          <Routes>
            <Route path="/" element={<LandingPage/>} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
      <CssBaseline/>
    </DarkModeProvider>
  )
}

export default App
