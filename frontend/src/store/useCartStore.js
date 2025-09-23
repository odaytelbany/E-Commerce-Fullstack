import {create} from "zustand";
import axios from "../lib/axios";
import {toast} from "react-hot-toast";

export const useCartStore = create((set, get) => ({
    cart: [],
    total: 0,
    subtotal: 0,
    coupon: null,
    isCouponApplied: false,

    getCartItems : async () => {
        try {
            const res = await axios.get("/cart");
            set({cart: res.data});
            get().calculateTotals();
        } catch (error) {
            set({cart: []});
            toast.error(error.response?.data?.message || "Error fetching cart items");
        }
    },

    addToCart: async (product) => {
        try {
            await axios.post("/cart", {productId: product._id});
            toast.success("Product added to cart");
            set((prevState) => {
                const existingItem = prevState.cart.find((item) => item._id === product._id);
                const newCart = existingItem 
                ? prevState.cart.map((item) => (item._id === product._id ? {...item, quantity: item.quantity + 1} : item))
                : [...prevState.cart, {...product, quantity: 1}];
                return {cart: newCart};
            });
            get().calculateTotals();
        } catch (error) {
            console.log("Error adding to cart: ", error);
            toast.error(error.response?.data?.message || "Error adding product to cart");
        }
    },
  
    removeFromCart: async (productId) => {
        try {
            await axios.delete(`/cart`, {data: {productId}});
            set((prevState) => ({cart: prevState.cart.filter((item) => item._id !== productId)}));
            get().calculateTotals();
            toast.success("Product Removed Successfully!")
        } catch (error) {
            console.log("Error removing from cart: ", error);
            toast.error(error.response?.data?.message || "Error removing product from cart");
        }
    },

    clearCart: async () => {
        console.log("Clearing cart...");
        await axios.delete("/cart/clear");
        set({cart: [], coupon: null, total: 0, subtotal: 0});
    },

    updateQuantity: async (productId, quantity) => {
        if (quantity === 0) {
            get().removeFromCart(productId);
            return; 
        }
        await axios.put(`/cart/${productId}`, {quantity});
        set((prevState) => ({
            cart:prevState.cart.map((item) => item._id === productId ? {...item, quantity} : item),
        }));
        get().calculateTotals();
    },

    calculateTotals: () => {
        const {cart, coupon} = get();
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        let total = subtotal;
        if (coupon) {
            const discount = subtotal * (coupon.discountPercentage / 100);
            console.log("Calculated discount: ", coupon);
            total = subtotal - discount;
        }
        console.log("Calculated subtotal: ", subtotal);
        console.log("Calculated total: ", total);
        set({subtotal: subtotal, total: total});
    },

    getMyCoupon: async () => {
        try {
            const response = await axios.get("/coupons");
            set({coupon: response.data});
        } catch (error) {
            console.error("Error fetching coupon: ", error);
        }
    },

    applyCoupon: async (code) => {
        try {
            const response = await axios.post("/coupons/validate", {code});
            set({coupon: response.data, isCouponApplied: true});
            get().calculateTotals();
            toast.success("Coupon applied successfully!");
        } catch (error) {
            toast.error(error.response.data.message || "Faild to apply coupon!");
        }
    },
    
    removeCoupon: () => {
        set({coupon: null, isCouponApplied: false});
        get().calculateTotals();
        toast.success("Coupon removed");
    }


      
}))