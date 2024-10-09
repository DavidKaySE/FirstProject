import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addImage, setCurrentFile, removeImage, setMeasurements, setUnitScale, setCurrentUnit, setScale } from '../store/canvasSlice';
import { AppDispatch } from '../store/store';
import { Measurement } from '../store/canvasSlice';
import { Unit } from '@/lib/utils';

export const useFileManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const uploadFile = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (event.target && typeof event.target.result === 'string') {
          localStorage.setItem(`fileData_${file.name}`, event.target.result);
          localStorage.setItem(`fileType_${file.name}`, file.type);
          dispatch(addImage(file.name));
          console.log(`Fil uppladdad: ${file.name}`);
        } else {
          throw new Error('Ogiltig fildata');
        }
      } catch (err) {
        console.error('Fel vid uppladdning av fil:', err);
        setError('Fel vid uppladdning av fil');
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      console.error('FileReader error:', reader.error);
      setError('Fel vid läsning av fil');
      setIsLoading(false);
    };

    reader.readAsDataURL(file);
  }, [dispatch]);

  const deleteFile = useCallback((fileName: string) => {
    try {
      localStorage.removeItem(`fileData_${fileName}`);
      localStorage.removeItem(`fileType_${fileName}`);
      localStorage.removeItem(`fileMetadata_${fileName}`);
      dispatch(removeImage(fileName));
    } catch (err) {
      console.error('Fel vid borttagning av fil:', err);
      setError('Fel vid borttagning av fil');
    }
  }, [dispatch]);

  const openFile = useCallback((fileName: string) => {
    console.log('openFile called with:', fileName);
    const dataURL = localStorage.getItem(`fileData_${fileName}`);
    const metadataString = localStorage.getItem(`fileMetadata_${fileName}`);
    
    if (dataURL) {
      dispatch(setCurrentFile({ name: fileName, objectURL: dataURL }));
      
      if (metadataString) {
        const metadata = JSON.parse(metadataString);
        dispatch(setMeasurements(metadata.measurements));
        dispatch(setUnitScale(metadata.pixelsPerUnit));
        dispatch(setCurrentUnit(metadata.currentUnit));
        dispatch(setScale(metadata.scale));
      }
    } else {
      setError('Kunde inte öppna filen');
    }
  }, [dispatch]);

  const getAllFiles = useCallback(() => {
    return Object.keys(localStorage)
      .filter(key => key.startsWith('fileData_'))
      .map(key => key.replace('fileData_', ''));
  }, []);

  const handleFileOpen = async (fileName: string) => {
    try {
      const response = await fetch(`/canvas/${fileName}`);
      if (!response.ok) throw new Error('Kunde inte hämta filen');
      
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);

      dispatch(setCurrentFile({ name: fileName, objectURL }));
    } catch (error) {
      setError('Kunde inte öppna filen');
      console.error('Fel vid filöppning:', error);
    }
  };

  const downloadFile = useCallback((fileName: string, dataUrl: string) => {
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError('Kunde inte ladda ner filen');
      console.error('Nedladdningsfel:', error);
    }
  }, []);

  const saveMeasurements = useCallback((fileName: string, measurements: Measurement[], pixelsPerUnit: number, currentUnit: Unit, scale: number) => {
    try {
      const fileMetadata = {
        measurements,
        pixelsPerUnit,
        currentUnit,
        scale
      };
      localStorage.setItem(`fileMetadata_${fileName}`, JSON.stringify(fileMetadata));
      console.log(`Metadata sparad för: ${fileName}`);
      
      dispatch(setMeasurements(measurements));
      dispatch(setUnitScale(pixelsPerUnit));
      dispatch(setCurrentUnit(currentUnit));
      dispatch(setScale(scale));
    } catch (err) {
      console.error('Fel vid sparande av metadata:', err);
      setError('Kunde inte spara metadata');
    }
  }, [dispatch, setError]);

  const saveSingleMeasurement = useCallback((fileName: string, measurement: Measurement, index: number) => {
    try {
      const metadataString = localStorage.getItem(`fileMetadata_${fileName}`);
      if (!metadataString) {
        throw new Error('Ingen metadata hittades för filen');
      }
      const metadata = JSON.parse(metadataString);
      metadata.measurements[index] = measurement;
      localStorage.setItem(`fileMetadata_${fileName}`, JSON.stringify(metadata));
      console.log(`Enskild mätning sparad för: ${fileName}`);
      
      dispatch((dispatch, getState) => {
        const state = getState().canvas;
        const newMeasurements = [...state.measurements];
        newMeasurements[index] = measurement;
        dispatch(setMeasurements(newMeasurements));
      });
    } catch (err) {
      console.error('Fel vid sparande av enskild mätning:', err);
      setError('Kunde inte spara enskild mätning');
    }
  }, [dispatch, setError]);

  return {
    uploadFile,
    downloadFile,
    deleteFile,
    openFile,
    getAllFiles,
    isLoading,
    error,
    setError,
    handleFileOpen,
    saveMeasurements,
    saveSingleMeasurement
  };
};