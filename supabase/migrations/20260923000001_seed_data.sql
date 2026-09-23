-- ==============================================================================
-- MADHUS BOUTIQUE: SEED CATALOG DATA & DEFAULT SETTINGS
-- ==============================================================================

-- 1. Seed Default Payment Setting
INSERT INTO payment_settings (id, upi_id, merchant_name, is_active)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'madhusboutique@upi',
  'Madhus Boutique',
  true
) ON CONFLICT (id) DO NOTHING;

-- 2. Seed Products
INSERT INTO products (
  product_code, name, slug, description, category, price,
  preview_image_key, preview_url, product_file_keys,
  file_format, file_formats, file_size, stitch_count, dimensions,
  color_stops, featured, status
) VALUES
(
  'MB-001',
  'Royal Zardozi Peacock Bridal Blouse',
  'royal-zardozi-peacock-bridal-blouse',
  'An opulent royal peacock centerpiece designed for bridal silk blouse back yokes with coordinating sleeve crests. Features intricate feather fill stitches, metallic thread calibration, and sequin guide marks.',
  'Bridal',
  499.00,
  'products/MB-001/preview/peacock-bridal.webp',
  '/images/peacock-bridal.svg',
  ARRAY[
    'products/MB-001/files/MB-001.dst',
    'products/MB-001/files/MB-001.pes',
    'products/MB-001/files/MB-001.jef',
    'products/MB-001/files/MB-001.exp'
  ],
  'DST',
  ARRAY['DST', 'PES', 'JEF', 'EXP'],
  '2.4 MB',
  42850,
  '220 x 180 mm',
  8,
  true,
  'ACTIVE'
),
(
  'MB-002',
  'Sublime Rose Bloom Floral Neck Motif',
  'sublime-rose-bloom-floral-neck-motif',
  'Delicate blooming English rose bouquet ideal for kurti necklines, organza dupattas, and tunic yokes. Engineered for smooth high-speed machine stitching with minimal thread breaks.',
  'Floral',
  199.00,
  'products/MB-002/preview/rose-bloom.webp',
  '/images/rose-bloom.svg',
  ARRAY[
    'products/MB-002/files/MB-002.dst',
    'products/MB-002/files/MB-002.pes',
    'products/MB-002/files/MB-002.jef'
  ],
  'DST',
  ARRAY['DST', 'PES', 'JEF'],
  '1.1 MB',
  18420,
  '140 x 150 mm',
  5,
  true,
  'ACTIVE'
),
(
  'MB-003',
  'Traditional Mango Paisley Saree Border',
  'traditional-mango-paisley-saree-border',
  'Seamless repeat border motif featuring traditional Indian paisley (manga) elements with ornate zari outline styling. Suitable for Kanchipuram and Banarasi silk saree borders.',
  'Saree',
  349.00,
  'products/MB-003/preview/mango-paisley.webp',
  '/images/mango-paisley.svg',
  ARRAY[
    'products/MB-003/files/MB-003.dst',
    'products/MB-003/files/MB-003.pes',
    'products/MB-003/files/MB-003.jef',
    'products/MB-003/files/MB-003.exp'
  ],
  'DST',
  ARRAY['DST', 'PES', 'JEF', 'EXP'],
  '3.2 MB',
  31200,
  '300 x 85 mm',
  4,
  true,
  'ACTIVE'
),
(
  'MB-004',
  'Whimsical Cute Teddy & Stars Motif',
  'whimsical-cute-teddy-and-stars-motif',
  'Gentle nursery teddy bear cradled by celestial crescent moon and stars. Features specialized soft underlay stitch density specifically calculated for baby garments and cotton rompers.',
  'Kids',
  149.00,
  'products/MB-004/preview/kids-teddy.webp',
  '/images/kids-teddy.svg',
  ARRAY[
    'products/MB-004/files/MB-004.dst',
    'products/MB-004/files/MB-004.pes',
    'products/MB-004/files/MB-004.jef'
  ],
  'DST',
  ARRAY['DST', 'PES', 'JEF'],
  '820 KB',
  12800,
  '100 x 110 mm',
  4,
  false,
  'ACTIVE'
),
(
  'MB-005',
  'Regal Grand U-Neck Aari Work Design',
  'regal-grand-u-neck-aari-work-design',
  'Majestic bridal U-shape front and back neck pattern imitating authentic handcrafted Aari chain stitches with precision sequence stone placement spacing.',
  'Neck Designs',
  399.00,
  'products/MB-005/preview/regal-u-neck.webp',
  '/images/regal-u-neck.svg',
  ARRAY[
    'products/MB-005/files/MB-005.dst',
    'products/MB-005/files/MB-005.pes',
    'products/MB-005/files/MB-005.jef',
    'products/MB-005/files/MB-005.exp'
  ],
  'DST',
  ARRAY['DST', 'PES', 'JEF', 'EXP'],
  '2.8 MB',
  36500,
  '260 x 240 mm',
  6,
  true,
  'ACTIVE'
),
(
  'MB-006',
  'Lotus Harmony Sleeve & Border Combo',
  'lotus-harmony-sleeve-border-combo',
  'Sacred Indian lotus pond motif with matching sleeve borders and subtle water ripple effect. Perfect for festive lehengas and chanderi kurtas.',
  'Floral',
  249.00,
  'products/MB-006/preview/lotus-harmony.webp',
  '/images/lotus-harmony.svg',
  ARRAY[
    'products/MB-006/files/MB-006.dst',
    'products/MB-006/files/MB-006.pes'
  ],
  'DST',
  ARRAY['DST', 'PES'],
  '1.4 MB',
  22100,
  '180 x 140 mm',
  4,
  false,
  'ACTIVE'
),
(
  'MB-007',
  'Royal Temple Elephant Motif Blouse Arm',
  'royal-temple-elephant-motif-blouse-arm',
  'Traditional caparisoned temple elephant motif framed by heritage floral arches. Premium high-density satin border embroidery.',
  'Blouse',
  299.00,
  'products/MB-007/preview/temple-elephant.webp',
  '/images/temple-elephant.svg',
  ARRAY[
    'products/MB-007/files/MB-007.dst',
    'products/MB-007/files/MB-007.pes',
    'products/MB-007/files/MB-007.jef',
    'products/MB-007/files/MB-007.exp'
  ],
  'DST',
  ARRAY['DST', 'PES', 'JEF', 'EXP'],
  '1.9 MB',
  28400,
  '160 x 170 mm',
  5,
  true,
  'ACTIVE'
),
(
  'MB-008',
  'Geometric Chevron & Mirror Work Border',
  'geometric-chevron-mirror-work-border',
  'Contemporary geometric zig-zag pattern with automated circular hole pockets calibrated for standard 6mm acrylic mirrors or sequins.',
  'Custom',
  229.00,
  'products/MB-008/preview/chevron-mirror.webp',
  '/images/chevron-mirror.svg',
  ARRAY[
    'products/MB-008/files/MB-008.dst',
    'products/MB-008/files/MB-008.pes',
    'products/MB-008/files/MB-008.exp'
  ],
  'DST',
  ARRAY['DST', 'PES', 'EXP'],
  '1.3 MB',
  19800,
  '280 x 60 mm',
  3,
  false,
  'ACTIVE'
)
ON CONFLICT (product_code) DO NOTHING;
