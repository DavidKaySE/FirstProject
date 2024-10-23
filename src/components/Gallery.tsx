import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { X, AlertTriangle, Download, Ruler, FileImage } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { en } from '../lib/lang/en';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useFileManager } from '../hooks/useFileManager';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Portal } from '@radix-ui/react-portal';
import { useDropzone } from 'react-dropzone';
import { logout } from '../store/authSlice';
import { supabase } from '../lib/supabase';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.auth.session);
  const { uploadFile, downloadFile, deleteFile, openFile, getAllFiles } = useFileManager();
  const [images, setImages] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [imageCache, setImageCache] = useState<Record<string, string | null>>({});
  const [errorFiles, setErrorFiles] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<string, boolean>>({});
  const [showErrorStates, setShowErrorStates] = useState<Record<string, boolean>>({});
  const [delayedErrorStates, setDelayedErrorStates] = useState<Record<string, boolean>>({});
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [hasCheckedReset, setHasCheckedReset] = useState(false);

  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
  }), []);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log(`Document loaded, number of pages: ${numPages}`);
  }, []);

  const loadImage = useCallback((fileName: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setLoadingStates(prev => ({ ...prev, [fileName]: true }));
      setErrorStates(prev => ({ ...prev, [fileName]: false }));
      setShowErrorStates((prev: Record<string, boolean>) => ({ ...prev, [fileName]: false }));

      const dataURL = localStorage.getItem(`fileData_${fileName}`);
      
      console.log(`Loading image: ${fileName}`);
      console.log(`fileData exists: ${!!dataURL}`);

      if (dataURL) {
        const img = new Image();
        img.onload = () => {
          resolve(dataURL);
          setLoadingStates(prev => ({ ...prev, [fileName]: false }));
        };
        img.onerror = () => {
          console.error(`Could not load image: ${fileName}`);
          setErrorStates(prev => ({ ...prev, [fileName]: true }));
          setLoadingStates(prev => ({ ...prev, [fileName]: false }));
          setTimeout(() => {
            setShowErrorStates((prev: Record<string, boolean>) => ({ ...prev, [fileName]: true }));
          }, 2000);
          resolve(null);
        };
        img.src = dataURL;
      } else {
        console.error(`No file data found for: ${fileName}`);
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
        }, 2000);
      }
    });

    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [errorStates, delayedErrorStates]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      uploadFile(file);
      setImages(prev => [...prev, file.name]);
    });
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': []
    }
  });

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
      console.error(`No data found for the file: ${fileName}`);
    }
  }, [downloadFile]);

  const renderFile = useCallback((dataURL: string, fileName: string) => {
    if (loadingStates[fileName]) {
      return <div>Loading...</div>;
    }

    if (errorStates[fileName]) {
      if (delayedErrorStates[fileName]) {
        return <div>Error loading</div>;
      } else {
        return <div>Loading...</div>;
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
      <div key={`${fileName}-${index}`} className="relative">
        <Card 
          className="w-full aspect-square overflow-hidden cursor-pointer bg-white border border-gray-200"
          onClick={() => handleOpenCanvas(fileName)}
        >
          <CardContent className="p-0 w-full h-full relative">
            {fileData ? (
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                {renderFile(fileData, fileName)}
              </div>
            ) : (
              <div className="w-full h-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <p className="text-red-500 text-center ml-2">Error loading file</p>
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
                    className="ml-2 aspect-square w-8"
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
                    className="ml-2 aspect-square w-8"
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
      </div>
    );
  }, [handleOpenCanvas, renderFile]);

  useEffect(() => {
    if (!session) {
      navigate('/auth', { replace: true });
    }
  }, [session, navigate]);

  useEffect(() => {
    if (session && !hasCheckedReset) {
      const urlParams = new URLSearchParams(location.search);
      if (urlParams.get('passwordReset') === 'true') {
        setShowResetAlert(true);
        navigate('/gallery', { replace: true });
      }
      setHasCheckedReset(true);
    }
  }, [session, location, navigate, hasCheckedReset]);

  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      dispatch(logout()); // Update Redux state
      navigate('/', { replace: true });
    }
  }, [dispatch, navigate]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-rose-50 via-white to-rose-100">
      {session && (
        <>
          <header className="px-4 lg:px-6 h-14 flex items-center justify-between backdrop-blur-md bg-white/30 fixed w-full z-50">
            <a className="flex items-center justify-center" href="#">
              <Ruler className="h-6 w-6 mr-2 text-rose-500" />
              <span className="font-bold text-rose-500">Measure.app Gallery</span>
            </a>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-rose-500 hover:text-rose-700"
            >
              Log out
            </Button>
          </header>
          <main className="flex-1 w-full pt-14">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <motion.div
                initial="initial"
                animate="animate"
                variants={stagger}
                className="space-y-8"
              >
                <motion.h1 variants={fadeIn} className="text-4xl font-bold tracking-tighter text-center text-rose-500">
                  File Gallery
                </motion.h1>
                <motion.div variants={fadeIn} className="max-w-xl mx-auto">
                  <div
                    {...getRootProps()}
                    className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-rose-500 bg-rose-50' : 'border-gray-300 hover:border-rose-500'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Drag and drop some files here, or click to select files
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      (Only images and PDF files will be accepted)
                    </p>
                  </div>
                </motion.div>
                
                {errorFiles.length > 0 && (
                  <motion.div variants={fadeIn} className="mt-4 p-4 bg-yellow-100 rounded-md">
                    <p className="text-yellow-700">Warning: Some files could not be loaded:</p>
                    <ul className="list-disc list-inside">
                      {errorFiles.map((file, index) => (
                        <li key={index}>{file}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {images.map((fileName, index) => renderCard(fileName, index))}
                </motion.div>
              </motion.div>
            </div>
          </main>

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

          <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
            <p className="text-xs text-gray-500">© 2024 Measure.app. All rights reserved.</p>
          </footer>
        </>
      )}
    </div>
  );
};

export default Gallery;
