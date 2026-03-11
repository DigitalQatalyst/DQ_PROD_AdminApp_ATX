import { getRoleLabel } from "./roleMapper";

// Format timestamp for conversation list
export const formatTime = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }
};

export const resolveRoleLabel = (role?: string | null) => {
  if (!role) return "User";
  const normalized = role.toLowerCase();
  // Try known CRM role labels first
  const label = getRoleLabel(normalized as any);
  if (label) return label;
  // Fallback for database roles that aren't CRM roles
  if (normalized === "user" || normalized === "member") return "User";
  if (normalized === "bot") return "Bot";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

