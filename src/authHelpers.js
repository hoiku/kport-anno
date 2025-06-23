import { supabase } from './supabaseClient.js'

export async function ensureProfileExists(user) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.warn('Failed to fetch profile', error)
    throw error
  }

  if (!data) {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      role: 'viewer'
    })
    if (insertError) {
      console.warn('Failed to insert profile', insertError)
      throw insertError
    }
  }
}

export async function getUserRole(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.warn('Failed to fetch user role', error)
    throw error
  }

  return data ? data.role : null
}
