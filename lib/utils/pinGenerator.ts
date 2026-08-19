export function generateGamePin(): string {
  // Generate a random 6-digit numeric PIN
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  return pin;
}

export function formatPin(pin: string): string {
  if (!pin) return "";
  const cleaned = pin.replace(/\D/g, "").slice(0, 6);
  if (cleaned.length > 3) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  return cleaned;
}
