import { Container, IconButton, Box } from "@mui/material";
import { useThemeMode } from "../components/ThemeContext";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Container sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton onClick={toggleTheme}>
          {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>
      <Outlet />
    </Container>
  );
}
