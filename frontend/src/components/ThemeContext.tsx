import React, {
    createContext,
    useContext,
    useState,
    useMemo,
  } from "react";
  import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
  
  type ThemeMode = "light" | "dark";
  
  const ThemeModeContext = createContext({
    toggleTheme: () => {},
    mode: "light" as ThemeMode,
  });
  
  export const useThemeMode = () => useContext(ThemeModeContext);
  
  export const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
      return (localStorage.getItem("theme") as ThemeMode) || "dark";
    });
  
    const toggleTheme = () => {
      setMode((prev) => {
        const newMode = prev === "light" ? "dark" : "light";
        localStorage.setItem("theme", newMode);
        return newMode;
      });
    };
  
    const theme = useMemo(() => {
      return createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? {
                background: {
                  default: "#0f1117",
                  paper: "#1c1f26",
                },
                primary: {
                  main: "#90caf9",
                },
                secondary: {
                  main: "#f48fb1",
                },
                text: {
                  primary: "#ffffff",
                  secondary: "#b0b3b8",
                },
              }
            : {
                background: {
                  default: "#f5f5f5",
                  paper: "#ffffff",
                },
                primary: {
                  main: "#1976d2",
                },
                secondary: {
                  main: "#dc004e",
                },
                text: {
                  primary: "#000000",
                  secondary: "#333333",
                },
              }),
        },
        shape: {
          borderRadius: 10,
        },
        typography: {
          fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
          fontSize: 14,
          button: {
            textTransform: "none",
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                boxShadow:
                  mode === "dark"
                    ? "0 2px 12px rgba(0,0,0,0.7)"
                    : "0 2px 10px rgba(0,0,0,0.1)",
                border: mode === "dark" ? "1px solid #2a2d35" : "none",
              },
            },
          },
        },
      });
    }, [mode]);
  
    return (
      <ThemeModeContext.Provider value={{ toggleTheme, mode }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeModeContext.Provider>
    );
  };
  