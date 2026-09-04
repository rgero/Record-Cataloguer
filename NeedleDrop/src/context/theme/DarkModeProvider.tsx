import { ThemeProvider, createTheme } from "@mui/material";

import { DarkModeContext } from "./DarkModeContext";
import { darkModePalette } from "./DarkModeTheme";
import { lightModePalette } from "./LightModeTheme";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useMemo } from "react";

const DarkModeProvider = ({ children }: {children: React.ReactNode}) => {

  const [isDarkMode, setIsDarkMode] = useLocalStorage(
    "isDarkMode",
    window.matchMedia("(prefers-color-scheme: dark)").matches // Default to user's OS setting
  );
  
  const mode = isDarkMode ? "dark" : "light";
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light" ? lightModePalette : darkModePalette),
        },
        components: {
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === "dark" ? "#010101" : undefined,
              },
            },
          },
        },
      }),
    [mode]
  );

  const toggleDarkMode = () => {
    setIsDarkMode((isDark: boolean) => !isDark);
  }

  return (
    <DarkModeContext.Provider value={{isDarkMode, toggleDarkMode}}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </DarkModeContext.Provider>
  );
}
export default DarkModeProvider;