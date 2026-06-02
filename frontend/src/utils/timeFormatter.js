export function formatDuration(seconds = 0) {

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}m ${secs}s`;
}