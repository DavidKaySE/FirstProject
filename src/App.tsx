import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Gallery from './components/Gallery';
import Canvas from './components/Canvas';
import LandingPage from './components/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/canvas" element={<Canvas />} />
      </Routes>
    </Router>
  );
}

export default App;
