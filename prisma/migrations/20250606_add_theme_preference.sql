-- Add theme_preference to users table
ALTER TABLE users ADD COLUMN theme_preference VARCHAR(10) DEFAULT 'system';
