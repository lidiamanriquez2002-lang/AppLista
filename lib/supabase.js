import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey);

// Fecha local en formato YYYY-MM-DD (zona horaria del dispositivo)
export function hoyISO() {
  return new Date().toLocaleDateString("en-CA");
}
