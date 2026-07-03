export function initialsFromEmail(email) {
  if (!email) return "?";
  const name = email.split("@")[0];
  const parts = name.split(/[.\-_]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
