import Incident, { INCIDENT_TYPES, SEVERITY_LEVELS, INCIDENT_STATUSES } from "../models/Incident.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const REPORTER_FIELDS = "fullName email phone role";
const RESPONDER_FIELDS = "fullName email phone role";

function imagePathFor(req) {
  return req.file ? `/uploads/${req.file.filename}` : null;
}

function normalizeType(val) {
  if (!val) return "Other";
  const trimmed = val.trim();
  const match = INCIDENT_TYPES.find((t) => t.toLowerCase() === trimmed.toLowerCase());
  return match || trimmed;
}

function normalizeSeverity(val) {
  if (!val) return "Medium";
  const trimmed = val.trim();
  const match = SEVERITY_LEVELS.find((s) => s.toLowerCase() === trimmed.toLowerCase());
  return match || "Medium";
}

// POST /api/incidents
// Any authenticated user can file a report; it's recorded against them as reporter.
export const createIncident = asyncHandler(async (req, res) => {
  const {
    type,
    disasterType,
    severity,
    description,
    location,
    latitude,
    longitude,
    peopleAffected,
    status,
  } = req.body;

  const resolvedType = normalizeType(disasterType || type);
  const resolvedSeverity = normalizeSeverity(severity);

  const incident = new Incident({
    reporter: req.user._id,
    type: resolvedType,
    severity: resolvedSeverity,
    description,
    location,
    latitude: latitude !== undefined && latitude !== "" ? Number(latitude) : undefined,
    longitude: longitude !== undefined && longitude !== "" ? Number(longitude) : undefined,
    peopleAffected: peopleAffected !== undefined && peopleAffected !== "" ? Number(peopleAffected) : 1,
    ...(status && INCIDENT_STATUSES.some((s) => s.toLowerCase() === status.toLowerCase())
      ? { status: INCIDENT_STATUSES.find((s) => s.toLowerCase() === status.toLowerCase()) }
      : {}),
  });

  const imagePath = imagePathFor(req);
  if (imagePath) incident.images.push(imagePath);

  await incident.save();
  await incident.populate("reporter", REPORTER_FIELDS);

  res.status(201).json({ success: true, incident });
});

// GET /api/incidents
// Citizens see only their own reports. Every other role sees the full list
// (rescue/admin need this to coordinate response; hospital/volunteer aren't
// restricted either, since the spec only calls out citizen vs rescue/admin).
// Supports optional ?status= &severity= &type= filtering.
export const getIncidents = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "citizen") {
    filter.reporter = req.user._id;
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.type) filter.type = req.query.type;

  const incidents = await Incident.find(filter)
    .sort({ createdAt: -1 })
    .populate("reporter", REPORTER_FIELDS)
    .populate("assignedResponder", RESPONDER_FIELDS);

  res.json({ success: true, count: incidents.length, incidents });
});

// GET /api/incidents/assigned
// A rescue user's own worklist — only incidents assigned to them. Admin can
// also call this (rarely needed, but harmless) since it's just a filtered view.
export const getAssignedIncidents = asyncHandler(async (req, res) => {
  const incidents = await Incident.find({ assignedResponder: req.user._id })
    .sort({ createdAt: -1 })
    .populate("reporter", REPORTER_FIELDS)
    .populate("assignedResponder", RESPONDER_FIELDS);

  res.json({ success: true, count: incidents.length, incidents });
});

// GET /api/incidents/:id
export const getIncidentById = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id)
    .populate("reporter", REPORTER_FIELDS)
    .populate("assignedResponder", RESPONDER_FIELDS);
  if (!incident) {
    throw new ApiError(404, "Incident not found.");
  }

  if (req.user.role === "citizen" && String(incident.reporter._id) !== String(req.user._id)) {
    throw new ApiError(403, "You can only view your own incident reports.");
  }

  res.json({ success: true, incident });
});

// PUT /api/incidents/:id
// Citizens may edit limited fields on their own report while it's still
// unverified. Rescue/admin can update status, severity, assignment and details.
export const updateIncident = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id);
  if (!incident) {
    throw new ApiError(404, "Incident not found.");
  }

  const isOwner = String(incident.reporter) === String(req.user._id);
  const isCitizen = req.user.role === "citizen";
  const isResponder = req.user.role === "rescue" || req.user.role === "admin";

  if (isCitizen) {
    if (!isOwner) {
      throw new ApiError(403, "You can only update your own incident reports.");
    }
    if (!["Reported", "Pending"].includes(incident.status)) {
      throw new ApiError(400, "This report has already been verified and can no longer be edited.");
    }
    const { description, location, latitude, longitude, peopleAffected } = req.body;
    if (description !== undefined) incident.description = description;
    if (location !== undefined) incident.location = location;
    if (latitude !== undefined) incident.latitude = Number(latitude);
    if (longitude !== undefined) incident.longitude = Number(longitude);
    if (peopleAffected !== undefined) incident.peopleAffected = Number(peopleAffected);
  } else if (isResponder) {
    // A rescue user may only update an incident once it's been assigned to
    // them; an unassigned incident (assignedResponder still null) stays open
    // to any rescue user so existing/older reports aren't locked out.
    // Admin is never restricted by assignment.
    if (
      req.user.role === "rescue" &&
      incident.assignedResponder &&
      String(incident.assignedResponder) !== String(req.user._id)
    ) {
      throw new ApiError(403, "This incident is assigned to a different responder.");
    }

    const { type, disasterType, severity, status, location, description, peopleAffected, assignedTeam } = req.body;
    const resolvedType = disasterType || type;
    if (resolvedType !== undefined) incident.type = normalizeType(resolvedType);
    if (description !== undefined) incident.description = description;
    if (location !== undefined) incident.location = location;
    if (peopleAffected !== undefined) incident.peopleAffected = Number(peopleAffected);
    if (assignedTeam !== undefined) incident.assignedTeam = assignedTeam;
    if (severity !== undefined) {
      incident.severity = normalizeSeverity(severity);
    }
    if (status !== undefined) {
      const match = INCIDENT_STATUSES.find((s) => s.toLowerCase() === status.trim().toLowerCase());
      if (!match) {
        throw new ApiError(400, `Status must be one of: ${INCIDENT_STATUSES.join(", ")}`);
      }
      incident.status = match;
    }
  } else {
    throw new ApiError(403, "You don't have permission to update incidents.");
  }

  const imagePath = imagePathFor(req);
  if (imagePath) incident.images.push(imagePath);

  await incident.save();
  await incident.populate("reporter", REPORTER_FIELDS);
  await incident.populate("assignedResponder", RESPONDER_FIELDS);

  res.json({ success: true, incident });
});

// PUT /api/incidents/:id/assign
// Admin-only: assigns a specific rescue-role user to handle this incident.
export const assignResponder = asyncHandler(async (req, res) => {
  const { responderId } = req.body;
  if (!responderId) {
    throw new ApiError(400, "responderId is required.");
  }

  const incident = await Incident.findById(req.params.id);
  if (!incident) {
    throw new ApiError(404, "Incident not found.");
  }

  const responder = await User.findById(responderId);
  if (!responder) {
    throw new ApiError(404, "Selected responder does not exist.");
  }
  if (responder.role !== "rescue") {
    throw new ApiError(400, "Selected user is not a rescue responder.");
  }

  incident.assignedResponder = responder._id;
  await incident.save();
  await incident.populate("reporter", REPORTER_FIELDS);
  await incident.populate("assignedResponder", RESPONDER_FIELDS);

  res.json({ success: true, incident });
});

// GET /api/incidents/public
// Returns active/verified incidents for public consumption and GIS mapping.
export const getPublicVerifiedIncidents = asyncHandler(async (_req, res) => {
  const incidents = await Incident.find({
    status: { $ne: "Rejected" },
  })
    .sort({ createdAt: -1 })
    .select("type severity status description location latitude longitude images createdAt");

  res.json({ success: true, count: incidents.length, incidents });
});

// DELETE /api/incidents/:id
// Restricted to admin — deleting a report is destructive and citizens/rescue
// teams have no legitimate need to erase the record (status changes to
// "Rejected" cover the "this wasn't real" case without losing the data).
export const deleteIncident = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only an administrator can delete an incident report.");
  }

  const incident = await Incident.findByIdAndDelete(req.params.id);
  if (!incident) {
    throw new ApiError(404, "Incident not found.");
  }

  res.json({ success: true, message: "Incident deleted." });
});