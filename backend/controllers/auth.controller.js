import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "user already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    }); 
    res.status(201).json({ data: user, message: "User created successfully" });
  } catch (error) {
    console.log("Error in Register controller:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const login = (req, res) => {};
export const logout = (req, res) => {};
