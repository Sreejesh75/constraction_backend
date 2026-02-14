try {
    const cloudinary = require('cloudinary');
    const storage = require('multer-storage-cloudinary');
    console.log('Cloudinary and Multer Storage Cloudinary are installed.');
} catch (e) {
    console.error('Dependencies missing:', e.message);
    process.exit(1);
}
