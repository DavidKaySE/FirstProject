import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Gallery from './components/Gallery';
import Canvas from './components/Canvas';
import LandingPage from './components/LandingPage';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSession } from './store/authSlice';
import { RootState } from './store/store';

function App() {
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.auth.session);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route
          path="/auth"
          element={!session ? <Auth /> : <Navigate to="/gallery" replace />}
        />
        <Route
          path="/gallery"
          element={session ? <Gallery /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/canvas"
          element={session ? <Canvas /> : <Navigate to="/auth" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
