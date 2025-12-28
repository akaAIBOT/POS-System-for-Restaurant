-- Add missing columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'dine_in',
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_fee FLOAT DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Update existing records to have default order_type
UPDATE orders SET order_type = 'dine_in' WHERE order_type IS NULL;

-- Make order_type NOT NULL after setting defaults
ALTER TABLE orders ALTER COLUMN order_type SET NOT NULL;

-- Add check constraint for order_type values
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_type_check;
ALTER TABLE orders ADD CONSTRAINT orders_order_type_check 
    CHECK (order_type IN ('dine_in', 'takeaway', 'delivery'));
