import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://chqtredxlmteahfsstil.supabase.co'
const supabaseAnonKey = 'sb_publishable_ZtU0Um8ko9F2bu8lJQpTfw_Qctesu3N'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)