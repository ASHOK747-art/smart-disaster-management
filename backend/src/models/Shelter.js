import mongoose from "mongoose";

export const SHELTER_STATUSES = ["AVAILABLE", "FILLING UP", "NEARLY FULL", "FULL"];

const shelterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Shelter name is required."],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required."],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required."],
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required."],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required."],
      min: 1,
    },
    occupied: {
      type: Number,
      default: 0,
      min: 0,
    },
    food: {
      type: Boolean,
      default: true,
    },
    water: {
      type: Boolean,
      default: true,
    },
    medical: {
      type: Boolean,
      default: true,
    },
    contact: {
      type: String,
      trim: true,
      default: "+91 44 2345 6789",
    },
    status: {
      type: String,
      enum: SHELTER_STATUSES,
      default: "AVAILABLE",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Shelter", shelterSchema);

