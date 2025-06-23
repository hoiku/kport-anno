import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

// Use a property on globalThis to store the client so that only one
// instance exists across the entire application lifecycle. This prevents
// errors such as "Multiple GoTrueClient instances detected" or
// "AuthSessionMissingError" which can occur when multiple Supabase
// clients are created.
let client = globalThis.__supabaseClient__

if (!client) {
  client = createClient(SUPABASE_URL, SUPABASE_KEY)
  globalThis.__supabaseClient__ = client
}

export const supabase = client
