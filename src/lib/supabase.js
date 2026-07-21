import { createClient } from "@supabase/supabase-js";

// 1. Go to https://supabase.com -> New project (free)
// 2. Project Settings -> API -> copy "Project URL" and "anon public" key below
// 3. Authentication -> Providers -> Email -> turn OFF "Confirm email"
//    (without this, new accounts won't have an active session until they click
//    an email link, and team/profile creation right after signup will fail)
const supabaseUrl = "https://uxlwviqmahoekfrltlhd.supabase.co";
const supabaseAnonKey = "sb_publishable_XIXi2djliy6vEXT3fSJBrw_N8UjPw_L";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
