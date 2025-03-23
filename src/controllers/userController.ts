import { Request, Response } from "express";
import { User } from "../models/UserModel";
import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";
import jwt from "jsonwebtoken";
const { JWT_SECRET } = process.env;

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
    }
    res.status(200).json(user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      isAdmin,
      isSubscribed,
      location,
    } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    const verificationToken = jwt.sign({ email }, JWT_SECRET as string, {
      expiresIn: "1h",
    });

    const response = await User.create({
      name,
      email,
      password: hash,
      phoneNumber,
      isAdmin,
      isSubscribed,
      location,
    });

    if (!JWT_SECRET) {
      throw new Error("Internal error");
    }

    res.cookie("token", verificationToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });

    res
      .status(201)
      .json({ message: "User created succesfully", user: response });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    if (!JWT_SECRET) {
      throw new Error("Internal error");
    }
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
    } else {
      if (compareSync(password, user.password)) {
        await user.save();

        const token = jwt.sign({ email }, JWT_SECRET as string, {
          expiresIn: "1h",
        });

        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" ? true : false,
          sameSite: "none",
          maxAge: 60 * 60 * 1000,
        });

        res.status(200).json({ message: "User logged in successfully", token });
      } else {
        res.status(401).json({
          message: "Password is incorrect",
        });
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
    } else {
      await user.save();
      res.status(200).json({ message: "User logged out successfully" });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User is not logged in" });
      return;
    }
    const { name, email, password, phoneNumber, isSubscribed, location } =
      req.body;

    const _id = req.user ? req.user._id : "";

    const user = await User.findById(_id);
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }
    await User.findByIdAndUpdate(_id, {
      name,
      email,
      password,
      phoneNumber,
      isSubscribed,
      location,
    });
    res.status(200).json({ message: "User updated successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User is not logged in" });
      return;
    }
    const _id = req.user ? req.user._id : "";

    const user = await User.findById({ _id });
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }
    await User.findByIdAndDelete(_id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User is not logged in" });
      return;
    }

    const _id = req.user ? req.user._id : "";
    const { productId } = req.body;

    const user = await User.findById({ _id });
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }
    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
      res.status(200).json(user);
      return;
    } else {
      res.status(400).json({ message: "Product already in wishlist" });
      return;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const getWishlist = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User is not logged in" });
      return;
    }
    const _id = req.user._id;
    const user = await User.findById(_id).populate("favorites");
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }
    res.status(200).json(user.favorites);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User is not logged in" });
      return;
    }
    const _id = req.user._id;
    const { productId } = req.body;
    const user = await User.findById(_id);
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }
    if (!user.favorites.includes(productId)) {
      res.status(404).json({
        message: "Product not found in wishlist",
      });
      return;
    }
    user.favorites = user.favorites.filter((item) => item !== productId);
    await user.save();
    res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const deleteWishlist = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User is not logged in" });
      return;
    }

    const _id = req.user._id;
    const user = await User.findById(_id);
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }
    user.favorites = [];
    await user.save();
    res.status(200).json({ message: "Wishlist deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
