import mongoose, { Schema } from "mongoose";
import { Tag } from "./TagModel";
import { Category } from "./CategoryModel";

const ProductSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      default: "english",
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: Tag,
        trim: true,
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: Category,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: Array,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    playerCount: {
      type: Number,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      Enum: ["easy", "medium", "hard"],
      required: true,
      trim: true,
    },
    ageRating: {
      type: Number,
      minValue: 0,
      maxValue: 18,
      nullable: true,
      trim: true,
    },
    userRating: {
      type: Array,
      nullable: true,
      trim: true,
    },
    measurements: {
      width: {
        type: Number,
        nullable: true,
        trim: true,
      },
      height: {
        type: Number,
        nullable: true,
        trim: true,
      },
      depth: {
        type: Number,
        nullable: true,
        trim: true,
      },
      weight: {
        type: Number,
        nullable: true,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", ProductSchema);
