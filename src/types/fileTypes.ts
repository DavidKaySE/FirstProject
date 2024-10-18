import { Measurement } from '../store/canvasSlice';
import { Unit } from '@/lib/utils';

export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  measurements: Measurement[];
  pixelsPerUnit: number;
  currentUnit: Unit;
  scale: number;
  lastModified: number;
}

export interface FileData {
  name: string;
  objectURL: string;
  metadata: FileMetadata;
}