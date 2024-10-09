import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setSelectedTool, undo, redo, setShowAllMeasurements, setUnitScale, setCurrentUnit, setScale, closeCanvas, resetHistory, updateMeasurementsUnit, setScaleType } from '../store/canvasSlice';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Ruler, Undo, Redo, ZoomIn, ZoomOut, RotateCcw, Save, X, Download, Eye, ChevronDown, EyeOff, Rocket, AlertCircle } from 'lucide-react';
import { en } from '../lib/lang/en';
import { cn } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { useControls } from 'react-zoom-pan-pinch';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Unit, units } from '../lib/utils';
import { Portal } from '@radix-ui/react-portal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFileManager } from '../hooks/useFileManager';

interface ToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
  onDownload: (fileName: string) => void;
  onClose?: () => void;
  isCanvasJustOpened: boolean;
  currentFileName: string | null;
  onExport: () => void;
  showWelcomeMessage: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onDownload,
  currentFileName,
  onExport,
  showWelcomeMessage,
}) => {
  const navigate = useNavigate();
  const { zoomIn, zoomOut, resetTransform } = useControls();
  const dispatch = useDispatch();
  const selectedTool = useSelector((state: RootState) => state.canvas.selectedTool);
  const historyIndex = useSelector((state: RootState) => state.canvas.historyIndex);
  const historyLength = useSelector((state: RootState) => state.canvas.history.length);
  const showAllMeasurements = useSelector((state: RootState) => state.canvas.showAllMeasurements);
  const pixelsPerUnit = useSelector((state: RootState) => state.canvas.pixelsPerUnit);
  const currentUnit = useSelector((state: RootState) => state.canvas.currentUnit);
  const currentScale = useSelector((state: RootState) => state.canvas.scale);
  const measurements = useSelector((state: RootState) => state.canvas.measurements);
  const { setError, saveMeasurements, openFile } = useFileManager();
  const scaleType = useSelector((state: RootState) => state.canvas.scaleType);

  const [scale, setLocalScale] = useState(100);
  const [unit, setLocalUnit] = useState('px');
  const [isEditingScale, setIsEditingScale] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWelcomeAlertVisible, setIsWelcomeAlertVisible] = useState(false);
  const [isWelcomeTipVisible, setIsWelcomeTipVisible] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  const currentFile = useSelector((state: RootState) => state.canvas.currentFile);

  useEffect(() => {
    if (showWelcomeMessage) {
      setIsWelcomeAlertVisible(true);
      setIsWelcomeTipVisible(true);
      
      const welcomeMessageTimer = setTimeout(() => {
        setIsWelcomeAlertVisible(false);
      }, 4000);
      
      const welcomeTipTimer = setTimeout(() => {
        setIsWelcomeTipVisible(false);
      }, 10000);

      return () => {
        clearTimeout(welcomeMessageTimer);
        clearTimeout(welcomeTipTimer);
      };
    }
  }, [showWelcomeMessage]);

  useEffect(() => {
    setLocalScale(currentScale !== undefined ? currentScale : 100);
    setLocalUnit(currentUnit || 'px');
  }, [currentScale, currentUnit]);

  useEffect(() => {
    if (isDropdownOpen) {
      setLocalScale(currentScale);
    }
  }, [isDropdownOpen, currentScale]);

  const handleScaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(event.target.value);
    if (!isNaN(newScale) && newScale > 0) {
      setLocalScale(newScale);
      const newPixelsPerUnit = 100 / newScale;
      dispatch(setScale(newScale));
      dispatch(setUnitScale(newPixelsPerUnit));
    }
  };

  const handleScaleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const step = 0.01;
      const newScale = event.key === 'ArrowUp' 
        ? scale + step 
        : Math.max(0.01, scale - step);
      setLocalScale(newScale);
      dispatch(setScale(newScale));
      dispatch(setUnitScale(100 / newScale));
    }
  };

  const handleUnitChange = (newUnit: Unit) => {
    setLocalUnit(newUnit);
    dispatch(updateMeasurementsUnit(newUnit));
  };

  const handleResetScale = () => {
    const defaultScale = 100;
    const defaultUnit = 'cm';
    setLocalScale(defaultScale);
    setLocalUnit(defaultUnit);
    dispatch(setUnitScale(1));
    dispatch(setCurrentUnit(defaultUnit));
  };

  const formatButtonText = (value: number) => {
    return value === 100 && unit === 'px' ? '100' : value.toFixed(2);
  };

  const formatInputValue = (value: number) => {
    if (isEditingScale) return value.toString();
    const [intPart, decimalPart] = value.toFixed(2).split('.');
    return `${intPart}.${decimalPart}${value.toString().split('.')[1]?.length > 2 ? '..' : ''}`;
  };

  const scaleText = `100px = ${formatButtonText(scale)}${unit}`;

    const handleToolSelect = (tool: string) => {
    if (tool !== 'showAll') {
      dispatch(setSelectedTool(tool));
    }
  };

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleRedo = () => {
    dispatch(redo());
  };

  const handleClose = useCallback(() => {
    if (currentFile) {
      // Spara metadata innan vi stänger
      saveMeasurements(currentFile.name, measurements, pixelsPerUnit, currentUnit, currentScale);
    }
    dispatch(resetHistory()); // Lägg till denna rad
    dispatch(closeCanvas());
    navigate('/');
  }, [dispatch, navigate, currentFile, measurements, pixelsPerUnit, currentUnit, currentScale, saveMeasurements]);

  const handleShowAllToggle = () => {
    dispatch(setShowAllMeasurements(!showAllMeasurements));
  };

  const handleSetScale = (type: 'distance' | 'area') => {
    dispatch(setSelectedTool('setScale'));
    dispatch(setScaleType(type));
    setIsDropdownOpen(false);
  };

  const handleDownload = () => {
    if (currentFileName) {
      onDownload(currentFileName);
    } else {
      console.error('Inget filnamn tillgängligt för nedladdning');
      // Här kan du lägga till en felhantering, t.ex. visa ett felmeddelande för användaren
    }
  };

  const handleSave = () => {
    if (currentFileName) {
      saveMeasurements(currentFileName, measurements, pixelsPerUnit, currentUnit, currentScale);
      setShowSaveAlert(true);
      setTimeout(() => setShowSaveAlert(false), 3000);
    } else {
      setError('Ingen fil är öppen för att spara');
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Kontrollera om Ctrl (Windows) eller Cmd (Mac) är nedtryckt
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;

    if (isCtrlOrCmd && event.key === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        // Ctrl+Shift+Z eller Cmd+Shift+Z för Redo
        handleRedo();
      } else {
        // Ctrl+Z eller Cmd+Z för Undo
        handleUndo();
      }
    } else if (isCtrlOrCmd && event.key === 'y') {
      // Ctrl+Y för Redo (främst för Windows)
      event.preventDefault();
      handleRedo();
    }
  }, [handleUndo, handleRedo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative">
        <div className="bg-white p-2 rounded-t-lg shadow-md flex items-center space-x-2 overflow-x-auto rounded-lg">
          <ToggleGroup 
            type="multiple" 
            value={[selectedTool, ...(showAllMeasurements ? ['showAll'] : [])]}
            onValueChange={(value) => {
              if (value.includes('showAll')) {
                handleShowAllToggle();
              } else {
                handleToolSelect(value[0]);
              }
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem 
                  value="measure" 
                  aria-label={en.measure} 
                  className="h-10 w-10 p-0"
                  data-state={selectedTool === 'measure' ? 'on' : 'off'}
                >
                  <Ruler className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <Portal>
                <TooltipContent side="top" align="center" className="z-[9999]">
                  {en.measure}
                </TooltipContent>
              </Portal>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleUndo} 
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 p-0"
                  disabled={historyIndex <= 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <Portal>
                <TooltipContent side="top" align="center" className="z-[9999]">
                  {en.undo}
                </TooltipContent>
              </Portal>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleRedo} 
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 p-0"
                  disabled={historyIndex >= historyLength - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <Portal>
                <TooltipContent side="top" align="center" className="z-[9999]">
                  {en.redo}
                </TooltipContent>
              </Portal>
            </Tooltip>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => zoomIn()} 
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 p-0"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <Portal>
                <TooltipContent side="top" align="center" className="z-[9999]">
                  {en.zoomIn}
                </TooltipContent>
              </Portal>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => zoomOut()} 
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 p-0"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <Portal>
                <TooltipContent side="top" align="center" className="z-[9999]">
                  {en.zoomOut}
                </TooltipContent>
              </Portal>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => resetTransform()} 
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <Portal>
                <TooltipContent side="top" align="center" className="z-[9999]">
                  {en.resetView}
                </TooltipContent>
              </Portal>
            </Tooltip>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center h-10">
                  {scaleText} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-auto p-2 z-[9999]">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <span>100px =</span>
                    <Input
                      type="number"
                      value={formatInputValue(scale)}
                      onChange={handleScaleChange}
                      onKeyDown={handleScaleKeyDown}
                      onFocus={() => setIsEditingScale(true)}
                      onBlur={() => {
                        setIsEditingScale(false);
                        dispatch(setScale(scale));
                        dispatch(setUnitScale(100 / scale));
                      }}
                      className="w-20"
                      step="0.01"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">{unit}</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-auto p-2 z-[9999]">
                        {units.map((unit) => (
                          <DropdownMenuItem key={unit} onSelect={() => handleUnitChange(unit)}>
                            {unit}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button onClick={() => handleSetScale('distance')} className="flex-1">
                      Set Scale (Distance)
                    </Button>
                    <Button onClick={() => handleSetScale('area')} className="flex-1">
                      Set Scale (Area)
                    </Button>
                    <Button onClick={handleResetScale} variant="outline" className="flex-1">
                      Reset
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem 
                  value="showAll" 
                  aria-label={en.showAll} 
                  className={cn("h-10 w-10 p-0", 
                                        showAllMeasurements && "bg-purple-700")}
                  data-state={showAllMeasurements ? 'on' : 'off'}
                  onClick={handleShowAllToggle}
                >
                  {showAllMeasurements ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </ToggleGroupItem>
              </TooltipTrigger>
              <Portal>
                <TooltipContent side="top" align="center" className="z-[9999]">
                  {en.showAll}
                </TooltipContent>
              </Portal>
            </Tooltip>
          </ToggleGroup>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleSave} 
                variant="outline"
                size="icon"
                className="h-10 w-10 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <Portal>
              <TooltipContent side="top" align="center" className="z-[9999]">
                {en.save}
              </TooltipContent>
            </Portal>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={onExport} 
                variant="outline"
                size="icon"
                className="h-10 w-10 p-0"
                disabled={!currentFileName}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <Portal>
              <TooltipContent side="top" align="center" className="z-[9999]">
                {en.export}
              </TooltipContent>
            </Portal>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleClose} 
                variant="outline"
                size="icon"
                className="h-10 w-10 p-0 bg-rose-500 text-white hover:bg-rose-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <Portal>
              <TooltipContent side="top" align="center" className="z-[9999]">
                {en.close}
              </TooltipContent>
            </Portal>
          </Tooltip>
        </div>
        {selectedTool === 'setScale' && !isDropdownOpen && scaleType === 'distance' && (
          <Alert
            className="absolute top-full left-0 mt-2 w-96 bg-black/80 text-white shadow-lg"
          >
            <Rocket className="h-4 w-4 stroke-white" />
            <AlertDescription>
              {en.setScaleDistanceInstructions}
            </AlertDescription>
          </Alert>
        )}
        {selectedTool === 'setScale' && !isDropdownOpen && scaleType === 'area' && (
          <Alert
            className="absolute top-full left-0 mt-2 w-96 bg-black/80 text-white shadow-lg"
          >
            <Rocket className="h-4 w-4 stroke-white" />
            <AlertDescription>
              {en.setScaleAreaInstructions}
            </AlertDescription>
          </Alert>
        )}
        {showWelcomeMessage && (
          <>
            <Alert
              className={cn(
                "absolute top-full left-0 mt-2 w-96 bg-rose-500 text-white shadow-lg transition-opacity duration-500",
                isWelcomeAlertVisible ? "opacity-100" : "opacity-0"
              )}
            >
              <Rocket className="h-4 w-4 stroke-white" />
              <AlertDescription>
                <p><b>{en.welcomeTitle}</b></p> 
                <p>{en.welcomeMessage}</p>
              </AlertDescription>
            </Alert>
            <Alert
              className={cn(
                "absolute top-full left-0 mt-28 w-96 bg-rose-500 text-white shadow-lg transition-opacity duration-500",
                isWelcomeTipVisible ? "opacity-100" : "opacity-0"
              )}
            >
              <Rocket className="h-4 w-4 stroke-white" />
              <AlertDescription>
                <p><b>{en.WelcomeTip1}</b></p>
                <p>{en.WelcomeTip1_1}</p>
                <p>{en.WelcomeTip1_2}</p>
                <p>{en.WelcomeTip1_3}</p>
              </AlertDescription>
            </Alert>
          </>
        )}
        {showSaveAlert && (
          <Alert
            className="absolute top-full left-0 mt-2 w-96 bg-green-500 text-white shadow-lg transition-opacity duration-500"
          >
            <AlertCircle className="h-4 w-4 stroke-white" />
            <AlertDescription>
              {en.fileSaved}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </TooltipProvider>
  );
};

export default Toolbar;