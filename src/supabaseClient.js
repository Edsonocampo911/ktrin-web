import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pniyahsdumnmhxnctlod.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuaXlhaHNkdW1ubWh4bmN0bG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzY2MTIsImV4cCI6MjA2NzYxMjYxMn0.xkFTngSzU2lqrZSVxGV0rCDFhLZHmzx9bYMAyneLEmE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


