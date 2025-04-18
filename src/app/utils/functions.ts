export function formatElapsedTime(start: Date): string {
  const now = new Date();
  const elapsedMs = now.getTime() - start.getTime();

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${seconds}s`);

  return parts.join(' ');
}

export function formatNumberShort(num: number): string {
  const absNum = Math.abs(num);
  let formatted: string;

  if (absNum >= 1_000_000_000) {
    formatted = (num / 1_000_000_000).toFixed(2) + 'B';
  } else if (absNum >= 1_000_000) {
    formatted = (num / 1_000_000).toFixed(2) + 'M';
  } else if (absNum >= 1_000) {
    formatted = (num / 1_000).toFixed(2) + 'K';
  } else {
    formatted = num.toString();
  }

  return formatted;
}
