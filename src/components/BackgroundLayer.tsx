import React, { useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useFileManager } from '../hooks/useFileManager';
import { Document, Page } from 'react-pdf';

interface BackgroundLayerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  width: number;
  height: number;
  isInitialLoad: boolean;
}

const BackgroundLayer: React.FC<BackgroundLayerProps> = React.memo(({ width, height }) => {
  const currentFile = useSelector((state: RootState) => state.canvas.currentFile);
  const { error, setError } = useFileManager();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    console.log('BackgroundLayer: Image loaded', img.naturalWidth, img.naturalHeight);
  }, []);

  useEffect(() => {
    console.log('BackgroundLayer: useEffect running', { currentFile, width, height });
    if (!currentFile) {
      console.log('BackgroundLayer: Missing currentFile');
      return;
    }

    const dataURL = localStorage.getItem(`fileData_${currentFile.name}`);
    console.log('BackgroundLayer: dataURL found', !!dataURL, 'for file:', currentFile.name);
    if (dataURL) {
      console.log('BackgroundLayer: dataURL starts with', dataURL.substring(0, 50));
      console.log('BackgroundLayer: dataURL MIME type:', dataURL.split(',')[0]);
    } else {
      console.error('BackgroundLayer: No dataURL found for file:', currentFile.name);
      setError('Kunde inte hitta bilddata för filen');
    }
  }, [currentFile, width, height, setError]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!currentFile) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width, 
        height, 
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {currentFile.name.toLowerCase().endsWith('.pdf') ? (
        <Document file={currentFile.objectURL}>
          <Page 
            pageNumber={1} 
            width={width} 
            height={height}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      ) : (
        <img
          src={currentFile.objectURL}
          alt={currentFile.name}
          onLoad={handleImageLoad}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      )}
    </div>
  );
});

export default BackgroundLayer;