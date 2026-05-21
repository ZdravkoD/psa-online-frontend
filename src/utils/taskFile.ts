const getLastPathSegment = (value: string): string | null => {
  const sanitizedValue = value.split('?')[0].split('#')[0];
  const pathSegments = sanitizedValue.split('/').filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];

  return lastSegment ? decodeURIComponent(lastSegment) : null;
};

export const getTaskInputFileKey = (
  fileData?: string | null,
  fileName?: string | null
): string | null => {
  if (fileData) {
    try {
      const url = new URL(fileData);
      const urlPathSegments = url.pathname.split('/').filter(Boolean);
      const lastSegment = urlPathSegments[urlPathSegments.length - 1];

      if (lastSegment) {
        return decodeURIComponent(lastSegment);
      }
    } catch {
      const extractedFileKey = getLastPathSegment(fileData);

      if (extractedFileKey) {
        return extractedFileKey;
      }
    }
  }

  return fileName ?? null;
};

export const getTaskInputFileApiPath = (
  fileData?: string | null,
  fileName?: string | null
): string | null => {
  const fileKey = getTaskInputFileKey(fileData, fileName);

  if (!fileKey) {
    return null;
  }

  return `/input-file/${encodeURIComponent(fileKey)}`;
};
