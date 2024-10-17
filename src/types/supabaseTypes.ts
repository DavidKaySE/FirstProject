export type Profile = {
  id: string
  updated_at: string | null
  username: string | null
  full_name: string | null
  avatar_url: string | null
  website: string | null
}

export type File = {
  id: string
  user_id: string
  name: string
  display_name: string | null
  type: string | null
  storage_path: string | null
  measurements: any | null
  pixels_per_unit: number | null
  current_unit: string | null
  scale: number | null
  last_modified: number | null
  added: number | null
  last_opened: number | null
  unsaved_changes: any | null
  is_open: boolean
  is_saved: boolean
  is_loading: boolean
  is_error: boolean
  is_modified: boolean
  metadata: any | null
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      files: {
        Row: File
        Insert: Omit<File, 'id'>
        Update: Partial<Omit<File, 'id' | 'user_id'>>
      }
    }
  }
}

export interface FileFromCloud {
  id: string;
  name: string;
  user_id: string;
  storage_path: string;
  // ... andra egenskaper ...
}
