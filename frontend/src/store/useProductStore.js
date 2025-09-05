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
    },

    fetchAllProducts: async () => {
        set({loading: true});
        try {
            const response = await axios.get("/products");
            set({products: response.data, loading: false})
        } catch (error) {
            set({error: "Faild to fetch products", loading: false})
            toast.error(error.response?.data?.message || "Error fetching products");
        }
    },

    toggleFeaturedProduct: async (productId) => {
        set({loading: true});
        try {
            const response = await axios.patch(`/products/${productId}`);
            set((prevProducts) => ({
                products: prevProducts.products.map((product) => product._id === productId ? {...product, isFeatured: response.data.isFeatured} : product),
                loading: false
            }))
        } catch (error) {
            set({loading: false});
            toast.error(error.response?.data?.message || "Error updating product")
        }
    },

    deleteProduct: async (productId) => {
        try {
            await axios.delete(`/products/${productId}`);
            set((prevProducts) => ({
                products: prevProducts.products.filter((product) => product._id !== productId),
                loading: false
            }))
        } catch (error) {
            set({loading: false});
            toast.error(error.response?.data?.message || "Error updating product")
        }
    },
}));