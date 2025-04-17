import { Navigate } from 'react-router-dom';

/**
 * Wrapper for protected routes.
 * Redirects to login if no access_token is found in localStorage.
 */
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
