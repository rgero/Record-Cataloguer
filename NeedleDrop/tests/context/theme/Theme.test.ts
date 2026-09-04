import { describe, expect, it } from "vitest";

import { createTheme } from "@mui/material/styles";
import { darkModePalette } from "@context/theme/DarkModeTheme";
import { lightModePalette } from "@context/theme/LightModeTheme";

describe("light mode theme", () => {
  it("uses the cool green palette with a softened error color", () => {
    const theme = createTheme({ palette: { mode: "light", ...lightModePalette } });

    expect(theme.palette.mode).toBe("light");
    expect(theme.palette.primary.main).toBe("#2f6f68");
    expect(theme.palette.background.default).toBe("#eef5f2");
    expect(theme.palette.background.paper).toBe("#fbfdfc");
    expect(theme.palette.error.main).toBe("#b85c5c");
  });
});

describe("dark mode theme", () => {
  it("uses the cool green palette with a softened error color", () => {
    const theme = createTheme({ palette: { mode: "dark", ...darkModePalette } });

    expect(theme.palette.mode).toBe("dark");
    expect(theme.palette.primary.main).toBe("#80c8b8");
    expect(theme.palette.background.default).toBe("#0e1917");
    expect(theme.palette.background.paper).toBe("#172724");
    expect(theme.palette.error.main).toBe("#d78989");
  });
});