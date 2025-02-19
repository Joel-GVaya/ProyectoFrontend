import axios from "axios";

const API_URL = "http://localhost:8000/api/auth/google";

export const loginWithGoogle = async () => {
    try {
        const { data } = await axios.get(API_URL);
        window.location.href = data.url; // Redirigeix a Google
    } catch (error) {
        console.error("Error iniciant sessió amb Google:", error);
    }
};

export const handleGoogleCallback = async (code) => {
    try {
        const { data } = await axios.get(`http://localhost:8000/api/auth/google/callback?code=${code}`);
        localStorage.setItem("token", data.token);
        return data.user;
    } catch (error) {
        console.error("Error al rebre la resposta de Google:", error);
    }
};
