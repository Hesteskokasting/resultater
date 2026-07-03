import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/supabase'

export async function unsubscribeChannel(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel)
}
