const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Konfiguracija Cloudinary z okolijskimi spremenljivkami
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkq3wvmcw',
  api_key: process.env.CLOUDINARY_API_KEY || '482142118981222',
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Ustvarjanje funkcije za konfiguracijo shrambe za različne tipe
const createCloudinaryStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
  });
};

// Shramba za projekte
const projectStorage = createCloudinaryStorage('devfolio/projects');
const projectUpload = multer({ 
  storage: projectStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB omejitev
});

// Shramba za tehnologije
const technologyStorage = createCloudinaryStorage('devfolio/technologies');
const technologyUpload = multer({ 
  storage: technologyStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB omejitev
});

// Pomožna funkcija za brisanje slike iz Cloudinary
const deleteImage = async (publicId) => {
  if (!publicId) return;
  
  try {
    // Če je podan URL namesto public ID, ekstrahiramo public ID iz URL-ja
    if (publicId.startsWith('http')) {
      const urlParts = publicId.split('/');
      const filenameWithExtension = urlParts[urlParts.length - 1];
      const filename = filenameWithExtension.split('.')[0];
      publicId = `devfolio/${urlParts[urlParts.length - 2]}/${filename}`;
    }
    
    await cloudinary.uploader.destroy(publicId);
    console.log(`Slika izbrisana iz Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('Napaka pri brisanju slike iz Cloudinary:', error);
  }
};

module.exports = {
  cloudinary,
  projectUpload,
  technologyUpload,
  deleteImage
};