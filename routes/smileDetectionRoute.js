/*
const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')


const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename(req, file, cb) {
        cb(null, `${file.fildname}-${Date.now()}${path.extname(file.originalname)}`)
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})

const { checkImages } = require('../public/javascripts/smileDetectionTF')

router.route('/').get(checkImages)
module.exports = router
*/