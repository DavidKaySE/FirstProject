import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from './ui/alert-dialog'
import { useNavigate } from 'react-router-dom'
import { Ruler } from 'lucide-react'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
}

export default function UpdatePassword() {
  console.log('UpdatePassword component rendered')
  const [newPassword, setNewPassword] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const navigate = useNavigate()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setAlertMessage('An error occurred. Please try again later.')
    } else {
      setAlertMessage('Your password has been updated.')
    }
    setShowAlert(true)
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
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Update Password</h2>
            <p className="mt-2 text-sm text-gray-600">Enter your new password below</p>
          </div>
          <form onSubmit={handleUpdatePassword} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <Input
                  type="password"
                  id="new-password"
                  name="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              Update password
            </Button>
          </form>
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

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nice!</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => {
              setShowAlert(false)
              if (alertMessage === 'Your password has been updated.') {
                navigate('/gallery')
              }
            }}>OK</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
