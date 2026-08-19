import { ThemeProvider, createTheme } from "@mui/material";

import { DarkModeContext } from "./DarkModeContext";
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