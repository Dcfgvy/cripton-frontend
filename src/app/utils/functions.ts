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

export function formatTimeMinutes(minutes: number): string {
  const months = Math.floor(minutes / (60 * 24 * 30));
  const days = Math.floor((minutes % (60 * 24 * 30)) / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const leftMinutes = minutes % 60;

  let parts: string[] = [];

  if (months === 1) {
    parts.push(`1 month`);
  } else if (months > 1) {
    parts.push(`${months} months`);
  }

  if (days === 1) {
    parts.push(`1 day`);
  } else if (days > 1) {
    parts.push(`${days} days`);
  }

  if (hours === 1) {
    parts.push(`1 hour`);
  } else if (hours > 1) {
    parts.push(`${hours} hours`);
  }

  if (leftMinutes === 1) {
    parts.push(`1 minute`);
  } else if (leftMinutes > 1 || parts.length === 0) {
    // Always show minutes if everything else is zero
    parts.push(`${leftMinutes} minutes`);
  }

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

export async function sleep(ms: number): Promise<void> {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, ms);
  })
}

export function getIpfsCid(url: string): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const cid = path.split('/').pop();
    return cid || '';
  } catch (error) {
    console.error('Error getting IPFS CID:', error);
    return '';
  }
}
