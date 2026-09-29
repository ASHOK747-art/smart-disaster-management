import Shelter, { SHELTER_STATUSES } from "../models/Shelter.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DEFAULT_SHELTERS = [
  {
    name: "Government Higher Secondary School Shelter",
    location: "Velachery, Chennai",
    latitude: 12.9756,
    longitude: 80.22,
    capacity: 500,
    occupied: 320,
    food: true,
    water: true,
    medical: true,
    contact: "+91 44 2345 6789",
    status: "FILLING UP",
  },
  {
    name: "Community Hall Shelter",
    location: "Adyar, Chennai",
    latitude: 13.0067,
    longitude: 80.257,
    capacity: 250,
    occupied: 230,
    food: true,
    water: true,
    medical: false,
    contact: "+91 44 2345 1122",
    status: "NEARLY FULL",
  },
  {
    name: "Municipal Sports Complex Shelter",
    location: "T. Nagar, Chennai",
    latitude: 13.0356,
    longitude: 80.2297,
    capacity: 400,
    occupied: 90,
    food: true,
    water: true,
    medical: true,
    contact: "+91 44 2345 9988",
    status: "AVAILABLE",
  },
];

async function ensureSeedData() {
  const count = await Shelter.countDocuments();
  if (count === 0) {
    await Shelter.insertMany(DEFAULT_SHELTERS);
  }
}

// GET /api/shelters
export const getShelters = asyncHandler(async (_req, res) => {
  await ensureSeedData();
  const shelters = await Shelter.find({}).sort({ createdAt: 1 });
  res.json({ success: true, count: shelters.length, shelters });
});

// GET /api/shelters/:id
export const getShelterById = asyncHandler(async (req, res) => {
  const shelter = await Shelter.findById(req.params.id);
  if (!shelter) {
    throw new ApiError(404, "Shelter not found.");
  }
  res.json({ success: true, shelter });
});

// PUT /api/shelters/:id
// Admin or Authorized Personnel updates occupancy and status
export const updateShelter = asyncHandler(async (req, res) => {
  const shelter = await Shelter.findById(req.params.id);
  if (!shelter) {
    throw new ApiError(404, "Shelter not found.");
  }

  const { capacity, occupied, food, water, medical, status } = req.body;

  if (capacity !== undefined) shelter.capacity = Math.max(1, Number(capacity));
  if (occupied !== undefined) shelter.occupied = Math.max(0, Number(occupied));
  if (food !== undefined) shelter.food = Boolean(food);
  if (water !== undefined) shelter.water = Boolean(water);
  if (medical !== undefined) shelter.medical = Boolean(medical);

  const pct = Math.round((shelter.occupied / shelter.capacity) * 100);
  if (status !== undefined && SHELTER_STATUSES.includes(status)) {
    shelter.status = status;
  } else {
    if (pct >= 100) shelter.status = "FULL";
    else if (pct >= 90) shelter.status = "NEARLY FULL";
    else if (pct >= 70) shelter.status = "FILLING UP";
    else shelter.status = "AVAILABLE";
  }

  await shelter.save();
  res.json({ success: true, shelter });
});

