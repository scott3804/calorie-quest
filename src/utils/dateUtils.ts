/**
 * Converts an ISO timestamp string to a human-readable time.
 * Example: "2026-01-02T19:42:05Z" -> "7:42 PM"
 */
export const formatTimestamp = (isoString: string): string => {
  if (!isoString) return "";

  const date = new Date(isoString);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Returns a YYYY-MM-DD string based on the local timezone.
 */
export const getLocalTodayString = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
