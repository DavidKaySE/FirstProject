import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  setMeasurePoints, 
  clearMeasurePoints, 
  Point,
  setUnitScale,
  setCurrentUnit,
  setSelectedTool,
  addHistoryEntry
} from '../store/canvasSlice';
import { Unit, units, calculateArea, calculateDistance, formatAreaUnit, convertDistance, convertArea } from '@/lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { en } from '@/lib/lang/en';

interface SetScaleToolProps {
  isOpen: boolean;
  onClose: () => void;
  pixelsPerUnit: number;
  currentUnit: Unit;
  updateMeasurements: (newPixelsPerUnit: number, newUnit: Unit) => void;
  width: number;
  height: number;
  measurePoints: Point[];
  isSettingScale: boolean;
  setIsSettingScale: (value: boolean) => void;
  handleClick: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleMouseLeave: () => void;
  handleDoubleClick: () => void;
  mousePosition: Point;
  isMeasuring: boolean;
  scaleType: 'distance' | 'area' | null;
}

const CLOSE_THRESHOLD = 10;

const SetScaleTool: React.FC<SetScaleToolProps> = ({
  onClose,
  pixelsPerUnit,
  currentUnit,
  updateMeasurements,
  measurePoints,
  isSettingScale,
  setIsSettingScale,
  handleMouseMove,
  handleMouseLeave,
  mousePosition,
  isMeasuring,
  scaleType
}) => {
  const dispatch = useDispatch();
  const [actualValue, setActualValue] = useState('');
  const isArea = useMemo(() => scaleType === 'area', [scaleType]);
  
  const defaultUnit = useMemo(() => {
    return currentUnit;
  }, [currentUnit]);

  const [selectedUnit, setSelectedUnit] = useState<Unit>(defaultUnit);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isPointClose = useCallback((p1: Point, p2: Point): boolean => {
    const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    return distance < CLOSE_THRESHOLD;
  }, []);

  const handleSetScale = useCallback(() => {
    if (measurePoints.length < 2 || !actualValue) return;

    let newPixelsPerUnit;
    if (isArea) {
      const pixelArea = calculateArea(measurePoints, 1, 'px');
      const actualArea = parseFloat(actualValue);
      newPixelsPerUnit = Math.sqrt(pixelArea / convertArea(actualArea, selectedUnit, 'px'));
    } else {
      const pixelDistance = calculateDistance(measurePoints[0], measurePoints[measurePoints.length - 1], 1, 'px');
      const actualDistance = parseFloat(actualValue);
      newPixelsPerUnit = pixelDistance / convertDistance(actualDistance, selectedUnit, 'px');
    }

    dispatch(setUnitScale(newPixelsPerUnit));
    dispatch(setCurrentUnit(selectedUnit));
    updateMeasurements(newPixelsPerUnit, selectedUnit);
    
    dispatch(addHistoryEntry());
    dispatch(clearMeasurePoints());
    setIsDialogOpen(false);
    setIsSettingScale(false);
    onClose();
  }, [dispatch, measurePoints, actualValue, selectedUnit, updateMeasurements, onClose, setIsSettingScale, isArea]);

  const tryFinishScaleMeasurement = useCallback((forceFinish = false) => {
    console.log('tryFinishScaleMeasurement called', { scaleType, measurePoints: measurePoints.length, isSettingScale, forceFinish });
    
    const shouldFinish = forceFinish || 
      (scaleType === 'distance' && measurePoints.length === 2) || 
      (scaleType === 'area' && measurePoints.length >= 3);

    if (shouldFinish) {
      console.log('Finishing scale measurement');
      setIsDialogOpen(true);
      setIsSettingScale(false);
    } else {
      console.log('Not enough points to finish measurement');
    }
  }, [scaleType, measurePoints, setIsSettingScale]);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    console.log('handleClick called in SetScaleTool', { isSettingScale, scaleType, measurePointsLength: measurePoints.length });
    
    if (!isSettingScale) return;

    const newPoint = { x: e.clientX, y: e.clientY };
    
    if (scaleType === 'distance') {
      if (measurePoints.length === 0) {
        console.log('Setting first point for distance');
        dispatch(setMeasurePoints({ points: [newPoint] }));
      } else if (measurePoints.length === 1) {
        console.log('Setting second point for distance and finishing measurement');
        dispatch(setMeasurePoints({ points: [...measurePoints, newPoint] }));
        // Anropa tryFinishScaleMeasurement direkt efter att ha satt den andra punkten
        tryFinishScaleMeasurement();
      } else {
        console.log('Ignoring click, already have 2 points for distance');
      }
    } else if (scaleType === 'area') {
      const updatedPoints = [...measurePoints, newPoint];
      dispatch(setMeasurePoints({ points: updatedPoints }));
      console.log('Setting point for area', { updatedPointsLength: updatedPoints.length });
      if (updatedPoints.length >= 3 && isPointClose(newPoint, updatedPoints[0])) {
        console.log('Finishing area measurement');
        tryFinishScaleMeasurement();
      }
    }
  }, [isSettingScale, measurePoints, scaleType, dispatch, tryFinishScaleMeasurement, isPointClose]);

  const handleDoubleClick = useCallback(() => {
    tryFinishScaleMeasurement(true);
  }, [tryFinishScaleMeasurement]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      console.log('ESC pressed, cancelling scale setting');
      dispatch(clearMeasurePoints());
      setIsSettingScale(false);
      onClose();
    } else if (e.key === 'Enter') {
      if (isSettingScale && !isDialogOpen) {
        tryFinishScaleMeasurement(true);
      }
    }
  }, [isSettingScale, isDialogOpen, dispatch, setIsSettingScale, onClose, tryFinishScaleMeasurement]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSetScale();
    }
  }, [handleSetScale]);

  useEffect(() => {
    if (isSettingScale) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isSettingScale, handleKeyDown]);

  const renderScaleLine = useMemo(() => {
    if (measurePoints.length === 0 || isDialogOpen) return null;

    const activePoints = scaleType === 'distance' ? 
      (measurePoints.length === 1 ? [...measurePoints, mousePosition] : measurePoints) :
      [...measurePoints, mousePosition];

    const pathData = activePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const isPolygon = scaleType === 'area' && activePoints.length > 2;

    return (
      <g>
        <path
          d={pathData + (isPolygon ? ' Z' : '')}
          fill={isPolygon ? "rgba(255, 0, 0, 0.1)" : "none"}
          stroke="rgba(255, 0, 0, 0.8)"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        {activePoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="none"
            stroke="rgba(255, 0, 0, 0.8)"
            strokeWidth="2"
          />
        ))}
      </g>
    );
  }, [measurePoints, mousePosition, isDialogOpen, scaleType]);

  const renderActiveMeasurement = useMemo(() => {
    if (!isMeasuring || measurePoints.length === 0 || isDialogOpen) return null;

    const activePoints = [...measurePoints, mousePosition];
    const isPolygon = activePoints.length > 2;

    let distance = 0;
    let area = 0;
    let lastLineDistance = 0;

    if (activePoints.length >= 2) {
      const lastIndex = activePoints.length - 1;
      const secondLastIndex = activePoints.length - 2;
      const dx = activePoints[lastIndex].x - activePoints[secondLastIndex].x;
      const dy = activePoints[lastIndex].y - activePoints[secondLastIndex].y;
      lastLineDistance = Math.sqrt(dx * dx + dy * dy) / pixelsPerUnit;

      if (activePoints.length <= 3) {
        distance = lastLineDistance;
      } else if (isPolygon) {
        let pixelArea = 0;
        for (let i = 0; i < activePoints.length; i++) {
          const j = (i + 1) % activePoints.length;
          pixelArea += activePoints[i].x * activePoints[j].y;
          pixelArea -= activePoints[j].x * activePoints[i].x;
        }
        area = Math.abs(pixelArea / 2) / (pixelsPerUnit * pixelsPerUnit);
      }
    }

    const tooltipContent = isPolygon 
      ? `${area.toFixed(2)} ${currentUnit}² (${lastLineDistance.toFixed(2)} ${currentUnit})`
      : `${distance.toFixed(2)} ${currentUnit}`;

    const lastPoint = activePoints[activePoints.length - 1];

    return (
      <g transform={`translate(${lastPoint.x + 10}, ${lastPoint.y - 10})`}>
        <rect
          x="-5"
          y="-20"
          width={tooltipContent.length * 7 + 10}
          height="20"
          rx="3"
          ry="3"
          fill="rgba(0, 0, 0, 0.7)"
        />
        <text
          x={(tooltipContent.length * 7 + 10) / 2 - 5}
          y="-10"
          fill="white"
          fontSize="12"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {tooltipContent}
        </text>
      </g>
    );
  }, [measurePoints, mousePosition, pixelsPerUnit, currentUnit, isMeasuring, isDialogOpen]);

  // Lägg till denna useEffect för att logga när isDialogOpen ändras
  useEffect(() => {
    console.log('isDialogOpen changed:', isDialogOpen);
  }, [isDialogOpen]);

  // Lägg till denna useEffect för att logga när measurePoints ändras
  useEffect(() => {
    console.log('measurePoints changed:', measurePoints);
  }, [measurePoints]);

  useEffect(() => {
    console.log('scaleType changed:', scaleType);
  }, [scaleType]);

  useEffect(() => {
    console.log('SetScaleTool mounted/updated');
  }, []);

  useEffect(() => {
    console.log('isSettingScale changed:', isSettingScale);
  }, [isSettingScale]);

  return (
    <>
      <g
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {renderScaleLine}
        {renderActiveMeasurement}
      </g>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setIsSettingScale(false);
          dispatch(clearMeasurePoints());
          dispatch(setSelectedTool('measure'));
          onClose();
        } else {
          setSelectedUnit(defaultUnit);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{en.setScale}</DialogTitle>
            <DialogDescription>
              {scaleType === 'area' ? en.enterActualArea : en.enterActualDistance}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex gap-2">
            <Input
              type="number"
              placeholder={scaleType === 'area' ? en.enterArea : en.enterDistance}
              value={actualValue}
              onChange={(e) => setActualValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="flex-grow text-right pr-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Select 
              value={selectedUnit} 
              onValueChange={(value: Unit) => {
                setSelectedUnit(value);
                dispatch(setCurrentUnit(value));
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder={en.selectUnit} />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {scaleType === 'area' ? formatAreaUnit(unit) : unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleSetScale}>{en.setScale}</Button>
            <Button onClick={() => {
              dispatch(clearMeasurePoints());
              dispatch(setSelectedTool('measure'));
              setIsDialogOpen(false);
              setIsSettingScale(false);
            }} variant="outline">{en.cancel}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SetScaleTool;