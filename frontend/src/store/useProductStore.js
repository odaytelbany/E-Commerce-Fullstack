import {create} from 'zustand';
import toast from 'react-hot-toast';
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
    products: [],
    loading: false,
    setProducts: (products) => set({products}),
    createProduct: async (productData) => {
        set({loading: true});
        try{
            const res = await axios.post("/products", productData);
            console.log(res);
            set((prevState) => ({
                products: [...prevState.products, res.data],
                loading: false
            }))
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Error creating product");
            set({loading: false});
        }
    }
}));