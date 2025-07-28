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
            set({user: res.data.user, loading: false});
            console.log(res);
            toast.success("Registration successful!");
        }catch(error) {
            set({loading: false});
            toast.error(error.response.data.message || "Registration failed");
        }
    }
}))
