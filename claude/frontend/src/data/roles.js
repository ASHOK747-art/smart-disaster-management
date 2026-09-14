import { User, Ambulance, HeartHandshake, Building2, ShieldCheck } from "lucide-react";

export const ROLES = [
  { id: "citizen", label: "Citizen", icon: User },
  { id: "rescue", label: "Rescue Team", icon: Ambulance },
  { id: "volunteer", label: "Volunteer", icon: HeartHandshake },
  { id: "hospital", label: "Hospital", icon: Building2 },
  { id: "admin", label: "Administrator", icon: ShieldCheck },
];

export const DASHBOARD_ROUTE_BY_ROLE = {
  citizen: "/citizen/dashboard",
  rescue: "/rescue/dashboard",
  volunteer: "/volunteer/dashboard",
  hospital: "/hospital/dashboard",
  admin: "/admin/dashboard",
};
