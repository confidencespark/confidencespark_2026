/**
 * Supabase Client
 *
 * Configured via react-native-config (SUPABASE_URL, SUPABASE_ANON_KEY).
 * Use for all backend operations.
 */
import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';

const supabaseUrl = Config.SUPABASE_URL || '';
const supabaseAnonKey = Config.SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
// ConfidenceSpark workspace batch
