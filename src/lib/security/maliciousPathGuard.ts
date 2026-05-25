/**
 * Block known malware / miner probe paths (e.g. xmrig drops, webshells).
 * Returns a short reason when the request should be denied.
 */
const BLOCKED_PATH_PATTERNS: RegExp[] = [
  /\/xmrig/i,
  /\/xmrig-/i,
  /\/kdevtmpfsi/i,
  /\/kinsing/i,
  /\/\.env$/i,
  /\/\.env\./i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/phpmyadmin/i,
  /\/\.git\//i,
  /\/shell\.php/i,
  /\/c99\.php/i,
  /\/r57\.php/i,
  /\/eval-stdin\.php/i,
];

const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".dll",
  ".so",
  ".sh",
  ".bat",
  ".cmd",
  ".ps1",
  ".msi",
]);

export function getMaliciousPathBlockReason(pathname: string): string | null {
  const path = pathname.toLowerCase();

  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (pattern.test(path)) {
      return "blocked_path_pattern";
    }
  }

  for (const ext of BLOCKED_EXTENSIONS) {
    if (path.endsWith(ext) || path.includes(`${ext}/`)) {
      return "blocked_executable_extension";
    }
  }

  return null;
}

/** Safe extensions for user-uploaded media under public/uploads. */
export const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
]);

export function isAllowedUploadFilename(fileName: string): boolean {
  const base = fileName.replace(/\\/g, "/").split("/").pop() ?? "";
  if (!base || base.includes("..")) return false;
  const lower = base.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot < 1) return false;
  const ext = lower.slice(dot);
  return ALLOWED_UPLOAD_EXTENSIONS.has(ext);
}
