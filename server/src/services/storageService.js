const supabase = require('../config/supabase');

const BUCKET_NAME = 'products';

/**
 * Upload image to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
async function uploadImage(fileBuffer, fileName, mimeType) {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `product-images/${uniqueFileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Storage upload error:', error);
    throw error;
  }
}

/**
 * Delete image from Supabase Storage
 * @param {string} fileUrl - Public URL of the file to delete
 * @returns {Promise<void>}
 */
async function deleteImage(fileUrl) {
  try {
    // Extract file path from URL
    const url = new URL(fileUrl);
    const pathMatch = url.pathname.match(/\/object\/public\/${BUCKET_NAME}\/(.+)/);
    
    if (!pathMatch) {
      console.warn('Could not extract file path from URL:', fileUrl);
      return;
    }

    const filePath = pathMatch[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
    }
  } catch (error) {
    console.error('Storage delete error:', error);
  }
}

/**
 * Get signed URL for temporary access (if needed)
 * @param {string} filePath - Path to the file
 * @param {number} expiresIn - Expiration time in seconds (default: 60)
 * @returns {Promise<string>} - Signed URL
 */
async function getSignedUrl(filePath, expiresIn = 60) {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL error:', error);
    throw error;
  }
}

module.exports = {
  uploadImage,
  deleteImage,
  getSignedUrl,
  BUCKET_NAME
};
