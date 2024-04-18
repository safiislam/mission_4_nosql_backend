import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import fs from 'fs';

cloudinary.config({
    cloud_name: 'dvozyanjy',
    api_key: '638414577523571',
    api_secret: 'dKFVsrzbUFUaHEkPHw_ZnwJUFbY'
});

export const sendImageToCloudinary = (imageName: string, path: string) => {

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(path,
            { public_id: imageName },
            function (error, result) {
                if (error) {
                    reject(error)
                }
                resolve(result)
                fs.unlink('/path/to/your/file.txt', (err) => {
                    if (err) {
                        // Handle specific error if any
                        if (err.code === 'ENOENT') {
                            console.error('File does not exist.');
                        } else {
                            throw err;
                        }
                    } else {
                        console.log('File deleted!');
                    }
                });
            });
    })

}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.cwd() + '/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

export const upload = multer({ storage: storage })