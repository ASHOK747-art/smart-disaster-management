import { useEffect, useState } from "react";
import {
  HeartHandshake,
  ListChecks,
  CheckCircle2,
  MapPin,
  Users,
  Navigation,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { getVolunteerProfile, getVolunteerTasks, updateTaskStatus } from "../../services/volunteerService";
import { severityTone } from "../../utils/severity";
import "./VolunteerDashboard.css";

const FILTERS = ["All", "Available", "Accepted", "Completed"];

function VolunteerDashboard() {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getVolunteerProfile(), getVolunteerTasks()]).then(([profileRes, tasksRes]) => {
      if (cancelled) return;
      setProfile(profileRes);
      setTasks(tasksRes);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading your volunteer dashboard…" />;

  async function acceptTask(task) {
    const updated = await updateTaskStatus(task.id, "Accepted");
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  }

  async function completeTask(task) {
    const updated = await updateTaskStatus(task.id, "Completed");
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  }

  const availableCount = tasks.filter((t) => t.status === "Available").length;
  const acceptedCount = tasks.filter((t) => t.status === "Accepted").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;

  const filtered = filter === "All" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="volunteer-dashboard">
      {/* ---- Profile summary ---- */}
      <div className="volunteer-profile-card">
        <div className="volunteer-profile-card__avatar">{profile.name.charAt(0)}</div>
        <div className="volunteer-profile-card__body">
          <div className="volunteer-profile-card__head">
            <h2>{profile.name}</h2>
            <StatusBadge tone="safe">{profile.availability}</StatusBadge>
          </div>
          <span className="volunteer-profile-card__location">
            <MapPin size={13} /> {profile.location}
          </span>
          <div className="volunteer-profile-card__skills">
            {profile.skills.map((skill) => (
              <span key={skill} className="skill-chip">{skill}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Stat cards ---- */}
      <div className="volunteer-stat-grid">
        <StatCard icon={HeartHandshake} label="Available Tasks" value={availableCount} tone="info" />
        <StatCard icon={ListChecks} label="My Tasks" value={acceptedCount} tone="warning" />
        <StatCard icon={CheckCircle2} label="Completed" value={completedCount} tone="safe" />
      </div>

      {/* ---- Filters ---- */}
      <div className="volunteer-dashboard__filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`volunteer-dashboard__filter ${filter === f ? "volunteer-dashboard__filter--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={HeartHandshake} title="No tasks here" message="No assistance requests match this filter." />
      ) : (
        <div className="volunteer-dashboard__list">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} onAccept={acceptTask} onComplete={completeTask} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onAccept, onComplete }) {
  const { id, location, requiredHelp, peopleAffected, priority, distanceKm, status, latitude, longitude } = task;
  const locationUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <article className="task-card">
      <div className="task-card__head">
        <div>
          <span className="task-card__id data-text">{id}</span>
          <h3>{requiredHelp}</h3>
        </div>
        <StatusBadge tone={severityTone(priority)} pulse={priority === "Critical"}>
          {priority}
        </StatusBadge>
      </div>

      <div className="task-card__meta">
        <span><MapPin size={13} /> {location} &middot; {distanceKm} km away</span>
        {peopleAffected > 0 && <span><Users size={13} /> {peopleAffected} people</span>}
      </div>

      <div className="task-card__actions">
        {status === "Available" && (
          <button className="task-card__action task-card__action--primary" onClick={() => onAccept(task)}>
            Accept Task
          </button>
        )}
        {status === "Accepted" && (
          <button className="task-card__action task-card__action--primary" onClick={() => onComplete(task)}>
            Mark Completed
          </button>
        )}
        {status === "Completed" && <StatusBadge tone="safe">Completed</StatusBadge>}
        <a href={locationUrl} target="_blank" rel="noreferrer" className="task-card__action">
          <Navigation size={13} /> View Location
        </a>
      </div>
    </article>
  );
}

export default VolunteerDashboard;
