import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yygsyhrkwilfdaigmroy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5Z3N5aHJrd2lsZmRhaWdtcm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzY5MTAsImV4cCI6MjA5MDUxMjkxMH0.ONfLokngNghTSJR_0Gwc6ntu1jDeEaJZkLtPW168H6c'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Demo user ID
export const DEMO_USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
