const DEFAULT_COPY_FORMAT = "url-with-pr";
const VALID_COPY_FORMATS = [
  "short-sha",
  "full-sha",
  "url-with-pr",
  "url-without-pr"
] as const;

type CopyFormat = typeof VALID_COPY_FORMATS[number];

const form = document.querySelector<HTMLFormElement>("#copy-format-form");

const normalizeCopyFormat = (value: unknown): CopyFormat => {
  if (VALID_COPY_FORMATS.includes(value as CopyFormat)) {
    return value as CopyFormat;
  }
  return DEFAULT_COPY_FORMAT;
};

const loadCopyFormat = async () => {
  const { copyFormat } = await chrome.storage.sync.get({
    copyFormat: DEFAULT_COPY_FORMAT
  });
  const normalized = normalizeCopyFormat(copyFormat);
  const input = form?.querySelector<HTMLInputElement>(
    `input[name="copyFormat"][value="${normalized}"]`
  );
  if (input) input.checked = true;
};

const saveCopyFormat = async (value: string) => {
  const normalized = normalizeCopyFormat(value);
  await chrome.storage.sync.set({ copyFormat: normalized });
};

form?.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement | null;
  if (!target || target.name !== "copyFormat") return;
  void saveCopyFormat(target.value);
});

void loadCopyFormat();
