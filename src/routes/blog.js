const express = require('express');

const blogController = require('../controllers/blog');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/blog', blogController.getPublicaciones);

router.get('/crear-publicacion', isAuth, blogController.getCrearPublicacion);
router.post('/crear-publicacion', isAuth, blogController.postCrearPublicacion);

router.get('/editar-publicacion/:idPublicacion', isAuth, blogController.getEditarPublicacion);
router.post('/editar-publicacion', isAuth, blogController.postEditarPublicacion);

router.post('/eliminar-publicacion', isAuth, blogController.postEliminarPublicacion);

router.get('/blog/:idPublicacion', blogController.getPublicacion);

router.post('/blog/comentar', isAuth, blogController.postComentar);
router.post('/blog/eliminar-comentario', isAuth, blogController.postEliminarComentario);

module.exports = router;