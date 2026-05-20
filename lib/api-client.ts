import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  withCredentials: true, // Crucial: allows cookies to be sent/received
});

apiClient.interceptors.response.use(
  (response) => response, // If the request is successful, just return it
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call the refresh API we built in the previous step
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/refresh`, {}, { withCredentials: true });
        const data = response.data;

        // If successful, the browser now has new cookies.
        // Retry the original request that failed.
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh also fails (7 days passed), log them out
        if (typeof window !== 'undefined' && 
            !window.location.pathname.startsWith('/login') && 
            !window.location.pathname.startsWith('/register') && 
            !window.location.pathname.includes('/register') && 
            !window.location.pathname.startsWith('/event') && 
            !window.location.pathname.startsWith('/qr-login')) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
