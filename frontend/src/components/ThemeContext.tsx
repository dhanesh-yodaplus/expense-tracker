import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
} from "@mui/material";
import { deepmerge } from "@mui/utils";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  toggleTheme: () => void;
  mode: ThemeMode;
}

const ThemeModeContext = createContext<ThemeContextValue>({
  toggleTheme: () => {},
  mode: "light",
});

export const useThemeMode = (): ThemeContextValue => useContext(ThemeModeContext);

// Base theme configuration
const baseTheme = createTheme({
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      '"Inter"',
      '-apple-system, BlinkMacSystemFont, "Segoe UI"',
      'Roboto, "Helvetica Neue"',
      'Arial, sans-serif, "Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    fontSize: 14,
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
        },
      },
    },
  },
});

// Light theme configuration
const lightTheme = deepmerge(baseTheme, {
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#495057',
      disabled: '#adb5bd',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

// Enhanced greyish dark theme
const darkTheme = deepmerge(baseTheme, {
  palette: {
    mode: 'dark',
    primary: {
      main: '#7986cb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff4081',
      contrastText: '#ffffff',
    },
    background: {
      default: '#1a1a1a',  // Dark grey instead of pure black
      paper: '#2d2d2d',    // Slightly lighter grey for surfaces
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0', // Brighter secondary text for better readability
      disabled: '#7a7a7a',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    action: {
      active: '#ffffff',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2d2d2d',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#252525',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2d2d2d',
        },
      },
    },
  },
});

interface CustomThemeProviderProps {
  children: React.ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem("theme") as ThemeMode | null;
    return savedMode || (prefersDarkMode ? "dark" : "light");
  });

  useEffect(() => {
    if (!localStorage.getItem("theme")) {
      setMode(prefersDarkMode ? "dark" : "light");
    }
  }, [prefersDarkMode]);

  const toggleTheme = () => {
    setMode((prev) => {
      const newMode = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", newMode);
      return newMode;
    });
  };

  const theme = useMemo(() => {
    return mode === 'light' ? lightTheme : darkTheme;
  }, [mode]);

  const contextValue = useMemo(() => ({
    toggleTheme,
    mode,
  }), [mode]);

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};