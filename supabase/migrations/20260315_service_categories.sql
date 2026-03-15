-- Service categories table: single source of truth for all service/category lists
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,           -- display name e.g. "Snow Clearing"
  slug TEXT NOT NULL UNIQUE,           -- url/filter key e.g. "snow-clearing"
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read active categories
CREATE POLICY "Anyone can read active service categories"
  ON service_categories FOR SELECT
  USING (is_active = true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage service categories"
  ON service_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_role_memberships
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND state = 'approved'
    )
  );

-- Seed with the union of all categories currently in use across the codebase
INSERT INTO service_categories (name, slug, sort_order) VALUES
  ('Graphics Design',   'graphics-design',   1),
  ('UI/UX Design',      'ui-ux-design',      2),
  ('Web Development',   'web-development',   3),
  ('Product Design',    'product-design',    4),
  ('Plumbing',          'plumbing',          5),
  ('Electrical',        'electrical',        6),
  ('Cleaning',          'cleaning',          7),
  ('Painting',          'painting',          8),
  ('Landscaping',       'landscaping',       9),
  ('Carpentry',         'carpentry',        10),
  ('Snow Clearing',     'snow-clearing',    11),
  ('Handyman',          'handyman',         12),
  ('Auto Services',     'auto',             13),
  ('Childcare',         'childcare',        14),
  ('Tutoring',          'tutoring',         15),
  ('Moving Help',       'moving',           16),
  ('Personal Care',     'personal-care',    17),
  ('HVAC',              'hvac',             18),
  ('General Contractor','general-contractor',19)
ON CONFLICT (slug) DO NOTHING;
