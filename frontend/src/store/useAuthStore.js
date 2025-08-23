import {create} from "zustand";
import axios from "../lib/axios";
import {toast} from "react-hot-toast";

export const useAuthStore = create((set) => ({
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
    }

}))
