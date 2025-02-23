import axios from "axios";

const API_URL = "http://localhost:8000/api"; 

export const loginWithGoogle = async () => {
  const popup = window.open(
    `${API_URL}/login/google`,
    "googleAuthPopup",
    "width=500,height=600"
  );

  if (!popup) {
    alert("Por favor, permite las ventanas emergentes para continuar.");
    return;
  }

  const interval = setInterval(async () => {
    try {
      if (!popup || popup.closed) {
        clearInterval(interval);
        return;
      }

      const response = await axios.get(`${API_URL}/user`, { withCredentials: true });

      if (response.data.user) {
        clearInterval(interval);
        popup.close();
        console.log("Usuario autenticado:", response.data.user);
        return response.data.user;
      }
    } catch (error) {
      console.log("Esperando autenticación...");
    }
  }, 1000);
};
