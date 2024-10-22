import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from './ui/alert-dialog'
import { useNavigate } from 'react-router-dom'

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100 p-4">
      <form onSubmit={handleUpdatePassword} className="w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-rose-600">Update password</h2>
        <Input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white">
          Update password
        </Button>
      </form>

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
