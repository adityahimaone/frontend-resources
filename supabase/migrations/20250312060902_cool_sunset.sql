/*
  # Add tagging system for resources

  1. New Tables
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `color` (text) - Tailwind color class
      - `created_at` (timestamp)
    
    - `resource_tags`
      - `resource_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)
      - Primary key is combination of both IDs

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated users to manage tags
*/

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create resource_tags junction table
CREATE TABLE IF NOT EXISTS resource_tags (
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to tags"
  ON tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage tags"
  ON tags
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to resource_tags"
  ON resource_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage resource_tags"
  ON resource_tags
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to generate a random Tailwind color class
CREATE OR REPLACE FUNCTION generate_tag_color()
RETURNS text AS $$
DECLARE
  colors text[] := ARRAY[
    'bg-blue-500/10 text-blue-500',
    'bg-green-500/10 text-green-500',
    'bg-red-500/10 text-red-500',
    'bg-yellow-500/10 text-yellow-500',
    'bg-purple-500/10 text-purple-500',
    'bg-pink-500/10 text-pink-500',
    'bg-indigo-500/10 text-indigo-500',
    'bg-orange-500/10 text-orange-500',
    'bg-teal-500/10 text-teal-500',
    'bg-cyan-500/10 text-cyan-500'
  ];
BEGIN
  RETURN colors[floor(random() * array_length(colors, 1)) + 1];
END;
$$ LANGUAGE plpgsql;

-- Function to generate a slug from tag name
CREATE OR REPLACE FUNCTION generate_tag_slug()
RETURNS trigger AS $$
BEGIN
  NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate slug and color for new tags
CREATE TRIGGER set_tag_slug_and_color
  BEFORE INSERT ON tags
  FOR EACH ROW
  EXECUTE FUNCTION generate_tag_slug();

-- Insert some initial tags
INSERT INTO tags (name, slug, color) VALUES
  ('TypeScript', 'typescript', 'bg-blue-500/10 text-blue-500'),
  ('React', 'react', 'bg-cyan-500/10 text-cyan-500'),
  ('Next.js', 'next-js', 'bg-black/10 text-black'),
  ('Vue', 'vue', 'bg-green-500/10 text-green-500'),
  ('Angular', 'angular', 'bg-red-500/10 text-red-500'),
  ('Svelte', 'svelte', 'bg-orange-500/10 text-orange-500'),
  ('CSS', 'css', 'bg-blue-400/10 text-blue-400'),
  ('JavaScript', 'javascript', 'bg-yellow-500/10 text-yellow-500'),
  ('UI', 'ui', 'bg-purple-500/10 text-purple-500'),
  ('Animation', 'animation', 'bg-pink-500/10 text-pink-500');