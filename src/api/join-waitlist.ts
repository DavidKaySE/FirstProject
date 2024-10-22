import { supabase } from '@/lib/supabase'

export async function joinWaitlist(firstName: string, lastName: string, email: string) {
  if (!firstName || !lastName || !email) {
    throw new Error('All fields are required')
  }

  try {
    const { error } = await supabase
      .from('waitlist')
      .insert([{ first_name: firstName, last_name: lastName, email: email }])

    if (error) {
      if (error.code === '23505') { // Unikt constraint-fel
        throw new Error('This email is already registered')
      }
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Waitlist joined successfully')
    return { message: 'Successfully registered' }
  } catch (error) {
    console.error('Error adding to waitlist:', error)
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unable to register, please try again later')
  }
}
