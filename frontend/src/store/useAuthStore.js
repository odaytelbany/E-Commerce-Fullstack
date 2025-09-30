import {create} from "zustand";
import axios from "../lib/axios";
import {toast} from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    register: async ({name, email, password, confirmPassword}) => {
        set({loading: true});

        if (password !== confirmPassword) {
            set({loading: false});
            return toast.error("Passwords do not match");
        }
        try{
            const res = await axios.post("/auth/register", {name, email, password});
            set({user: res.data, loading: false});
            toast.success("Registration successful!");
        }catch(error) {
            set({loading: false});
            toast.error(error.response.data.message || "Registration failed");
        }
    },

    login: async (email, password) => {
        set({loading: true});
        try{
            const res = await axios.post("/auth/login", {email, password});
            set({user: res.data, loading: false});
            toast.success("Registration successful!");
        }catch(error) {
            set({loading: false});
            toast.error(error.response.data.message || "Registration failed");
        }
    },

    logout: async () => {
        try{
            await axios.post("/auth/logout");
            set({user: null});
        } catch(error) {
            toast.error(error?.response?.data?.message || "Logout failed");
        }
    },

    checkAuth : async () => {
        set({checkingAuth: true});
        try {
            const response = await axios.get("/auth/profile");
            console.log("Response", response);
            set({user: response.data, checkingAuth: false});
        } catch (error) {
            console.error("Error checking authentication:", error);
            set({user: null, checkingAuth: false});
        }
    },

    refreshToken: async () => {
        if (get().checkingAuth) return;
        set({ checkingAuth: true });
        try{
            const response = await axios.post("/auth/refresh-token");
            set({checkingAuth: false});
            return response.data;
        } catch (error) {
            set({ user:null, checkingAuth: false});
            throw error;
        }
    }

}))




let refreshPromise = null;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if(error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);
                }
                refreshPromise = useAuthStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;

                return axios(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
)