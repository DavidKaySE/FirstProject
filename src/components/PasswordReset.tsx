import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from './ui/alert-dialog'

export default function PasswordReset() {
  const [email, setEmail] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/update-password?type=recovery`,
    })

    if (error) {
      setAlertMessage('An error occurred. Please try again later.')
    } else {
      setAlertMessage('Check your email for the reset link.')
    }
    setShowAlert(true)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100 p-4">
      <form onSubmit={handleResetPassword} className="w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-rose-600">Reset password</h2>
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white">
          Send reset link
        </Button>
      </form>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nice!</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowAlert(false)}>OK</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
