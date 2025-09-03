import Redis from "ioredis";
import Product from "../models/Product.js";
import cloudinary from "../lib/cloudinary.js";


async function updateFeaturedProductsCache() {
  try{
    const featuredProducts = await Product.find({ isFeatured: true}).lean();
    await Redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error updating featured products cache:", error);
  }
}

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.log("Error in getAllProducts controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await Redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }
    await Redis.set("featured_products", JSON.stringify(featuredProducts));
    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, isFeatured } = req.body;

    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = new Product({
      name,
      description,
      price,
      image: cloudinaryResponse ? cloudinaryResponse.secure_url : "",
      category,
      isFeatured,
    });

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; //Id of the image in Cloudinary
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image deleted from Cloudinary");
      } catch (error) {
        console.log("Error deleting image from Cloudinary:", error);
      }
    }
    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 3 } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
        },
      },
    ]);
    res.status(200).json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const {category} = req.params;
  try{
    const products = await Product.find({ category});
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found in this category" });
    }
    res.json(products);
  } catch(error) {
    console.log("Error in getProductsByCategory controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

export const toggleFeaturedProduct = async (req, res) => {
  const {id} = req.params;
  try{
    const product = await Product.findById(id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({message: "Product not found"});
    }

  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}