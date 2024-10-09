import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { X, Upload, AlertTriangle, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { en } from '../lib/lang/en';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useFileManager } from '../hooks/useFileManager';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Portal } from '@radix-ui/react-portal';

// Sätt worker path
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const { uploadFile, downloadFile, deleteFile, openFile, getAllFiles } = useFileManager();
  const [images, setImages] = useState<string[]>([]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageCache, setImageCache] = useState<Record<string, string | null>>({});
  const [errorFiles, setErrorFiles] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<string, boolean>>({});
  const [showErrorStates, setShowErrorStates] = useState<Record<string, boolean>>({});
  const [delayedErrorStates, setDelayedErrorStates] = useState<Record<string, boolean>>({});

  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
  }), []);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log(`Dokument laddat, antal sidor: ${numPages}`);
  }, []);

  const loadImage = useCallback((fileName: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setLoadingStates(prev => ({ ...prev, [fileName]: true }));
      setErrorStates(prev => ({ ...prev, [fileName]: false }));
      setShowErrorStates((prev: Record<string, boolean>) => ({ ...prev, [fileName]: false }));

      const dataURL = localStorage.getItem(`fileData_${fileName}`);
      // const fileType = localStorage.getItem(`fileType_${fileName}`);
      
      console.log(`Laddar bild: ${fileName}`);
      console.log(`fileData finns: ${!!dataURL}`);

      if (dataURL) {
        const img = new Image();
        img.onload = () => {
          resolve(dataURL);
          setLoadingStates(prev => ({ ...prev, [fileName]: false }));
        };
        img.onerror = () => {
          console.error(`Kunde inte ladda bild: ${fileName}`);
          setErrorStates(prev => ({ ...prev, [fileName]: true }));
          setLoadingStates(prev => ({ ...prev, [fileName]: false }));
          setTimeout(() => {
            setShowErrorStates((prev: Record<string, boolean>) => ({ ...prev, [fileName]: true }));
          }, 2000);
          resolve(null);
        };
        img.src = dataURL;
      } else {
        console.error(`Ingen fildata hittades för: ${fileName}`);
        setErrorStates(prev => ({ ...prev, [fileName]: true }));
        setLoadingStates(prev => ({ ...prev, [fileName]: false }));
        setTimeout(() => {
          setShowErrorStates((prev: Record<string, boolean>) => ({ ...prev, [fileName]: true }));
        }, 2000);
        resolve(null);
      }
    });
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      const savedFiles = getAllFiles();
      console.log('Saved files:', savedFiles);

      const newImageCache: Record<string, string | null> = {};
      const newErrorFiles: string[] = [];

      for (const fileName of savedFiles) {
        const imageURL = await loadImage(fileName);
        if (imageURL) {
          newImageCache[fileName] = imageURL;
        } else {
          newErrorFiles.push(fileName);
        }
      }

      setImageCache(newImageCache);
      setErrorFiles(newErrorFiles);
      setImages(savedFiles);
    };

    loadImages();
  }, [getAllFiles, loadImage]);

  useEffect(() => {
    const timers: Record<string, NodeJS.Timeout> = {};

    Object.entries(errorStates).forEach(([fileName, isError]) => {
      if (isError && !delayedErrorStates[fileName]) {
        timers[fileName] = setTimeout(() => {
          setDelayedErrorStates(prev => ({ ...prev, [fileName]: true }));
        }, 2000); // 2 sekunders fördröjning
      }
    });

    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [errorStates, delayedErrorStates]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        uploadFile(file);  // Ta bort .then() här eftersom uploadFile inte längre returnerar ett Promise
        // Uppdatera images-listan direkt efter uppladdning
        setImages(prev => [...prev, file.name]);
      });
    }
  }, [uploadFile]);

  const handleDeleteFile = useCallback((fileName: string) => {
    setFileToDelete(fileName);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDeleteFile = useCallback(() => {
    if (fileToDelete) {
      deleteFile(fileToDelete);
      setImages(prev => prev.filter(name => name !== fileToDelete));
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  }, [deleteFile, fileToDelete]);

  const handleOpenCanvas = useCallback((fileName: string) => {
    openFile(fileName);
    navigate('/canvas');
  }, [openFile, navigate]);

  const handleDownload = useCallback((fileName: string) => {
    const fileData = localStorage.getItem(`fileData_${fileName}`);
    if (fileData) {
      downloadFile(fileName, fileData);
    } else {
      console.error(`Ingen data hittades för filen: ${fileName}`);
      // Här kan du lägga till en felhantering, t.ex. visa ett felmeddelande för användaren
    }
  }, [downloadFile]);

  const renderFile = useCallback((dataURL: string, fileName: string ) => {
    if (loadingStates[fileName]) {
      return <div>Laddar...</div>;
    }

    if (errorStates[fileName]) {
      if (delayedErrorStates[fileName]) {
        return <div>Fel vid laddning</div>;
      } else {
        return <div>Laddar...</div>;
      }
    }

    if (fileName.toLowerCase().endsWith('.pdf')) {
      return (
        <Document 
          file={dataURL}
          options={pdfOptions}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <Page 
              pageNumber={1} 
              width={100} 
              height={100} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              scale={5}
            />
          </div>
        </Document>
      );
    } else {
      return <img src={dataURL} alt={fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
    }
  }, [loadingStates, errorStates, delayedErrorStates, pdfOptions, onDocumentLoadSuccess]);

  const renderCard = useCallback((fileName: string, index: number) => {
    const fileData = localStorage.getItem(`fileData_${fileName}`);
    const fileType = localStorage.getItem(`fileType_${fileName}`);

    return (
      <Card 
        key={`${fileName}-${index}`} 
        className="w-full aspect-square overflow-hidden relative shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        onClick={() => handleOpenCanvas(fileName)}
      >
        <CardContent className="p-0 w-full h-full relative">
          {fileData ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              {renderFile(fileData, fileName)}
            </div>
          ) : (
            <div className="w-full h-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <p className="text-red-500 text-center ml-2">Fel vid laddning</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="absolute bottom-0 left-0 right-0 bg-white/70 backdrop-blur-sm p-2">
          <p className="text-sm truncate flex-grow">{fileName}</p>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2 h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(fileName);
                  }}
                >
                  <Download className="h-4 w-4 text-gray-700" />
                </Button>
              </TooltipTrigger>
              <Portal>
                <TooltipContent side="top" align="center" className="z-[9999]">
                  {en.download}
                </TooltipContent>
              </Portal>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2 h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(fileName);
                  }}
                >
                  <X className="h-4 w-4 text-gray-700" />
                </Button>
              </TooltipTrigger>
              <Portal>
                <TooltipContent side="top" align="center" className="z-[9999]">
                  {en.deleteFile}
                </TooltipContent>
              </Portal>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    );
  }, [handleDeleteFile, handleOpenCanvas, handleDownload, renderFile]);

  const renderImage = useCallback((fileName: string) => {
    const objectURL = localStorage.getItem(`objectURL_${fileName}`);
    
    if (!objectURL) {
      console.error(`No objectURL found for file: ${fileName}`);
      return null;
    }

    return (
      <Card key={fileName} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2">
        <CardContent className="p-4">
          <img src={objectURL} alt={fileName} className="w-full h-40 object-cover mb-2" />
          <p className="text-sm font-semibold">{fileName}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Button onClick={() => openFile(fileName)}>{en.open}</Button>
          <Button variant="destructive" onClick={() => handleDeleteFile(fileName)}>{en.delete}</Button>
        </CardFooter>
      </Card>
    );
  }, [openFile, handleDeleteFile]);

  return (
    <div className="container mx-auto px-4 py-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,.pdf"
        className="hidden"
        multiple
      />
      <Button onClick={() => fileInputRef.current?.click()} className="mb-4">
        <Upload className="mr-2 h-4 w-4" /> {en.uploadFiles}
      </Button>
      
      {errorFiles.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-100 rounded-md">
          <p className="text-yellow-700">Varning: Några filer kunde inte laddas:</p>
          <ul className="list-disc list-inside">
            {errorFiles.map((file, index) => (
              <li key={index}>{file}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((fileName, index) => renderCard(fileName, index))}
      </div>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{en.deleteFile}</DialogTitle>
            <DialogDescription>{en.areYouSureDelete}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>{en.cancel}</Button>
            <Button onClick={confirmDeleteFile}>{en.deleteFile}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;