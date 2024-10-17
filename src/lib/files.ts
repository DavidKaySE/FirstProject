import { supabase } from './supabase'
import { File } from '../types/supabaseTypes'

export async function getUserFiles(userId: string): Promise<File[]> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching user files:', error)
    return []
  }

  return data || []
}

export async function createFile(file: Omit<File, 'id'>): Promise<File | null> {
  const { data, error } = await supabase
    .from('files')
    .insert(file)
    .single()

  if (error) {
    console.error('Error creating file:', error)
    return null
  }

  return data
}

export async function updateFile(file: Partial<File> & { id: string }): Promise<File | null> {
  const { data, error } = await supabase
    .from('files')
    .update(file)
    .eq('id', file.id)
    .single()

  if (error) {
    console.error('Error updating file:', error)
    return null
  }

  return data
}

export async function deleteFile(fileId: string): Promise<boolean> {
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId)

  if (error) {
    console.error('Error deleting file:', error)
    return false
  }

  return true
}

