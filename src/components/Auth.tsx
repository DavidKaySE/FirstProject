import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setSession, setUser } from '../store/authSlice'
import { Ruler } from 'lucide-react'
import CustomAuthUI from './CustomAuthUI'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
}

export default function AuthComponent() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  const handleAuthStateChange = useCallback((event: string, session: any) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      dispatch(setSession(session))
      dispatch(setUser(session?.user ?? null))
      navigate('/gallery')
    }
  }, [dispatch, navigate])

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [handleAuthStateChange])

  useEffect(() => {
    if (location.pathname === '/auth/callback') {
      const hashParams = new URLSearchParams(window.location.hash.slice(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      if (type === 'recovery') {
        // Detta är en lösenordsåterställning
        navigate('/update-password')
      } else if (accessToken && refreshToken) {
        // Normal inloggning/registrering
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ data, error }) => {
          if (error) {
            console.error('Error setting session:', error)
          } else if (data.session) {
            handleAuthStateChange('SIGNED_IN', data.session)
          }
        })
      }
    }
  }, [location, handleAuthStateChange, navigate])

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-rose-50 via-white to-rose-100">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <a className="flex items-center justify-center" href="#">
          <Ruler className="h-6 w-6 mr-2 text-rose-500" />
          <span className="font-bold text-rose-500">Measure.app</span>
        </a>
      </header>
      <main className="flex-1 flex items-center justify-center w-full">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-2xl"
        >
          <CustomAuthUI
            redirectTo={`${window.location.origin}/Measure.app/#/auth/callback`}
          />
        </motion.div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2024 Measure.app. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Terms of service
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Privacy policy
          </a>
        </nav>
      </footer>
    </div>
  )
}
