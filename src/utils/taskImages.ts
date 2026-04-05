export interface ParsedTaskImage {
  capturedAt: Date | null;
  capturedAtLabel: string;
  kind: string;
  provider: string;
  sequence: number;
  url: string;
}

interface TaskImageGroup {
  firstCapturedAt: Date | null;
  images: ParsedTaskImage[];
  provider: string;
}

const providerLabels: Record<string, string> = {
  phoenixpharmaoptimized: 'Phoenix',
  stingpharma: 'Sting',
};

function getFilename(url: string) {
  const withoutQuery = url.split('?')[0];
  const parts = withoutQuery.split('/');
  return parts[parts.length - 1] || '';
}

function parseCapturedAt(rawValue: string) {
  const match = rawValue.match(
    /^(\d{4})\.(\d{2})\.(\d{2})_(\d{2})\.(\d{2})\.(\d{2})$/
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatCapturedAt(date: Date | null) {
  if (!date) {
    return 'Неизвестен час';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatProvider(rawProvider: string) {
  return providerLabels[rawProvider.toLowerCase()] || rawProvider || 'Неизвестен източник';
}

function formatKind(rawKind: string) {
  return rawKind.replace(/_/g, ' ') || 'Screenshot';
}

export function parseTaskImage(url: string, sequence: number): ParsedTaskImage {
  const filename = getFilename(url).replace(/\.png$/i, '');
  const parts = filename.split('_');
  const [datePart = '', timePart = '', rawProvider = '', ...kindParts] = parts;
  const capturedAt = parseCapturedAt(`${datePart}_${timePart}`);

  return {
    url,
    sequence,
    provider: formatProvider(rawProvider),
    kind: formatKind(kindParts.join('_')),
    capturedAt,
    capturedAtLabel: formatCapturedAt(capturedAt),
  };
}

export function groupTaskImages(imageUrls: string[]) {
  const parsedImages = imageUrls
    .map((url, index) => parseTaskImage(url, index + 1))
    .sort((left, right) => {
      const leftTime = left.capturedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const rightTime = right.capturedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;

      if (leftTime !== rightTime) {
        return leftTime - rightTime;
      }

      return left.sequence - right.sequence;
    });

  const groups = parsedImages.reduce<TaskImageGroup[]>((accumulator, image) => {
    const existingGroup = accumulator.find(
      (group) => group.provider === image.provider
    );

    if (existingGroup) {
      existingGroup.images.push(image);
      return accumulator;
    }

    accumulator.push({
      provider: image.provider,
      firstCapturedAt: image.capturedAt,
      images: [image],
    });
    return accumulator;
  }, []);

  groups.sort((left, right) => {
    const leftTime = left.firstCapturedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const rightTime =
      right.firstCapturedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;

    return leftTime - rightTime;
  });

  return {
    groups,
    orderedImages: parsedImages,
    firstImage: parsedImages[0] ?? null,
    lastImage: parsedImages[parsedImages.length - 1] ?? null,
  };
}
