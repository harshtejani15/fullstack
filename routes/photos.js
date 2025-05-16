const express = require('express');
const router = express.Router();
const { getPhotos, createPhoto, updatePhoto, deletePhoto } = require('../controllers/photoController');

router.get('/', getPhotos);
router.post('/', createPhoto);
router.put('/:id', updatePhoto);
router.delete('/:id', deletePhoto);

module.exports = router;