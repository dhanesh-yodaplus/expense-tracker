import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashborad";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./components/Registration";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
