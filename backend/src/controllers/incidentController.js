import Incident, { SEVERITY_LEVELS, INCIDENT_STATUSES } from "../models/Incident.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const REPORTER_FIELDS = "fullName email phone role";

function imagePathFor(req) {
  return req.file ? `/uploads/${req.file.filename}` : null;
}

// POST /api/incidents
// Any authenticated user can file a report; it's recorded against them as reporter.
export const createIncident = asyncHandler(async (req, res) => {
  const { type, severity, description, location, latitude, longitude, peopleAffected } = req.body;

  const incident = new Incident({
    reporter: req.user._id,
    type,
    severity,
    description,
    location,
    latitude: latitude !== undefined ? Number(latitude) : undefined,
    longitude: longitude !== undefined ? Number(longitude) : undefined,
    peopleAffected: peopleAffected !== undefined ? Number(peopleAffected) : undefined,
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
    .populate("reporter", REPORTER_FIELDS);

  res.json({ success: true, count: incidents.length, incidents });
});

// GET /api/incidents/:id
export const getIncidentById = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id).populate("reporter", REPORTER_FIELDS);
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
    if (incident.status !== "Reported") {
      throw new ApiError(400, "This report has already been verified and can no longer be edited.");
    }
    const { description, location, latitude, longitude, peopleAffected } = req.body;
    if (description !== undefined) incident.description = description;
    if (location !== undefined) incident.location = location;
    if (latitude !== undefined) incident.latitude = Number(latitude);
    if (longitude !== undefined) incident.longitude = Number(longitude);
    if (peopleAffected !== undefined) incident.peopleAffected = Number(peopleAffected);
  } else if (isResponder) {
    const { type, severity, status, location, description, peopleAffected, assignedTeam } = req.body;
    if (type !== undefined) incident.type = type;
    if (description !== undefined) incident.description = description;
    if (location !== undefined) incident.location = location;
    if (peopleAffected !== undefined) incident.peopleAffected = Number(peopleAffected);
    if (assignedTeam !== undefined) incident.assignedTeam = assignedTeam;
    if (severity !== undefined) {
      if (!SEVERITY_LEVELS.includes(severity)) {
        throw new ApiError(400, `Severity must be one of: ${SEVERITY_LEVELS.join(", ")}`);
      }
      incident.severity = severity;
    }
    if (status !== undefined) {
      if (!INCIDENT_STATUSES.includes(status)) {
        throw new ApiError(400, `Status must be one of: ${INCIDENT_STATUSES.join(", ")}`);
      }
      incident.status = status;
    }
  } else {
    throw new ApiError(403, "You don't have permission to update incidents.");
  }

  const imagePath = imagePathFor(req);
  if (imagePath) incident.images.push(imagePath);

  await incident.save();
  await incident.populate("reporter", REPORTER_FIELDS);

  res.json({ success: true, incident });
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
