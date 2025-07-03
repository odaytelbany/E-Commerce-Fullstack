import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";

const generateToken = (userId) => {
  const accessToken = jwt.sign({userId}, process.env.JWT_ACCESS_SECRET, {expiresIn: '15m'});
  const refreshToken = jwt.sign({userId}, process.env.JWT_REFRESH_SECRET, {expiresIn: '7d'});
  return { accessToken, refreshToken };
}

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 60 * 60 * 24 * 7); // Store for 7 days
}

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  })
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 15 minutes
  })
}

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
    const {accessToken, refreshToken} = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({ user: {
      _id: user._id,
      name: user.name, 
      email: user.email,
      role: user.role
    }, message: "User created successfully" });
  } catch (error) {
    console.log("Error in Register controller:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password} = req.body;
    const user = await User.findOne({email})
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (user && passwordMatched) {
      const {accessToken, refreshToken} = generateToken(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.status(200).json({
         _id: user._id,
      name: user.name, 
      email: user.email,
      role: user.role
      })
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in Login controller:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(200).json({ message: "Logged out successfully" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
 
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign({userId: decoded.userId}, process.env.JWT_ACCESS_SECRET, {expiresIn: '15m'});
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    })

    res.status(200).json({ message: "Access token refreshed" });
  } catch(error) {
    console.log("Error in Refresh Token controller:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

// export const getProfile = async (req, res) => {}