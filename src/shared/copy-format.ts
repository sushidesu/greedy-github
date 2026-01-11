const DEFAULT_COPY_FORMAT = "url-with-pr";
const VALID_COPY_FORMATS = [
  "short-sha",
  "full-sha",
  "url-with-pr",
  "url-without-pr"
] as const;

type CopyFormat = typeof VALID_COPY_FORMATS[number];

const normalizeCopyFormat = (value: unknown): CopyFormat => {
  if (VALID_COPY_FORMATS.includes(value as CopyFormat)) {
    return value as CopyFormat;
  }
  return DEFAULT_COPY_FORMAT;
};

export {
  DEFAULT_COPY_FORMAT,
  VALID_COPY_FORMATS,
  CopyFormat,
  normalizeCopyFormat
};
