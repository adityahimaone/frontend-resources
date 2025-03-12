/*
  # Create resources tables

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `resources`
      - `id` (uuid, primary key)
      - `title` (text)
      - `url` (text)
      - `description` (text)
      - `category_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage resources
*/

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create resources table
CREATE TABLE resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to resources"
  ON resources
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage resources"
  ON resources
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial categories
INSERT INTO categories (name, slug, description) VALUES
  ('UI Components', 'ui-components', 'Collection of UI component libraries and frameworks'),
  ('Animation Libraries', 'animation-libraries', 'Animation tools and libraries for web development'),
  ('UI Animation Components', 'ui-animation-components', 'Pre-built animated UI components'),
  ('Inspiration', 'inspiration', 'Design inspiration and showcase websites'),
  ('Frameworks', 'frameworks', 'Web development frameworks and tools'),
  ('Other Tools', 'other-tools', 'Additional frontend development tools and utilities');

  