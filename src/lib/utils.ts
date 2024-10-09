import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const units = ['px', 'mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'] as const;
export type Unit = typeof units[number];

export const conversionFactors: Record<Unit, number> = {
  px: 1,
  mm: 1000,
  cm: 100,
  m: 1,
  km: 0.001,
  in: 39.3701,
  ft: 3.28084,
  yd: 1.09361,
  mi: 0.000621371
};

export function formatMeasurement(value: number, unit: Unit): string {
  return `${value.toFixed(2)} ${unit}`;
}

export function formatAreaUnit(unit: Unit): string {
  return unit === 'in' ? 'sq in' : `${unit}²`;
}

export function parseInputWithUnit(input: string): { value: number | null; unit: Unit } {
  const match = input.match(/^(\d+([.,]\d+)?)\s*([a-zA-Z]+)?$/);
  if (!match) return { value: null, unit: 'm' };

  const value = parseFloat(match[1].replace(',', '.'));
  const unit = (match[3]?.toLowerCase() as Unit) || 'm';

  return { value, unit: Object.keys(conversionFactors).includes(unit) ? unit : 'm' };
}

export function convertDistance(distance: number, fromUnit: Unit, toUnit: Unit): number {
  return distance * (conversionFactors[toUnit] / conversionFactors[fromUnit]);
}

export function convertArea(area: number, fromUnit: Unit, toUnit: Unit): number {
  return area * Math.pow(conversionFactors[toUnit] / conversionFactors[fromUnit], 2);
}

export function calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }, pixelsPerUnit: number, unit: Unit): number {
  const pixelDistance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  return convertDistance(pixelDistance / pixelsPerUnit, 'm', unit);
}

export function calculateArea(points: { x: number; y: number }[], pixelsPerUnit: number, unit: Unit): number {
  let pixelArea = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    pixelArea += points[i].x * points[j].y;
    pixelArea -= points[j].x * points[i].y;
  }
  const areaInSquareMeters = Math.abs(pixelArea / 2) / (pixelsPerUnit * pixelsPerUnit);
  return convertArea(areaInSquareMeters, 'm', unit);
}