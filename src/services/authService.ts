import { supabase } from '../supabase'
import { logError } from '../utils/logError'

export async function signIn(email: string, password: string) {
  const result = await supabase.auth.signInWithPassword({ email, password })
  if (result.error) logError('signIn', result.error)
  return result
}

export async function signUp(email: string, password: string) {
  const result = await supabase.auth.signUp({ email, password })
  if (result.error) logError('signUp', result.error)
  return result
}
