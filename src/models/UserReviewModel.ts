import mongoose from "mongoose";

const UserReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot be more than 5"],
  },
  review: {
    type: String,
    nullable: true,
    trim: true,
  },
});

export const UserReview = mongoose.model("UserReview", UserReviewSchema);
