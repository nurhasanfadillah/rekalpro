# Supabase Integration for ReKal

This document describes the Supabase integration for the ReKal application, replacing SQLite with Supabase PostgreSQL database and adding Supabase Storage for product images.

## Credentials Used

- **API URL**: `https://ypzaeibjjppejjfbfubq.supabase.co`
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwemFlaWJqanBwZWpqZmJmdWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTg4MzgsImV4cCI6MjA4NzY5NDgzOH0.ze3q6WrALXmYdRG0fjG_xKOVUUBXXMWaMvL12ia5uAE`

## Setup Instructions

### 1. Database Setup

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to the SQL Editor
4. Run the SQL from `supabase-setup.sql` file to create all necessary tables

### 2. Storage Setup

1. In Supabase Dashboard, go to Storage
2. Create a new bucket named `products`
3. Set the bucket to public
4. Configure CORS if needed for your domain

### 3. Environment Variables (Optional)

For better security, you can use environment variables instead of hardcoded credentials:

**Server (.env file in server/ directory):**
```
SUPABASE_URL=https://ypzaeibjjppejjfbfubq.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwemFlaWJqanBwZWpqZmJmdWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTg4MzgsImV4cCI6MjA4NzY5NDgzOH0.ze3q6WrALXmYdRG0fjG_xKOVUUBXXMWaMvL12ia5uAE
```

**Client (.env file in client/ directory):**
```
VITE_SUPABASE_URL=https://ypzaeibjjppejjfbfubq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwemFlaWJqanBwZWpqZmJmdWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTg4MzgsImV4cCI6MjA4NzY5NDgzOH0.ze3q6WrALXmYdRG0fjG_xKOVUUBXXMWaMvL12ia5uAE
```

## Architecture Changes

### Backend Changes

1. **Database Layer** (`server/src/config/db.js`):
   - Replaced SQLite with Supabase PostgreSQL
   - Maintained backward compatibility with existing SQL-based interface
   - Added async helper functions for Supabase operations

2. **Controllers Updated**:
   - `categoryController.js` - All CRUD operations now use Supabase
   - `materialController.js` - All CRUD operations now use Supabase
   - `productController.js` - All CRUD operations now use Supabase, with image deletion on product delete

3. **New Services**:
   - `server/src/services/storageService.js` - Handles image uploads to Supabase Storage

4. **Routes**:
   - Added `POST /api/products/upload-image` endpoint for image uploads

### Frontend Changes

1. **API Layer** (`client/src/api/index.js`):
   - Added `uploadImage` method to `productApi` for image uploads

2. **Configuration**:
   - Added `client/src/config/supabase.js` for client-side Supabase access (if needed for direct storage access)

## API Endpoints

All existing API endpoints remain the same:

- **Categories**: `/api/categories`
- **Materials**: `/api/materials`
- **Products**: `/api/products`

**New Endpoint**:
- `POST /api/products/upload-image` - Upload product images

## Features

### Database Features
- ✅ All CRUD operations for Categories, Materials, Products
- ✅ Bill of Materials (BoM) management
- ✅ Automatic cost calculations (HPP, selling price, profit)
- ✅ Product duplication
- ✅ Foreign key constraints and cascading deletes
- ✅ Unique constraints for names

### Storage Features
- ✅ Product image uploads
- ✅ Automatic image deletion when product is deleted
- ✅ Public URL generation for images
- ✅ Unique filename generation to prevent conflicts

## Testing

To test the integration:

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```

2. Start the frontend:
   ```bash
   cd client
   npm run dev
   ```

3. Test the following operations:
   - Create, read, update, delete categories
   - Create, read, update, delete materials
   - Create, read, update, delete products with BoM
   - Upload product images
   - Duplicate products

## Migration from SQLite

If you have existing data in SQLite that you want to migrate:

1. Export your SQLite data to JSON
2. Use the existing API endpoints to import the data into Supabase
3. Or write a migration script using the Supabase client

## Security Considerations

1. **Row Level Security (RLS)**: The SQL setup includes basic RLS policies. Review and adjust these based on your authentication requirements.

2. **API Keys**: The current setup uses the anon key. For production, consider:
   - Using service role key only on the backend
   - Implementing authentication
   - Using environment variables

3. **Storage Policies**: Review storage bucket policies in Supabase Dashboard to ensure proper access control.

## Troubleshooting

### Common Issues

1. **Connection Errors**: Check that the Supabase URL and API key are correct
2. **RLS Errors**: If you get permission errors, check the RLS policies in Supabase
3. **Storage Upload Errors**: Ensure the `products` bucket exists and is public
4. **Foreign Key Errors**: Check that referenced records exist before creating relationships

### Logs

Check the server console for detailed error messages from Supabase operations.

## Support

For Supabase-specific issues, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
