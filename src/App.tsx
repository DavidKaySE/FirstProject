import { HashRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
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

function ProtectedRoute() {
  const session = useSelector((state: RootState) => state.auth.session);
  return session ? <Outlet /> : <Navigate to="/auth" replace />;
}

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
          element={
            !session ? (
              <Auth />
            ) : (
              <Navigate to="/gallery" replace />
            )
          }
        >
          {/* Lägg till denna subroute för att hantera lösenordsåterställning */}
          <Route path="?mode=resetPassword" element={<Auth />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/canvas" element={<Canvas />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
