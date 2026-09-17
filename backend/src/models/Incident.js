import mongoose from "mongoose";

// Kept in sync with the frontend's existing vocabulary
// (frontend/src/data/mockIncidents.js and frontend/src/utils/severity.js) so the
// API speaks the same values the UI already sends/displays — no translation
// layer needed when the frontend is wired up in a later phase.
export const INCIDENT_TYPES = [
  "Flood",
  "Cyclone",
  "Landslide",
  "Heavy Rainfall",
  "Fire",
  "Building Collapse",
  "Accident",
  "Medical Emergency",
  "Other",
];

export const SEVERITY_LEVELS = ["Low", "Medium", "High", "Critical"];

// Matches citizen and admin stages
export const INCIDENT_STATUSES = [
  "Pending",
  "Reported",
  "Verified",
  "In Progress",
  "Rescue Assigned",
  "Rescue In Progress",
  "Resolved",
  "Rejected",
];

const incidentSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: INCIDENT_TYPES,
      required: [true, "Disaster type is required."],
    },
    description: {
      type: String,
      required: [true, "A description is required."],
      trim: true,
      minlength: [5, "Description is too short."],
      maxlength: [2000, "Description is too long."],
    },
    severity: {
      type: String,
      enum: SEVERITY_LEVELS,
      required: [true, "Severity is required."],
    },
    status: {
      type: String,
      enum: INCIDENT_STATUSES,
      default: "Reported",
    },
    location: {
      type: String,
      required: [true, "A location is required."],
      trim: true,
    },
    latitude: Number,
    longitude: Number,
    peopleAffected: {
      type: Number,
      min: [0, "People affected can't be negative."],
      default: 1,
    },
    images: {
      // Stored as URL paths (e.g. "/uploads/169...-abc123.jpg"), not filesystem
      // paths — the frontend just prefixes these with the API base URL.
      type: [String],
      default: [],
    },
    assignedTeam: {
      // Plain identifier for now (e.g. "RT-104") — becomes a ref once a
      // dedicated RescueTeam model exists; kept loose so this module doesn't
      // have to wait on that one being built first.
      type: String,
      default: null,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

incidentSchema.index({ reporter: 1, createdAt: -1 });
incidentSchema.index({ status: 1 });

export default mongoose.model("Incident", incidentSchema);
