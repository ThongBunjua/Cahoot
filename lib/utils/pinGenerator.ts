export function generateGamePin(): string {
  // Generate a random 4-digit numeric PIN (1000 - 9999)
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  return pin;
}

export function formatPin(pin: string): string {
  if (!pin) return "";
  const cleaned = pin.replace(/\D/g, "").slice(0, 4);
  return cleaned;
}
