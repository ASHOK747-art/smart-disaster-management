import mongoose from "mongoose";

export const RESCUE_TEAM_AVAILABILITIES = ["Available", "Assigned", "On Mission", "Completed", "Unavailable"];

const rescueTeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Rescue team name is required."],
      trim: true,
    },
    teamCode: {
      type: String,
      required: [true, "Team code is required."],
      unique: true,
      uppercase: true,
      trim: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    leaderName: String,
    contact: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: "Chennai Central",
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required."],
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required."],
    },
    specialization: {
      type: String,
      default: "General Search & Rescue",
    },
    membersCount: {
      type: Number,
      default: 5,
    },
    availability: {
      type: String,
      enum: RESCUE_TEAM_AVAILABILITIES,
      default: "Available",
    },
    currentIncident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      default: null,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("RescueTeam", rescueTeamSchema);

