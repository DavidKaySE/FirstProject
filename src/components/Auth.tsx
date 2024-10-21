import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Ruler, Mail } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setSession, setUser } from '../store/authSlice'
import { RootState } from '../store/store'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
}

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('login')
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  console.log('Component rendered. Current activeTab:', activeTab)

  const parseQueryParams = () => {
    const searchParams = new URLSearchParams(location.search)
    const mode = searchParams.get('mode')
    const token = searchParams.get('access_token')
    console.log('Parsed query params:', { mode, token })
    return { mode, token }
  }

  useEffect(() => {
    console.log('useEffect triggered. Location search:', location.search)
    const { mode, token } = parseQueryParams()

    console.log('Setting activeTab based on mode:', mode)
    if (mode === 'resetPassword') {
      setActiveTab('resetPassword')
      if (token) {
        setResetToken(token)
      }
    } else {
      setActiveTab('login')
    }
  }, [location.search])

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setActiveTab('resetPassword')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Lägg till denna useEffect
  useEffect(() => {
    console.log('activeTab changed:', activeTab)
  }, [activeTab])

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
      return false
    }
    setPasswordError(null)
    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        dispatch(setSession(data.session))
        dispatch(setUser(data.user))
        navigate('/gallery')
      }
    } catch (error) {
      console.error('Error logging in:', error)
      setError('Login error. Check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (!validatePassword(password)) {
      setLoading(false)
      return
    }

    try {
      console.log('Attempting to sign up user:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      console.log('Sign up successful:', data)
      alert('Check your email for the verification link!')
      setActiveTab('login')
    } catch (error) {
      console.error('Detailed error during sign up:', error)
      if (error instanceof Error) {
        setError(`Sign up error: ${error.message}`)
      } else {
        setError('An unexpected error occurred during sign up')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/auth?mode=resetPassword`,
      })
      if (error) throw error
      alert('Check your email for the reset link!')
      setActiveTab('login')
    } catch (error) {
      console.error('Error resetting password:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred while resetting password')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })
      if (error) throw error
    } catch (error) {
      console.error('Google login error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred during Google login')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!validatePassword(newPassword)) {
      setLoading(false)
      return
    }

    try {
      if (!resetToken) {
        throw new Error('No valid reset token found')
      }
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      })
      if (error) throw error
      alert('Password updated successfully!')
      setActiveTab('login')
    } catch (error) {
      console.error('Error resetting password:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred while resetting password')
    } finally {
      setLoading(false)
    }
  }

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="login">
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back!</h2>
                <p className="mt-2 text-sm text-gray-600">Log in to continue to your account</p>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <Input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                      placeholder="E-postadress"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                      placeholder="Lösenord"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div>
                  <Button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    disabled={loading}
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-rose-500 group-hover:text-rose-400" aria-hidden="true" />
                    </span>
                    {loading ? 'Processing...' : 'Log in'}
                  </Button>
                </div>
              </form>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or continue with</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    disabled={loading}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Google
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-right">
                <button
                  onClick={() => setActiveTab('forgotPassword')}
                  className="text-sm text-rose-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setActiveTab('register')}
                    className="text-rose-600 hover:underline"
                  >
                    Register
                  </button>
                </p>
              </div>
            </TabsContent>
            <TabsContent value="forgotPassword">
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-bold text-gray-900">Forgot Password</h2>
                <p className="mt-2 text-sm text-gray-600">Enter your email to reset your password</p>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <Input
                      id="reset-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div>
                  <Button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    disabled={loading}
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-rose-500 group-hover:text-rose-400" aria-hidden="true" />
                    </span>
                    {loading ? 'Processing...' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-bold text-gray-900">Create an account</h2>
                <p className="mt-2 text-sm text-gray-600">Sign up to get started</p>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-rose-500  focus:border-rose-500 focus:z-10 sm:text-sm"
                      placeholder="E-postadress"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                      placeholder="Lösenord"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        validatePassword(e.target.value)
                      }}
                    />
                    {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div>
                  <Button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    disabled={loading}
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-rose-500 group-hover:text-rose-400" aria-hidden="true" />
                    </span>
                    {loading ? 'Processing...' : 'Sign Up'}
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="resetPassword">
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset Password</h2>
                <p className="mt-2 text-sm text-gray-600">Enter your new password</p>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <Input
                      id="new-password"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        validatePassword(e.target.value)
                      }}
                    />
                    {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div>
                  <Button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
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
