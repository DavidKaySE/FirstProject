-- Skapa profiles tabell
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Aktivera Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Skapa säkerhetspolicyer
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Skapa funktion för att hantera nya användare
CREATE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Skapa trigger för att automatiskt skapa en profil när en ny användare registreras
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Skapa files tabell
CREATE TABLE public.files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  type TEXT,
  storage_path TEXT,
  measurements JSONB,
  pixels_per_unit FLOAT,
  current_unit TEXT,
  scale FLOAT,
  last_modified BIGINT,
  added BIGINT,
  last_opened BIGINT,
  unsaved_changes JSONB,
  is_open BOOLEAN DEFAULT false,
  is_saved BOOLEAN DEFAULT true,
  is_loading BOOLEAN DEFAULT false,
  is_error BOOLEAN DEFAULT false,
  is_modified BOOLEAN DEFAULT false,
  metadata JSONB
);

-- Aktivera Row Level Security för files tabellen
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Skapa säkerhetspolicyer för files tabellen
CREATE POLICY "Users can view own files."
  ON public.files FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own files."
  ON public.files FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own files."
  ON public.files FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete own files."
  ON public.files FOR DELETE
  USING ( auth.uid() = user_id );

