export const getTaskDurationMs = (
  dateCreated?: string | null,
  dateUpdated?: string | null
): number | null => {
  if (!dateCreated || !dateUpdated) {
    return null;
  }

  const createdAt = new Date(dateCreated).getTime();
  const updatedAt = new Date(dateUpdated).getTime();

  if (Number.isNaN(createdAt) || Number.isNaN(updatedAt) || updatedAt < createdAt) {
    return null;
  }

  return updatedAt - createdAt;
};

export const formatDuration = (durationMs: number): string => {
  const totalSeconds = Math.floor(durationMs / 1000);

  if (totalSeconds <= 0) {
    return 'под 1 сек';
  }

  const units: Array<[string, number]> = [
    ['д', 24 * 60 * 60],
    ['ч', 60 * 60],
    ['мин', 60],
    ['сек', 1],
  ];

  let remainingSeconds = totalSeconds;
  const parts = units.reduce<string[]>((acc, [label, unitSeconds]) => {
    const value = Math.floor(remainingSeconds / unitSeconds);

    if (value > 0) {
      acc.push(`${value} ${label}`);
      remainingSeconds %= unitSeconds;
    }

    return acc;
  }, []);

  return parts.join(' ');
};

export const formatTaskDuration = (
  dateCreated?: string | null,
  dateUpdated?: string | null
): string | null => {
  const durationMs = getTaskDurationMs(dateCreated, dateUpdated);

  if (durationMs === null) {
    return null;
  }

  return formatDuration(durationMs);
};
