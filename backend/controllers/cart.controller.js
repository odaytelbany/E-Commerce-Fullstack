import Product from "../models/Product.js";

export const addToCart = async (req, res) => {
    try{
        const {productId} = req.body;
        const user = req.user;

        const existiingItem = user.cart.find(item => item.id === productId);
        if (existiingItem) {
            existiingItem.quantity += 1;
        } else {
            user.cart.push(productId)
        }
        await user.save();
        res.status(200).json(user.cart);
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export const removeFromCart = async (req, res) => {
    try{
        const {productId} = req.body;
        const user = req.user;
        if (!productId) {
            user.cart = [];
        } else {
            user.cart = user.cart.filter(item => item.id !== productId);
        }
        await user.save();
        res.status(200).json(user.cart);
    } catch(error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export const updateQuantity = async (req, res) => {
    try{
        const {id:productId} = req.params;
        const {quantity} = req.body;
        const user = req.user;
        const existiingItem = user.cart.find(item => item.id === productId);
        if (existiingItem) {
            if (quantity === 0) {
                user.cart = user.cart.filter(item => item.id !== productId);
                await user.save();
                return res.json(user.cartItems);
            }
            existiingItem.quantity = quantity;
            await user.save();
            res.json(user.cart);
        } else {
            res.status(404).json({message: "Product not found in cart"});
        }

    } catch(error) {
        console.error("Error updating quantity:", error);
        res.status(500).json({message: "Internal server error"});
    }


}

export const getCartProducts = async (req, res) => {
    try{
        const products = await Product.find({_id: {$in: req.user.cart}});
        const cartItems = products.map(product => {
            const item = req.user.cart.find(item => item.id === product.id);
            return {
                ...product.toJSON(),
                quantity: item.quantity
            };
        })
        res.status(200).json(cartItems)
    } catch(error) {
        console.log()
    }
}