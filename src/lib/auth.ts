import { supabase } from '@/lib/supabase/client'
import { Router } from 'next/router'

export interface SignUpData {
  email: string
  password: string
  name: string
  company: string
}

export interface AuthError {
  message: string
  code?: string
}

export async function signUp({ email, password, name, company }: SignUpData) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
          company: company.trim(),
        }
      }
    })

    if (error) {
      return { 
        success: false, 
        error: mapAuthError(error) 
      }
    }

    return { 
      success: true, 
      data 
    }
  } catch (error) {
    return { 
      success: false, 
      error: { message: 'An unexpected error occurred. Please try again.' } 
    }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { 
        success: false, 
        error: mapAuthError(error) 
      }
    }

    return { 
      success: true, 
      data 
    }
  } catch (error) {
    return { 
      success: false, 
      error: { message: 'An unexpected error occurred. Please try again.' } 
    }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { 
        success: false, 
        error: mapAuthError(error) 
      }
    }

    return { 
      success: true 
    }
  } catch (error) {
    return { 
      success: false, 
      error: { message: 'An unexpected error occurred. Please try again.' } 
    }
  }
}

function mapAuthError(error: any): AuthError {
  const message = error.message.toLowerCase()
  
  if (message.includes('already registered') || message.includes('user already registered')) {
    return { message: 'An account with this email already exists' }
  }
  
  if (message.includes('weak password') || message.includes('password should be')) {
    return { message: 'Password is too weak' }
  }
  
  if (message.includes('invalid email') || message.includes('email is invalid')) {
    return { message: 'Invalid email address' }
  }
  
  if (message.includes('invalid credentials') || message.includes('invalid login credentials')) {
    return { message: 'Invalid email or password' }
  }
  
  if (message.includes('email not confirmed')) {
    return { message: 'Please check your email and verify your account' }
  }
  
  return { message: error.message || 'An error occurred during authentication' }
}
