import React from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { Input } from './ui/input'

interface CustomAuthUIProps {
  redirectTo: string
}

const CustomAuthUI: React.FC<CustomAuthUIProps> = ({ redirectTo }) => {
  return (
    <Auth
      supabaseClient={supabase}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand: 'rgb(244 63 94)', // rose-500
              brandAccent: 'rgb(225 29 72)', // rose-600
            },
          },
        },
        extend: true,
        className: {
          input: Input.defaultProps?.className,
          button: 'w-full py-2 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500',
          anchor: 'text-rose-600 hover:text-rose-700',
        },
      }}
      providers={[]}  // Tom array för att bara visa email/lösenord
      redirectTo={redirectTo}
      localization={{
        variables: {
          sign_up: {
            email_label: 'Email address',
            password_label: 'Password',
            button_label: 'Sign up'
          },
          sign_in: {
            email_label: 'Email address',
            password_label: 'Password',
            button_label: 'Sign in'
          },
        },
      }}
    />
  )
}

export default CustomAuthUI
