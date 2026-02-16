const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dphhgmvkk',
    api_key: '472814763242872',
    api_secret: 'x8cNgQAK35P1fq92xy4nsIRtQz4'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'construction_app_documents',
            resource_type: 'auto',
        };
    },
});

module.exports = { cloudinary, storage };
