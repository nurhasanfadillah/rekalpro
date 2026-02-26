-- Supabase Database Setup for ReKal Application
-- Run this SQL in the Supabase SQL Editor to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Materials Table
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  standard_price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('Pcs', 'Cm')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  overhead_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  target_margin_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_material_cost DECIMAL(12,2) DEFAULT 0,
  production_cost DECIMAL(12,2) DEFAULT 0,
  estimated_selling_price DECIMAL(12,2) DEFAULT 0,
  gross_profit_per_unit DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bill of Materials Table
CREATE TABLE IF NOT EXISTS bill_of_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
  price DECIMAL(10,2) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_materials_category_id ON materials(category_id);
CREATE INDEX IF NOT EXISTS idx_bom_product_id ON bill_of_materials(product_id);
CREATE INDEX IF NOT EXISTS idx_bom_material_id ON bill_of_materials(material_id);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_of_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access on categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on categories" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on categories" ON categories
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on categories" ON categories
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access on materials" ON materials
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on materials" ON materials
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on materials" ON materials
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on materials" ON materials
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access on products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on products" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on products" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on products" ON products
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access on bill_of_materials" ON bill_of_materials
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on bill_of_materials" ON bill_of_materials
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on bill_of_materials" ON bill_of_materials
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on bill_of_materials" ON bill_of_materials
  FOR DELETE USING (true);

-- Create storage bucket for product images
-- Note: This needs to be done through Supabase Dashboard or Storage API
-- Bucket name: products
-- Public access: true
-- Allowed file types: image/*
-- Max file size: 5MB
