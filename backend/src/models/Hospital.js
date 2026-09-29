import mongoose from "mongoose";

export const HOSPITAL_STATUSES = ["OPEN", "LIMITED", "FULL"];

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required."],
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
    contact: {
      type: String,
      trim: true,
      default: "+91 44 2345 6789",
    },
    totalBeds: {
      type: Number,
      default: 50,
      min: 0,
    },
    availableBeds: {
      type: Number,
      default: 10,
      min: 0,
    },
    icuBeds: {
      type: Number,
      default: 2,
      min: 0,
    },
    emergencyCapacity: {
      type: Number,
      default: 5,
      min: 0,
    },
    status: {
      type: String,
      enum: HOSPITAL_STATUSES,
      default: "OPEN",
    },
    resources: [
      {
        id: String,
        name: String,
        quantity: { type: Number, default: 0 },
      },
    ],
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Hospital", hospitalSchema);

