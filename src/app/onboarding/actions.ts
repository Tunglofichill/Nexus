'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function saveAvatarData(data: { hair: string; clothes: string; skin: string }) {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  
  if (userError || !userData?.user) {
    redirect('/login')
  }

  // Update user metadata with avatar configuration
  const { error } = await supabase.auth.updateUser({
    data: {
      avatar_data: data
    }
  })

  if (error) {
    throw new Error('Failed to save avatar: ' + error.message)
  }

  redirect('/')
}
