import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Unit } from '@/lib/utils';
import { calculateDistance, calculateArea, convertDistance, convertArea } from '@/lib/utils';

export type Point = { x: number; y: number };

export type Measurement = {
  points: Point[];
  distance: number;
  area: number;
};

interface MousePosition {
  x: number;
  y: number;
}

interface CanvasState {
  currentFile: { name: string; objectURL: string } | null;
  images: string[];
  isOpen: boolean;
  width: number;
  height: number;
  selectedTool: string;
  measurePoints: Point[];
  measurements: Measurement[];
  history: {
    measurements: Measurement[];
    scale: number;
    pixelsPerUnit: number;
    currentUnit: Unit;
  }[];
  historyIndex: number;
  backgroundImage: string | null;
  backgroundScale: number;
  mousePosition: MousePosition;
  showAllMeasurements: boolean;
  pixelsPerUnit: number;
  currentUnit: Unit;
  scale: number;
  isDragging: boolean;
  lastStableState: Measurement[] | null;
  scaleType: 'distance' | 'area' | null;
  clickedMeasurement: Measurement | null;
}

const initialState: CanvasState = {
  images: [],
  isOpen: false,
  currentFile: null,
  width: 0,
  height: 0,
  selectedTool: 'measure',
  measurePoints: [],
  measurements: [],
  history: [{
    measurements: [],
    scale: 1,
    pixelsPerUnit: 100,
    currentUnit: 'px',
  }],
  historyIndex: 0,
  backgroundImage: null,
  backgroundScale: 1,
  mousePosition: { x: 0, y: 0 },
  showAllMeasurements: false,
  pixelsPerUnit: 100,
  currentUnit: 'cm',
  scale: 1,
  isDragging: false,
  lastStableState: null,
  scaleType: null,
  clickedMeasurement: null,
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    closeCanvas: (state) => {
      state.isOpen = false;
      state.currentFile = null;
    },
    addImage: (state, action: PayloadAction<string>) => {
      if (!state.images.includes(action.payload)) {
        state.images.push(action.payload);
      }
    },
    removeImage: (state, action: PayloadAction<string>) => {
      state.images = state.images.filter(img => img !== action.payload);
    },
    setSelectedTool: (state, action: PayloadAction<string>) => {
      state.selectedTool = action.payload;
    },
    setMeasurePoints: (state, action: PayloadAction<{ points: Point[] }>) => {
      state.measurePoints = action.payload.points;
    },
    addMeasurement: (state, action: PayloadAction<{ points: Point[] }>) => {
      const { points } = action.payload;
      let distance = 0;
      let area = 0;

      if (points.length <= 3) {
        distance = calculateDistance(points[0], points[1], state.pixelsPerUnit, state.currentUnit);
      } else if (points.length > 2) {
        area = calculateArea(points, state.pixelsPerUnit, state.currentUnit);
      }

      state.measurements.push({ points, distance, area });
    },
    clearMeasurePoints: (state) => {
      state.measurePoints = [];
    },
    setImageDimensions: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.width = action.payload.width;
      state.height = action.payload.height;
    },
    setCurrentFile: (state, action: PayloadAction<{ name: string; objectURL: string }>) => {
      state.currentFile = action.payload;
    },
    setBackgroundScale: (state, action: PayloadAction<number>) => {
      state.backgroundScale = action.payload;
    },
    setMeasurements: (state, action: PayloadAction<Measurement[]>) => {
      state.measurements = action.payload;
    },
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        const historyItem = state.history[state.historyIndex];
        state.measurements = historyItem.measurements;
        state.scale = historyItem.scale;
        state.pixelsPerUnit = historyItem.pixelsPerUnit;
        state.currentUnit = historyItem.currentUnit;
      }
    },
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const historyItem = state.history[state.historyIndex];
        state.measurements = historyItem.measurements;
        state.scale = historyItem.scale;
        state.pixelsPerUnit = historyItem.pixelsPerUnit;
        state.currentUnit = historyItem.currentUnit;
      }
    },
    updateMeasurement: (state, action: PayloadAction<{ index: number; measurement: Measurement }>) => {
      const { index, measurement } = action.payload;
      if (index >= 0 && index < state.measurements.length) {
        state.measurements[index] = measurement;
        state.history = [...state.history.slice(0, state.historyIndex + 1), {
          measurements: [...state.measurements],
          scale: state.scale,
          pixelsPerUnit: state.pixelsPerUnit,
          currentUnit: state.currentUnit,
        }];
        state.historyIndex = state.history.length - 1;
      }
    },
    removeMeasurement: (state, action: PayloadAction<number>) => {
      state.measurements = state.measurements.filter((_, index) => index !== action.payload);
      state.history = [...state.history.slice(0, state.historyIndex + 1), {
        measurements: [...state.measurements],
        scale: state.scale,
        pixelsPerUnit: state.pixelsPerUnit,
        currentUnit: state.currentUnit,
      }];
      state.historyIndex = state.history.length - 1;
    },
    setShowAllMeasurements: (state, action: PayloadAction<boolean>) => {
      state.showAllMeasurements = action.payload;
    },
    setUnitScale: (state, action: PayloadAction<number>) => {
      state.pixelsPerUnit = action.payload;
      state.scale = 100 / action.payload;
    },
    setScale: (state, action: PayloadAction<number>) => {
      state.scale = action.payload;
      state.pixelsPerUnit = 100 / action.payload;
    },
    setCurrentUnit: (state, action: PayloadAction<Unit>) => {
      state.currentUnit = action.payload;
    },
    startDragging: (state) => {
      state.isDragging = true;
      state.lastStableState = JSON.parse(JSON.stringify(state.measurements));
    },
    stopDragging: (state) => {
      state.isDragging = false;
      state.lastStableState = null;
      // Lägg till en ny historiepost här
      state.history = [...state.history.slice(0, state.historyIndex + 1), {
        measurements: [...state.measurements],
        scale: state.scale,
        pixelsPerUnit: state.pixelsPerUnit,
        currentUnit: state.currentUnit,
      }];
      state.historyIndex = state.history.length - 1;
    },
    updateMeasurementPoint: (state, action: PayloadAction<{ measurementIndex: number; pointIndex: number; newPoint: Point }>) => {
      const { measurementIndex, pointIndex, newPoint } = action.payload;
      if (measurementIndex >= 0 && measurementIndex < state.measurements.length) {
        const measurement = state.measurements[measurementIndex];
        measurement.points[pointIndex] = newPoint;
        if (measurement.points.length > 3) {
          if (pointIndex === 0) {
            measurement.points[measurement.points.length - 1] = newPoint;
          } else if (pointIndex === measurement.points.length - 1) {
            measurement.points[0] = newPoint;
          }
        }
        
        // Uppdatera distans och area
        if (measurement.points.length <= 3) {
          measurement.distance = calculateDistance(measurement.points[0], measurement.points[1], state.pixelsPerUnit, state.currentUnit);
        } else {
          measurement.area = calculateArea(measurement.points, state.pixelsPerUnit, state.currentUnit);
        }
      }
    },
    resetHistory: (state) => {
      state.history = [];
      state.historyIndex = -1;
    },
    addHistoryEntry: (state) => {
      state.history = [...state.history.slice(0, state.historyIndex + 1), {
        measurements: [...state.measurements],
        scale: state.scale,
        pixelsPerUnit: state.pixelsPerUnit,
        currentUnit: state.currentUnit,
      }];
      state.historyIndex = state.history.length - 1;
    },
    updateMeasurementsUnit: (state, action: PayloadAction<Unit>) => {
      const newUnit = action.payload;
      state.measurements = state.measurements.map(measurement => {
        if (measurement.points.length <= 3) {
          return {
            ...measurement,
            distance: convertDistance(measurement.distance, state.currentUnit, newUnit)
          };
        } else {
          return {
            ...measurement,
            area: convertArea(measurement.area, state.currentUnit, newUnit)
          };
        }
      });
      state.currentUnit = newUnit;
    },
    setScaleType: (state, action: PayloadAction<'distance' | 'area' | null>) => {
      state.scaleType = action.payload;
    },
    setClickedMeasurement: (state, action: PayloadAction<Measurement | null>) => {
      state.clickedMeasurement = action.payload;
    },
    updateScaleFromMeasurement: (state, action: PayloadAction<{ value: number; unit: Unit }>) => {
      const { value, unit } = action.payload;
      if (state.clickedMeasurement) {
        const pixelDistance = calculateDistance(
          state.clickedMeasurement.points[0],
          state.clickedMeasurement.points[1],
          1,
          'px'
        );
        const newPixelsPerUnit = pixelDistance / convertDistance(value, unit, 'px');
        state.pixelsPerUnit = newPixelsPerUnit;
        state.scale = 100 / newPixelsPerUnit;
        state.currentUnit = unit;

        // Uppdatera alla mätningar med den nya skalan
        state.measurements = state.measurements.map(measurement => ({
          ...measurement,
          distance: calculateDistance(measurement.points[0], measurement.points[1], newPixelsPerUnit, unit),
          area: calculateArea(measurement.points, newPixelsPerUnit, unit)
        }));

        // Lägg till en ny historiepost
        state.history.push({
          measurements: [...state.measurements],
          scale: state.scale,
          pixelsPerUnit: state.pixelsPerUnit,
          currentUnit: state.currentUnit,
        });
        state.historyIndex = state.history.length - 1;
      }
    },
  },
});

export const {
  closeCanvas,
  addImage,
  removeImage,
  setSelectedTool,
  setMeasurePoints,
  addMeasurement,
  clearMeasurePoints,
  setImageDimensions,
  setCurrentFile,
  setBackgroundScale,
  setMeasurements,
  undo,
  redo,
  updateMeasurement,
  removeMeasurement,
  setShowAllMeasurements,
  setUnitScale,
  setScale,
  setCurrentUnit,
  startDragging,
  stopDragging,
  updateMeasurementPoint,
  resetHistory,
  addHistoryEntry,
  updateMeasurementsUnit,
  setScaleType,
  setClickedMeasurement,
  updateScaleFromMeasurement,
} = canvasSlice.actions;

export default canvasSlice.reducer;