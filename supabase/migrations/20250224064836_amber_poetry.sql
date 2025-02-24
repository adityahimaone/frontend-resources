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

  INSERT INTO resources (title, url, description, category_id) VALUES
  -- UI Components (Adding more)
  ('shadcn', 'https://shadcn.dev/', 'UI components for React', (SELECT id FROM categories WHERE slug = 'ui-components')),
  ('Flowbite', 'https://flowbite.com/', 'UI components built with Tailwind CSS', (SELECT id FROM categories WHERE slug = 'ui-components')),
  ('Material UI', 'https://mui.com/', 'Popular React UI framework implementing Material Design', (SELECT id FROM categories WHERE slug = 'ui-components')),
  ('Chakra UI', 'https://chakra-ui.com/', 'Simple, modular and accessible UI components for React', (SELECT id FROM categories WHERE slug = 'ui-components')),
  ('Ant Design', 'https://ant.design/', 'Enterprise-level UI design language and React components', (SELECT id FROM categories WHERE slug = 'ui-components')),
  ('NextUI', 'https://nextui.org/', 'Beautiful, fast and modern React UI library', (SELECT id FROM categories WHERE slug = 'ui-components')),
  ('Radix UI', 'https://www.radix-ui.com/', 'Unstyled, accessible components for React', (SELECT id FROM categories WHERE slug = 'ui-components')),
  ('Headless UI', 'https://headlessui.com/', 'Completely unstyled UI components for React', (SELECT id FROM categories WHERE slug = 'ui-components')),
  ('Mantine', 'https://mantine.dev/', 'React components and hooks library', (SELECT id FROM categories WHERE slug = 'ui-components')),
  ('DaisyUI', 'https://daisyui.com/', 'Tailwind CSS components library', (SELECT id FROM categories WHERE slug = 'ui-components')),

  -- Animation Libraries (Adding more)
  ('Framer Motion', 'https://www.framer.com/motion/', 'A library for creating animations in React', (SELECT id FROM categories WHERE slug = 'animation-libraries')),
  ('GSAP', 'https://greensock.com/gsap/', 'Professional-grade JavaScript animation for the modern web', (SELECT id FROM categories WHERE slug = 'animation-libraries')),
  ('Rombo', 'https://rombo.co/tailwind/', 'Tailwind CSS animations', (SELECT id FROM categories WHERE slug = 'animation-libraries')),
  ('Anime.js', 'https://animejs.com/', 'Lightweight JavaScript animation library', (SELECT id FROM categories WHERE slug = 'animation-libraries')),
  ('Motion One', 'https://motion.dev/', 'Web animations API for production', (SELECT id FROM categories WHERE slug = 'animation-libraries')),
  ('Lottie', 'https://airbnb.design/lottie/', 'Airbnb\'s library for web and mobile animations', (SELECT id FROM categories WHERE slug = 'animation-libraries')),
  ('Three.js', 'https://threejs.org/', '3D animations and graphics library', (SELECT id FROM categories WHERE slug = 'animation-libraries')),
  ('Velocity.js', 'http://velocityjs.org/', 'Accelerated JavaScript animations', (SELECT id FROM categories WHERE slug = 'animation-libraries')),
  ('PopMotion', 'https://popmotion.io/', 'Simple animation libraries for delightful interfaces', (SELECT id FROM categories WHERE slug = 'animation-libraries')),
  ('Mo.js', 'https://mojs.github.io/', 'Motion graphics toolbelt for the web', (SELECT id FROM categories WHERE slug = 'animation-libraries')),

  -- UI Animation Components (Adding more)
  ('React Bits', 'https://www.reactbits.dev/', 'Pre-built animated UI components', (SELECT id FROM categories WHERE slug = 'ui-animation-components')),
  ('Aceternity UI', 'https://ui.aceternity.com/', 'Animated UI components', (SELECT id FROM categories WHERE slug = 'ui-animation-components')),
  ('React Spring', 'https://react-spring.dev/', 'Spring-physics based animation library', (SELECT id FROM categories WHERE slug = 'ui-animation-components')),
  ('React Move', 'https://react-move.js.org/', 'Beautiful animations for React', (SELECT id FROM categories WHERE slug = 'ui-animation-components')),
  ('React Transition Group', 'https://reactcommunity.org/react-transition-group/', 'Expressive animations for React apps', (SELECT id FROM categories WHERE slug = 'ui-animation-components')),
  ('React-Motion', 'https://github.com/chenglou/react-motion', 'Spring based animation library', (SELECT id FROM categories WHERE slug = 'ui-animation-components')),
  ('React Reveal', 'https://www.react-reveal.com/', 'Animation framework for React', (SELECT id FROM categories WHERE slug = 'ui-animation-components')),
  ('React Animation', 'https://formidable.com/open-source/react-animations/', 'Collection of animations for React components', (SELECT id FROM categories WHERE slug = 'ui-animation-components')),
  ('React Pose', 'https://popmotion.io/pose/', 'Declarative animations system for React', (SELECT id FROM categories WHERE slug = 'ui-animation-components')),
  ('React Simple Animate', 'https://react-simple-animate.now.sh/', 'Easy to use animation components', (SELECT id FROM categories WHERE slug = 'ui-animation-components')),

  -- Inspiration (Adding more)
  ('Awwwards', 'https://www.awwwards.com/', 'Website awards and inspiration', (SELECT id FROM categories WHERE slug = 'inspiration')),
  ('Webflow', 'https://webflow.com/', 'Design and develop at the same time', (SELECT id FROM categories WHERE slug = 'inspiration')),
  ('Dribbble', 'https://dribbble.com/', 'Design inspiration and community', (SELECT id FROM categories WHERE slug = 'inspiration')),
  ('Behance', 'https://www.behance.net/', 'Adobe\'s creative showcase platform', (SELECT id FROM categories WHERE slug = 'inspiration')),
  ('Pinterest', 'https://www.pinterest.com/', 'Visual discovery platform', (SELECT id FROM categories WHERE slug = 'inspiration')),
  ('Site Inspire', 'https://www.siteinspire.com/', 'Web design inspiration', (SELECT id FROM categories WHERE slug = 'inspiration')),
  ('CSS Design Awards', 'https://www.cssdesignawards.com/', 'Website awards and inspiration', (SELECT id FROM categories WHERE slug = 'inspiration')),
  ('Land-book', 'https://land-book.com/', 'Landing page inspiration gallery', (SELECT id FROM categories WHERE slug = 'inspiration')),
  ('One Page Love', 'https://onepagelove.com/', 'One-page website inspiration', (SELECT id FROM categories WHERE slug = 'inspiration')),
  ('Design Systems Gallery', 'https://designsystemsrepo.com/', 'Collection of design systems', (SELECT id FROM categories WHERE slug = 'inspiration')),

  -- Frameworks (Adding more)
  ('Tailwind CSS', 'https://tailwindcss.com/', 'A utility-first CSS framework', (SELECT id FROM categories WHERE slug = 'frameworks')),
  ('Next.js', 'https://nextjs.org/', 'The React Framework for Production', (SELECT id FROM categories WHERE slug = 'frameworks')),
  ('Astro', 'https://astro.build/', 'Build faster websites', (SELECT id FROM categories WHERE slug = 'frameworks')),
  ('Remix', 'https://remix.run/', 'Build better websites', (SELECT id FROM categories WHERE slug = 'frameworks')),
  ('Vue.js', 'https://vuejs.org/', 'Progressive JavaScript Framework', (SELECT id FROM categories WHERE slug = 'frameworks')),
  ('Svelte', 'https://svelte.dev/', 'Cybernetically enhanced web apps', (SELECT id FROM categories WHERE slug = 'frameworks')),
  ('Angular', 'https://angular.io/', 'Platform for building mobile and desktop web applications', (SELECT id FROM categories WHERE slug = 'frameworks')),
  ('Nuxt.js', 'https://nuxt.com/', 'The Intuitive Vue Framework', (SELECT id FROM categories WHERE slug = 'frameworks')),
  ('Gatsby', 'https://www.gatsbyjs.com/', 'Fast and flexible framework based on React', (SELECT id FROM categories WHERE slug = 'frameworks')),
  ('Solid.js', 'https://www.solidjs.com/', 'Simple and performant reactivity for building user interfaces', (SELECT id FROM categories WHERE slug = 'frameworks')),

  -- Other Tools (Adding more)
  ('React Lens', 'https://react-lens.com/', 'Tools for React developers', (SELECT id FROM categories WHERE slug = 'other-tools')),
  ('Lona', 'https://airbnb.io/lona', 'Airbnb\'s design system tool', (SELECT id FROM categories WHERE slug = 'other-tools')),
  ('Storybook', 'https://storybook.js.org/', 'UI component explorer for frontend developers', (SELECT id FROM categories WHERE slug = 'other-tools')),
  ('Figma', 'https://www.figma.com/', 'Collaborative interface design tool', (SELECT id FROM categories WHERE slug = 'other-tools')),
  ('Sketch', 'https://www.sketch.com/', 'Digital design platform', (SELECT id FROM categories WHERE slug = 'other-tools')),
  ('Adobe XD', 'https://www.adobe.com/products/xd.html', 'UI/UX design and collaboration tool', (SELECT id FROM categories WHERE slug = 'other-tools')),
  ('InVision', 'https://www.invisionapp.com/', 'Digital product design platform', (SELECT id FROM categories WHERE slug = 'other-tools')),
  ('Zeplin', 'https://zeplin.io/', 'Design handoff and collaboration platform', (SELECT id FROM categories WHERE slug = 'other-tools')),
  ('Abstract', 'https://www.abstract.com/', 'Design version control and collaboration', (SELECT id FROM categories WHERE slug = 'other-tools')),
  ('Framer', 'https://www.framer.com/', 'Interactive design tool', (SELECT id FROM categories WHERE slug = 'other-tools'));