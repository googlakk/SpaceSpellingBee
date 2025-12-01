-- Migration: Add order_index to Levels Table
--
-- This migration adds order_index field to levels table to allow custom ordering
-- of levels display on the client side

-- Step 1: Add order_index column to levels table
ALTER TABLE levels
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Step 2: Initialize order_index for existing levels
-- This sets order_index based on current creation order (created_at)
WITH numbered_levels AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY language_id ORDER BY created_at) as row_num
  FROM levels
)
UPDATE levels
SET order_index = numbered_levels.row_num
FROM numbered_levels
WHERE levels.id = numbered_levels.id AND levels.order_index = 0;

-- Step 3: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_levels_order_index
ON levels(language_id, order_index);

-- Step 4: Add comment for documentation
COMMENT ON COLUMN levels.order_index IS
'Custom display order for levels within each language. Lower numbers appear first.';

-- ============================================================================
-- Migration Notes:
-- ============================================================================
--
-- 1. Backward Compatibility:
--    - Existing levels will be numbered 1, 2, 3... based on created_at
--    - order_index is grouped by language_id
--
-- 2. Usage:
--    - When fetching levels, ORDER BY order_index instead of name
--    - When creating new level, set order_index to MAX(order_index) + 1
--    - Admin UI should allow reordering via up/down buttons
--
-- ============================================================================
