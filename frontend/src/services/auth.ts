import axios from './axios';

/**
 * Attempts to refresh the access token using the stored refresh token.
 * If successful, the new access token is stored in localStorage and returned.
 * If it fails (expired or invalid), null is returned and user must re-authenticate.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh_token');

  // If no refresh token is stored, cannot proceed
  if (!refreshToken) return null;

  try {
    // Call token refresh endpoint with current refresh token
    const response = await axios.post('/token/refresh/', {
      refresh: refreshToken,
    });

    const { access } = response.data;

    // Store new access token in localStorage
    localStorage.setItem('access_token', access);

    return access;
  } catch (err) {
    // If refresh token is expired or invalid, token refresh fails
    console.error("Token refresh failed:", err);
    return null;
  }
};
