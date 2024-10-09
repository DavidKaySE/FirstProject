import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import BackgroundLayer from './BackgroundLayer';
import MeasureTool from './MeasureTool';
import Toolbar from './Toolbar';
import useCanvasDimensions from '../hooks/useCanvasDimensions';
import { closeCanvas } from '../store/canvasSlice';
import { useNavigate, Navigate } from 'react-router-dom';
import { useFileManager } from '../hooks/useFileManager';

const Canvas: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useCanvasDimensions();
  const currentFile = useSelector((state: RootState) => state.canvas.currentFile);
  const navigate = useNavigate();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const { downloadFile } = useFileManager();

  const handleDownload = useCallback(() => {
    if (canvasRef.current && currentFile) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      downloadFile(currentFile.name, dataUrl);
    }
  }, [currentFile, downloadFile]);

  const handleClose = useCallback(() => {
    dispatch(closeCanvas());
    navigate('/gallery');
  }, [dispatch, navigate]);

  useEffect(() => {
    // Sätt isInitialLoad till false omedelbart när komponenten har monterats
    setIsInitialLoad(false);

    // Visa välkomstmeddelandet i 3.5 sekunder
    const timer = setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 11000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (currentFile?.objectURL) {
        URL.revokeObjectURL(currentFile.objectURL);
      }
    };
  }, [currentFile]);

  if (!currentFile) {
    return <Navigate to="/" replace />;
  }

  return (
    <div ref={containerRef} style={{ width: '90vw', height: '90vh', position: 'absolute', top: '5vh', left: '5vw', overflow: 'hidden', zIndex: 100, boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
      <TransformWrapper
        initialScale={1}
        initialPositionX={0}
        initialPositionY={0}
        minScale={0.2}
        maxScale={5}
        centerOnInit={true}
        doubleClick={{ disabled: true }}
        limitToBounds={true}
        disabled={false}
      >
        {({ zoomIn, zoomOut, resetTransform, zoomToElement, state }) => {
          useEffect(() => {
            const handleResize = () => {
              const containerWidth = containerRef.current?.clientWidth || 0;
              const containerHeight = containerRef.current?.clientHeight || 0;
              const scale = Math.min(containerWidth / width, containerHeight / height);
              resetTransform();
              zoomToElement('content', scale, 0);
            };

            window.addEventListener('resize', handleResize);
            handleResize(); // Initial anpassning
            return () => window.removeEventListener('resize', handleResize);
          }, [width, height, resetTransform, zoomToElement, state?.scale]);

          return (
            <>
              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  height: '100%',
                }}
              >
                <div id="content" style={{ position: 'relative', width: `${width}px`, height: `${height}px` }}>
                  <BackgroundLayer
                    width={width}
                    height={height}
                    canvasRef={canvasRef}
                    isInitialLoad={isInitialLoad}
                  />
                  <MeasureTool 
                    width={width}
                    height={height}
                    isInitialLoad={isInitialLoad} 
                    containerRef={containerRef}
                  />
                </div>
              </TransformComponent>
              <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 200 }}>
                <Toolbar 
                  zoomIn={zoomIn}
                  zoomOut={zoomOut}
                  resetTransform={resetTransform}
                  onClose={handleClose}
                  isCanvasJustOpened={isInitialLoad}
                  showWelcomeMessage={showWelcomeMessage}
                />
              </div>
            </>
          );
        }}
      </TransformWrapper>
    </div>
  );
};

export default Canvas;