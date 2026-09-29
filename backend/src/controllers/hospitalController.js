import Hospital, { HOSPITAL_STATUSES } from "../models/Hospital.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DEFAULT_HOSPITALS = [
  {
    name: "Government General Hospital",
    location: "Park Town, Chennai",
    latitude: 13.0878,
    longitude: 80.2785,
    status: "OPEN",
    totalBeds: 100,
    availableBeds: 42,
    icuBeds: 6,
    emergencyCapacity: 15,
    contact: "+91 44 2530 5000",
    resources: [
      { id: "r1", name: "Oxygen Cylinders", quantity: 45 },
      { id: "r2", name: "Trauma Kits", quantity: 20 },
      { id: "r3", name: "Ventilators Available", quantity: 8 },
      { id: "r4", name: "Blood Units (O-)", quantity: 12 },
    ],
  },
  {
    name: "Apollo Emergency Care",
    location: "Greams Road, Chennai",
    latitude: 13.0604,
    longitude: 80.2497,
    status: "LIMITED",
    totalBeds: 60,
    availableBeds: 8,
    icuBeds: 1,
    emergencyCapacity: 5,
    contact: "+91 44 2829 0200",
    resources: [
      { id: "r1", name: "Oxygen Cylinders", quantity: 20 },
      { id: "r2", name: "Trauma Kits", quantity: 10 },
      { id: "r3", name: "Ventilators Available", quantity: 3 },
      { id: "r4", name: "Blood Units (O-)", quantity: 5 },
    ],
  },
  {
    name: "Stanley Medical College Hospital",
    location: "Royapuram, Chennai",
    latitude: 13.1147,
    longitude: 80.2938,
    status: "OPEN",
    totalBeds: 80,
    availableBeds: 30,
    icuBeds: 4,
    emergencyCapacity: 10,
    contact: "+91 44 2528 1351",
    resources: [
      { id: "r1", name: "Oxygen Cylinders", quantity: 35 },
      { id: "r2", name: "Trauma Kits", quantity: 15 },
      { id: "r3", name: "Ventilators Available", quantity: 5 },
      { id: "r4", name: "Blood Units (O-)", quantity: 8 },
    ],
  },
  {
    name: "Kilpauk Medical College Hospital",
    location: "Kilpauk, Chennai",
    latitude: 13.0776,
    longitude: 80.2431,
    status: "FULL",
    totalBeds: 50,
    availableBeds: 0,
    icuBeds: 0,
    emergencyCapacity: 0,
    contact: "+91 44 2836 4951",
    resources: [
      { id: "r1", name: "Oxygen Cylinders", quantity: 10 },
      { id: "r2", name: "Trauma Kits", quantity: 4 },
      { id: "r3", name: "Ventilators Available", quantity: 0 },
      { id: "r4", name: "Blood Units (O-)", quantity: 2 },
    ],
  },
];

async function ensureSeedData() {
  const count = await Hospital.countDocuments();
  if (count === 0) {
    await Hospital.insertMany(DEFAULT_HOSPITALS);
  }
}

// GET /api/hospitals
export const getHospitals = asyncHandler(async (_req, res) => {
  await ensureSeedData();
  const hospitals = await Hospital.find({}).sort({ createdAt: 1 });
  res.json({ success: true, count: hospitals.length, hospitals });
});

// GET /api/hospitals/:id
export const getHospitalById = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) {
    throw new ApiError(404, "Hospital not found.");
  }
  res.json({ success: true, hospital });
});

// GET /api/hospitals/my/profile (Hospital user profile or primary hospital)
export const getMyHospitalProfile = asyncHandler(async (req, res) => {
  await ensureSeedData();
  let hospital = await Hospital.findOne({ managedBy: req.user._id });
  if (!hospital) {
    hospital = await Hospital.findOne({});
  }
  res.json({ success: true, hospital });
});

// PUT /api/hospitals/:id
// Hospital user or admin can update hospital status, beds, resources
export const updateHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) {
    throw new ApiError(404, "Hospital not found.");
  }

  const { status, availableBeds, icuBeds, emergencyCapacity, totalBeds, resources } = req.body;

  if (status !== undefined) {
    if (!HOSPITAL_STATUSES.includes(status)) {
      throw new ApiError(400, `Status must be one of: ${HOSPITAL_STATUSES.join(", ")}`);
    }
    hospital.status = status;
  }
  if (availableBeds !== undefined) hospital.availableBeds = Math.max(0, Number(availableBeds));
  if (icuBeds !== undefined) hospital.icuBeds = Math.max(0, Number(icuBeds));
  if (emergencyCapacity !== undefined) hospital.emergencyCapacity = Math.max(0, Number(emergencyCapacity));
  if (totalBeds !== undefined) hospital.totalBeds = Math.max(0, Number(totalBeds));
  if (Array.isArray(resources)) hospital.resources = resources;

  await hospital.save();
  res.json({ success: true, hospital });
});

