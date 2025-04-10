import { Request, Response } from "express";
import { UserReview } from "../models/UserReviewModel";
import { ObjectId } from "mongodb";

export const getUserReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const reviews = await UserReview.find()
      .populate("user")
      .populate("product");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUserReviewById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const reviews = await UserReview.find({
      product: new ObjectId(id),
    }).populate("user", "name");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createUserReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user?._id;

    console.log(userId, rating, review, id);

    if (!userId || !rating) {
      res.status(400).json({ message: "User and rating are required." });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    const newReview = await UserReview.create({
      user: userId,
      product: id,
      rating,
      review,
    });
    console.log(newReview);
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateUserReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { reviewId, id } = req.params;
    const { user, product, rating, review } = req.body;
    const userId = user || id;

    if (rating && (rating < 1 || rating > 5)) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    const updatedReview = await UserReview.findByIdAndUpdate(
      reviewId,
      { user: userId, product, rating, review },
      { new: true }
    );

    if (!updatedReview) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteUserReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { reviewId, id } = req.params;

    const deletedReview = await UserReview.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
