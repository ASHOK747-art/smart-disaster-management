import RescueTeam, { RESCUE_TEAM_AVAILABILITIES } from "../models/RescueTeam.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DEFAULT_RESCUE_TEAMS = [
  {
    name: "Rescue Team Alpha",
    teamCode: "RT-104",
    location: "Velachery, Chennai",
    latitude: 12.982,
    longitude: 80.218,
    specialization: "Flood & Water Search Rescue",
    membersCount: 6,
    availability: "On Mission",
    contact: "+91 98401 11223",
  },
  {
    name: "Rescue Team Bravo",
    teamCode: "RT-098",
    location: "T. Nagar, Chennai",
    latitude: 13.04,
    longitude: 80.236,
    specialization: "Structural Collapse Rescue",
    membersCount: 5,
    availability: "Assigned",
    contact: "+91 98401 44556",
  },
  {
    name: "Rescue Team Charlie",
    teamCode: "RT-071",
    location: "Kathipara, Chennai",
    latitude: 13.012,
    longitude: 80.197,
    specialization: "Medical Emergency & First Aid",
    membersCount: 4,
    availability: "Available",
    contact: "+91 98401 77889",
  },
];

async function ensureSeedData() {
  const count = await RescueTeam.countDocuments();
  if (count === 0) {
    await RescueTeam.insertMany(DEFAULT_RESCUE_TEAMS);
  }
}

// GET /api/rescue-teams
export const getRescueTeams = asyncHandler(async (_req, res) => {
  await ensureSeedData();
  const teams = await RescueTeam.find({}).sort({ createdAt: 1 }).populate("leader", "fullName email phone");
  res.json({ success: true, count: teams.length, rescueTeams: teams });
});

// GET /api/rescue-teams/:id
export const getRescueTeamById = asyncHandler(async (req, res) => {
  const team = await RescueTeam.findById(req.params.id).populate("leader", "fullName email phone");
  if (!team) {
    throw new ApiError(404, "Rescue team not found.");
  }
  res.json({ success: true, rescueTeam: team });
});

// POST /api/rescue-teams
export const createRescueTeam = asyncHandler(async (req, res) => {
  const { name, teamCode, location, latitude, longitude, specialization, membersCount, contact } = req.body;

  const existing = await RescueTeam.findOne({ teamCode: teamCode.trim().toUpperCase() });
  if (existing) {
    throw new ApiError(400, "A rescue team with this team code already exists.");
  }

  const team = new RescueTeam({
    name,
    teamCode: teamCode.trim().toUpperCase(),
    location,
    latitude: Number(latitude),
    longitude: Number(longitude),
    specialization,
    membersCount: Number(membersCount) || 5,
    contact,
  });

  await team.save();
  res.status(201).json({ success: true, rescueTeam: team });
});

// PUT /api/rescue-teams/:id
export const updateRescueTeam = asyncHandler(async (req, res) => {
  const team = await RescueTeam.findById(req.params.id);
  if (!team) {
    throw new ApiError(404, "Rescue team not found.");
  }

  const { name, location, latitude, longitude, specialization, membersCount, availability, contact } = req.body;

  if (name !== undefined) team.name = name;
  if (location !== undefined) team.location = location;
  if (latitude !== undefined) team.latitude = Number(latitude);
  if (longitude !== undefined) team.longitude = Number(longitude);
  if (specialization !== undefined) team.specialization = specialization;
  if (membersCount !== undefined) team.membersCount = Number(membersCount);
  if (contact !== undefined) team.contact = contact;

  if (availability !== undefined) {
    if (!RESCUE_TEAM_AVAILABILITIES.includes(availability)) {
      throw new ApiError(400, `Availability must be one of: ${RESCUE_TEAM_AVAILABILITIES.join(", ")}`);
    }
    team.availability = availability;
  }

  await team.save();
  res.json({ success: true, rescueTeam: team });
});

