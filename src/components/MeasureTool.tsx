import React, { RefObject, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { 
  setMeasurePoints, 
  addMeasurement, 
  clearMeasurePoints, 
  updateMeasurement, 
  removeMeasurement, 
  setSelectedTool, 
  Point,
  updateMeasurementPoint,
  startDragging,
  stopDragging,
  setMeasurements,
  addHistoryEntry
} from '../store/canvasSlice';
import { shallowEqual } from 'react-redux';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useTransformEffect } from 'react-zoom-pan-pinch';
import { 
  Unit, 
  calculateDistance, 
  calculateArea 
} from '@/lib/utils';
import { useFileManager } from '../hooks/useFileManager';
import SetScaleTool from '../components/SetScaleTool';
import { formatMeasurement, formatAreaUnit } from '@/lib/utils';

const CLOSE_THRESHOLD = 10;

interface MeasureToolProps {
  containerRef: RefObject<HTMLDivElement>;
  width: number;
  height: number;
  isInitialLoad: boolean;
}

const MeasureTool: React.FC<MeasureToolProps> = React.memo(({ isInitialLoad, width, height, containerRef }) => {
  const dispatch = useDispatch();
  const measurePoints = useSelector((state: RootState) => state.canvas.measurePoints, shallowEqual);
  // Remove unused variable
  // const [isHovering, setIsHovering] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const measurements = useSelector((state: RootState) => state.canvas.measurements, shallowEqual);
  const [transform, setTransform] = useState({ scale: 1, positionX: 0, positionY: 0 });
  const [hoveredMeasurement, setHoveredMeasurement] = useState<number | null>(null);
  const [selectedMeasurement, setSelectedMeasurement] = useState<number | null>(null);
  const [draggingPoint, setDraggingPoint] = useState<{ measurementIndex: number, pointIndex: number } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const showAllMeasurements = useSelector((state: RootState) => state.canvas.showAllMeasurements);
  const pixelsPerUnit = useSelector((state: RootState) => state.canvas.pixelsPerUnit);
  const currentUnit = useSelector((state: RootState) => state.canvas.currentUnit);
  const selectedTool = useSelector((state: RootState) => state.canvas.selectedTool);
  const { saveMeasurements } = useFileManager();
  const currentFile = useSelector((state: RootState) => state.canvas.currentFile);
  const scale = useSelector((state: RootState) => state.canvas.scale);
  const [isSettingScale, setIsSettingScale] = useState(false);
  const scaleType = useSelector((state: RootState) => state.canvas.scaleType);
  const [isDraggingPoint, setIsDraggingPoint] = useState(false);

  useTransformEffect(({ state }) => {
    setTransform({
      scale: state.scale,
      positionX: state.positionX,
      positionY: state.positionY
    });
  });

  const isPointClose = useCallback((p1: Point | undefined, p2: Point | undefined): boolean => {
    if (!p1 || !p2) return false;
    const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    return distance < CLOSE_THRESHOLD;
  }, []);

  const handleDrag = useCallback((measurementIndex: number, pointIndex: number, newPoint: Point) => {
    dispatch(updateMeasurementPoint({ measurementIndex, pointIndex, newPoint }));
    
    const measurement = measurements[measurementIndex];
    if (measurement.points.length > 3) {
      if (pointIndex === 0) {
        dispatch(updateMeasurementPoint({ 
          measurementIndex, 
          pointIndex: measurement.points.length - 1, 
          newPoint 
        }));
      } else if (pointIndex === measurement.points.length - 1) {
        dispatch(updateMeasurementPoint({ 
          measurementIndex, 
          pointIndex: 0, 
          newPoint 
        }));
      }
    }
  }, [dispatch, measurements]);

  const handleMouseDown = useCallback(() => {
    setIsDragging(false);
    dispatch(startDragging());
  }, [dispatch]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - containerRect.left - transform.positionX) / transform.scale;
    const y = (e.clientY - containerRect.top - transform.positionY) / transform.scale;
    
    setMousePosition({ x, y });

    if (draggingPoint && svgRef.current) {
      const { measurementIndex, pointIndex } = draggingPoint;
      handleDrag(measurementIndex, pointIndex, { x, y });
    } else {
      setIsDragging(true);
    }
  }, [containerRef, transform, draggingPoint, handleDrag]);

  const handleMouseUp = useCallback(() => {
    setDraggingPoint(null);
    setIsDraggingPoint(false);
    dispatch(stopDragging());
  }, [dispatch]);

  const handleMouseLeave = useCallback(() => {}, []);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (isInitialLoad || isDragging || isDraggingPoint) return;

    const target = e.target as SVGSVGElement;
    if (target.closest('button')) {
      return;
    }

    if (!mousePosition) return;

    const pos = mousePosition;
    
    if (selectedTool === 'setScale') {
      dispatch(setMeasurePoints({ points: [...measurePoints, pos] }));
      if (measurePoints.length === 1) {
        setIsSettingScale(true);
      }
    } else {
      if (!isMeasuring) {
        setIsMeasuring(true);
        dispatch(setMeasurePoints({ points: [pos] }));
        setSelectedMeasurement(null);
        return;
      }

      const lastPoint = measurePoints[measurePoints.length - 1];
      const firstPoint = measurePoints[0];

      if (isPointClose(pos, lastPoint) || isPointClose(pos, firstPoint)) {
        const finalPoints = [...measurePoints, firstPoint];

        dispatch(addMeasurement({ points: finalPoints }));
        dispatch(addHistoryEntry());
        dispatch(clearMeasurePoints());
        setIsMeasuring(false);
      } else {
        dispatch(setMeasurePoints({ points: [...measurePoints, pos] }));
      }
    }
  }, [dispatch, measurePoints, isMeasuring, mousePosition, isPointClose, isInitialLoad, isDragging, isDraggingPoint, selectedTool]);

  const handleDoubleClick = useCallback(() => {
    if (selectedTool === 'setScale') {
      return;
    }

    if (measurePoints.length >= 2) {
      const finalPoints = [...measurePoints];
      if (measurePoints.length > 2) {
        finalPoints.push(measurePoints[0]);
      }
      dispatch(addMeasurement({ points: finalPoints }));
      dispatch(addHistoryEntry());
      dispatch(clearMeasurePoints());
      setIsMeasuring(false);
    } else {
      dispatch(clearMeasurePoints());
      setIsMeasuring(false);
    }
  }, [selectedTool, measurePoints, dispatch, setIsMeasuring]);


  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      if (selectedTool === 'setScale') {
        if (measurePoints.length >= 2) {
          setIsSettingScale(true);
        } else {
          dispatch(clearMeasurePoints());
          dispatch(setSelectedTool('measure'));
        }
      } else {
        if (measurePoints.length >= 2) {
          const finalPoints = [...measurePoints];
          if (measurePoints.length > 2) {
            finalPoints.push(measurePoints[0]);
          }
          dispatch(addMeasurement({ points: finalPoints }));
          dispatch(addHistoryEntry());
          dispatch(clearMeasurePoints());
          setIsMeasuring(false);
        } else {
          dispatch(clearMeasurePoints());
          setIsMeasuring(false);
        }
      }
    }
  }, [selectedTool, dispatch, measurePoints]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const transformPoint = useCallback((point: Point): Point => {
    return { x: point.x, y: point.y };
  }, []);

  const handleMeasurementClick = useCallback((index: number) => {
    setSelectedMeasurement(prevSelected => prevSelected === index ? null : index);
  }, []);

  const handlePointMouseDown = useCallback((measurementIndex: number, pointIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingPoint({ measurementIndex, pointIndex });
    setIsDraggingPoint(true);
    dispatch(startDragging());
  }, [dispatch]);

  const handleDeleteMeasurement = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeMeasurement(index));
    setSelectedMeasurement(null);
  }, [dispatch]);

  const updateMeasurements = useCallback((newPixelsPerUnit: number, newUnit: Unit) => {
    measurements.forEach((measurement, index) => {
      const updatedMeasurement = { ...measurement };
      if (updatedMeasurement.points.length <= 3) {
        updatedMeasurement.distance = calculateDistance(updatedMeasurement.points[0], updatedMeasurement.points[1], newPixelsPerUnit, newUnit);
      } else if (updatedMeasurement.points.length > 2) {
        updatedMeasurement.area = calculateArea(updatedMeasurement.points, newPixelsPerUnit, newUnit);
      }
      dispatch(updateMeasurement({ index, measurement: updatedMeasurement }));
    });
  }, [dispatch, measurements]);

  const renderMeasurements = useMemo(() => {
    return measurements.map((measurement, index) => {
      const { points, distance, area } = measurement;
      const isLine = points.length <= 3;
      
      let resultText = isLine
        ? formatMeasurement(distance, currentUnit)
        : area != null ? `${area.toFixed(2)} ${formatAreaUnit(currentUnit)}` : 'N/A';

      const transformedPoints = points.map(transformPoint);
      const pathData = transformedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + (points.length > 2 ? ' Z' : '');
      const isSelected = selectedMeasurement === index;
      const isHovered = hoveredMeasurement === index;
      const shouldShowDetails = showAllMeasurements || isSelected || isHovered;

      const centerPoint = transformedPoints.reduce(
        (acc, point, i) => {
          if (i === 0) return acc;
          const prevPoint = transformedPoints[i - 1];
          acc.x += (prevPoint.x + point.x) / 2;
          acc.y += (prevPoint.y + point.y) / 2;
          return acc;
        },
        { x: 0, y: 0 }
      );
      centerPoint.x /= transformedPoints.length - 1;
      centerPoint.y /= transformedPoints.length - 1;

      let offsetX = 0;
      let offsetY = 0;
      if (isLine) {
        const dx = transformedPoints[1].x - transformedPoints[0].x;
        const dy = transformedPoints[1].y - transformedPoints[0].y;
        const length = Math.sqrt(dx * dx + dy * dy);
        offsetX = -dy / length * 20;
        offsetY = dx / length * 20;
      } else {
        offsetY = -20;
      }

      return (
        <g 
          key={index}
          onMouseEnter={() => setHoveredMeasurement(index)}
          onMouseLeave={() => setHoveredMeasurement(null)}
          onClick={() => handleMeasurementClick(index)}
          style={{ cursor: 'pointer' }}
        >
          <Tooltip open={shouldShowDetails}>
            <TooltipTrigger asChild>
              {isLine ? (
                <line
                  x1={transformedPoints[0].x}
                  y1={transformedPoints[0].y}
                  x2={transformedPoints[1].x}
                  y2={transformedPoints[1].y}
                  stroke={isSelected ? "rgba(59, 130, 246, 1)" : "rgba(59, 130, 246, 0.6)"}
                  strokeWidth={isSelected ? "3" : "2"}
                  className="hover:stroke-blue-400 transition-colors duration-200"
                />
              ) : (
                <path
                  d={pathData}
                  fill={isSelected ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.05)"}
                  stroke={isSelected ? "rgba(59, 130, 246, 1)" : "rgba(59, 130, 246, 0.6)"}
                  strokeWidth={isSelected ? "2" : "1"}
                  className="hover:fill-blue-200 hover:stroke-blue-400 transition-colors duration-200"
                />
              )}
            </TooltipTrigger>
            <TooltipContent>
              {resultText}
            </TooltipContent>
          </Tooltip>
          {shouldShowDetails && (
            <g transform={`translate(${centerPoint.x + offsetX}, ${centerPoint.y + offsetY})`}>
              <rect
                x={-resultText.length * 3.5 - 5}
                y="-10"
                width={resultText.length * 7 + 10}
                height="20"
                rx="3"
                ry="3"
                fill="rgba(0, 0, 0, 0.7)"
              />
              <text
                fill="white"
                fontSize="12"
                textAnchor="middle"
                dominantBaseline="middle"
                className="transition-colors duration-200"
              >
                {resultText}
              </text>
              {(isSelected || showAllMeasurements) && (
                <g
                  transform={`translate(${resultText.length * 3.5 + 15}, 0)`}
                  onClick={(e) => handleDeleteMeasurement(index, e)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle r="5" fill="white" stroke="rgba(59, 130, 246, 1)" strokeWidth="0.5" />
                  <path
                    d="M-2,-2 L2,2 M2,-2 L-2,2"
                    stroke="rgba(59, 130, 246, 1)"
                    strokeWidth="0.5"
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>
          )}
          {transformedPoints.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="5"
              fill={shouldShowDetails ? "rgba(59, 130, 246, 0.5)" : "none"}
              stroke="rgba(59, 130, 246, 0.8)"
              strokeWidth="1"
              style={{ cursor: shouldShowDetails ? 'move' : 'pointer' }}
              onMouseDown={(e) => shouldShowDetails && handlePointMouseDown(index, i, e)}
            />
          ))}
        </g>
      );
    });
  }, [measurements, hoveredMeasurement, selectedMeasurement, showAllMeasurements, handleMeasurementClick, handleDeleteMeasurement, handlePointMouseDown, transformPoint, currentUnit]);

  const renderActiveMeasurement = useMemo(() => {
    if (selectedTool === 'setScale') return null;
    if (!isMeasuring) return null;

    const activePoints = [...measurePoints, mousePosition];
    const transformedPoints = activePoints.map(transformPoint);
    const pathData = transformedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const isPolygon = activePoints.length > 2;

    let distance = 0;
    let area = 0;

    if (activePoints.length >= 2) {
      const lastIndex = activePoints.length - 1;
      const secondLastIndex = activePoints.length - 2;
      distance = calculateDistance(activePoints[secondLastIndex], activePoints[lastIndex], pixelsPerUnit, currentUnit);

      if (activePoints.length >= 3) {
        area = calculateArea(activePoints, pixelsPerUnit, currentUnit);
      }
    }

    const tooltipContent = isPolygon 
      ? `${area.toFixed(2)} ${currentUnit}² (${distance.toFixed(2)} ${currentUnit})`
      : `${distance.toFixed(2)} ${currentUnit}`;

    const lastPoint = transformedPoints[transformedPoints.length - 1];

    return (
      <g>
        <path
          d={pathData + (isPolygon ? ' Z' : '')}
          fill={isPolygon ? "rgba(59, 130, 246, 0.1)" : "none"}
          stroke="rgba(59, 130, 246, 0.8)"
          strokeWidth="2"
        />
        {transformedPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="none"
            stroke="rgba(59, 130, 246, 1)"
            strokeWidth="1"
          />
        ))}
        {activePoints.length >= 2 && (
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
        )}
      </g>
    );
  }, [isMeasuring, measurePoints, mousePosition, transformPoint, pixelsPerUnit, currentUnit, selectedTool]);

  useEffect(() => {
    if (currentFile && measurements.length > 0) {
      saveMeasurements(currentFile.name, measurements, pixelsPerUnit, currentUnit, scale);
    }
  }, [currentFile, measurements, pixelsPerUnit, currentUnit, scale, saveMeasurements]);

  useEffect(() => {
    if (currentFile) {
      const fileMetadata = JSON.parse(localStorage.getItem(`fileMetadata_${currentFile.name}`) || '{}');
      if (fileMetadata.measurements) {
        dispatch(setMeasurements(fileMetadata.measurements));
      }
    }
  }, [currentFile, dispatch]);

  useEffect(() => {
    if (selectedTool === 'setScale') {
      setIsMeasuring(false);
      dispatch(clearMeasurePoints());
    }
  }, [selectedTool, dispatch]);

  useEffect(() => {
    console.log('selectedTool changed:', selectedTool);
  }, [selectedTool]);

  return (
    <TooltipProvider>
      <div style={{ position: 'relative', width, height }}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ position: 'absolute', top: 0, left: 0 }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
        >
          {selectedTool !== 'setScale' && renderMeasurements}
          {selectedTool !== 'setScale' && renderActiveMeasurement}
          {selectedTool === 'setScale' && (
            <SetScaleTool
              isOpen={selectedTool === 'setScale'}
              onClose={() => dispatch(setSelectedTool('measure'))}
              pixelsPerUnit={pixelsPerUnit}
              currentUnit={currentUnit}
              updateMeasurements={updateMeasurements}
              width={width}
              height={height}
              measurePoints={measurePoints}
              isSettingScale={isSettingScale}
              setIsSettingScale={setIsSettingScale}
              handleClick={handleClick}
              handleDoubleClick={handleDoubleClick}
              mousePosition={mousePosition}
              handleMouseMove={handleMouseMove}
              handleMouseLeave={handleMouseLeave}
              isMeasuring={isMeasuring}
              scaleType={scaleType}
            />
          )}
        </svg>
      </div>
    </TooltipProvider>
  );
});

export default MeasureTool;
