import type { Currency } from '../types';

const numberFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNumber(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatCurrency(value: number, currency: Currency): string {
  return `${currency} ${formatNumber(value)}`;
}

export function formatPercentage(value: number): string {
  return `${formatNumber(value)}%`;
}

export function parseLocaleNumber(raw: string): number {
  const sanitized = raw
    .trim()
    .replace(/\s/g, '')
    .replace(/\$/g, '')
    .replace(/USD|ARS/gi, '');

  if (!sanitized) return 0;

  const hasComma = sanitized.includes(',');
  const normalized = hasComma
    ? sanitized.replace(/\./g, '').replace(',', '.')
    : sanitized;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function editableNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return String(value).replace('.', ',');
}

export function fileSafeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
