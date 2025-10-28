import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateText(text: string, maxLength: number = 35): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, text.lastIndexOf(' ', maxLength));
  return truncated ? truncated + ' ...' : text.substring(0, maxLength) + ' ...';
}

export function formatPrice(price: number): string {
  return price.toLocaleString('ro-RO');
}