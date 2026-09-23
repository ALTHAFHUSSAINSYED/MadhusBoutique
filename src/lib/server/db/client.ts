// ==============================================================================
// MADHUS BOUTIQUE: SUPABASE CLIENT FACTORY
// Enforces strict secret isolation between public client and server route handlers
// ==============================================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/../types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Public Supabase Client (Subject to PostgreSQL Row Level Security)
 * Safe to use in public browser components or public SSR pages for reading ACTIVE products.
 */
export function createPublicClient(): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Server-Side Admin / Service Role Supabase Client
 * MUST NEVER BE CALLED FROM CLIENT COMPONENTS.
 * Used exclusively by Vercel Route Handlers to perform verified mutations (order creation, UTR recording, etc.).
 */
export function createServerServiceClient(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error(
      "CRITICAL SECURITY VIOLATION: createServerServiceClient() cannot be executed in the browser context."
    );
  }

  const keyToUse = supabaseServiceRoleKey || supabaseAnonKey;

  return createClient<Database>(supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
