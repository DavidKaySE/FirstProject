import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const useCanvasDimensions = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const currentFile = useSelector((state: RootState) => state.canvas.currentFile);

  useEffect(() => {
    const updateDimensions = () => {
      if (currentFile && currentFile.objectURL) {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const maxWidth = window.innerWidth * 0.9;
          const maxHeight = window.innerHeight * 0.9;

          let width, height;
          if (img.width > maxWidth || img.height > maxHeight) {
            if (maxWidth / aspectRatio <= maxHeight) {
              width = maxWidth;
              height = maxWidth / aspectRatio;
            } else {
              height = maxHeight;
              width = maxHeight * aspectRatio;
            }
          } else {
            width = img.width;
            height = img.height;
          }

          setDimensions({ width, height });
        };
        img.src = currentFile.objectURL;
      } else {
        // Fallback till viewport-baserade dimensioner om ingen fil är laddad
        const width = window.innerWidth * 0.9;
        const height = window.innerHeight * 0.9;
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [currentFile]);

  return dimensions;
};

export default useCanvasDimensions;