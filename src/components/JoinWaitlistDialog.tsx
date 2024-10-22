import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { joinWaitlist } from '@/api/join-waitlist'

const JoinWaitlistDialog: React.FC = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await joinWaitlist(firstName, lastName, email)
      setIsSuccess(true)
    } catch (error) {
      console.error('Error during registration:', error)
      if (error instanceof Error) {
        if (error.message === 'This email is already registered') {
          alert('This email is already registered. Please use a different email.')
        } else {
          alert('Unable to register at this time. Please try again later.')
        }
      } else {
        alert('An unexpected error occurred. Please try again later.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Join Waitlist</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-rose-500 mb-2">Join the waitlist for the Pro version</DialogTitle>
          <DialogDescription className="text-gray-600 mb-6">
            Enter your details to be notified when the Pro version launches.
          </DialogDescription>
        </DialogHeader>
        {isSuccess ? (
          <p className="text-green-600 text-center py-4">Thank you for registering! We'll be in touch soon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full py-2 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full py-2 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-2 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-md text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 bg-rose-500 hover:bg-rose-600"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default JoinWaitlistDialog
