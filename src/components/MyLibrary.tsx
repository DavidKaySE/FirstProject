import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import Canvas from './Canvas';
import Gallery from './Gallery';

const MyLibrary: React.FC = () => {
  const { isOpen } = useSelector((state: RootState) => state.canvas);
  console.log('MyLibrary render, isOpen:', isOpen);

  return (
    <div className="relative">
      <h1 className="text-3xl font-bold mb-6">My Library</h1>
      <Gallery />
      {isOpen && <Canvas />}
    </div>
  );
};

export default MyLibrary;