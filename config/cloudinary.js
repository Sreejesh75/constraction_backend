const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dphhgmvkk',
    api_key: '472814763242872',
    api_secret: 'x8cNgQAK35P1fq92xy4nsIRtQz4'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'construction_app_documents',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'txt'],
        // resource_type: 'auto' is handled by multer-storage-cloudinary but explicitly:
        resource_type: 'auto'
    },
});

module.exports = { cloudinary, storage };
