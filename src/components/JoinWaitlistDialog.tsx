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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join the waitlist for the Pro version</DialogTitle>
          <DialogDescription>
            Enter your details to be notified when the Pro version launches.
          </DialogDescription>
        </DialogHeader>
        {isSuccess ? (
          <p className="text-green-600">Thank you for registering! We'll be in touch soon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default JoinWaitlistDialog
