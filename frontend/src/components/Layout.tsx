// import { Container, IconButton, Box } from "@mui/material";
// import { useThemeMode } from "../components/ThemeContext";
// import DarkModeIcon from "@mui/icons-material/DarkMode";
// import LightModeIcon from "@mui/icons-material/LightMode";
// import { Outlet } from "react-router-dom";

// export default function Layout() {
//   const { mode, toggleTheme } = useThemeMode();

//   return (
//     <Container sx={{ mt: 2 }}>
//       <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//         <IconButton onClick={toggleTheme}>
//           {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
//         </IconButton>
//       </Box>
//       <Outlet />
//     </Container>
//   );
// }
// components/Layout.tsx
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Brightness4, Brightness7, Logout } from "@mui/icons-material";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useThemeMode } from "./ThemeContext";

export default function Layout() {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar
          sx={{
            justifyContent: "space-between",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? 1 : 0,
          }}
        >
          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            sx={{ textDecoration: "none", color: "inherit", fontWeight: 700 }}
          >
            Expense Tracker
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button component={Link} to="/dashboard" color="inherit">
              Home
            </Button>
            <Button component={Link} to="/about" color="inherit">
              About Us
            </Button>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton onClick={toggleTheme} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <IconButton
              onClick={handleLogout}
              sx={{ border: `1px solid ${theme.palette.divider}`, color: theme.palette.error.main }}
            >
              <Logout />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Outlet for child pages */}
      <Outlet />
    </>
  );
}
