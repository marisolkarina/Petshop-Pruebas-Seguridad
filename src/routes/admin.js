const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const { check, body } = require('express-validator');
const router = express.Router();
const Usuario = require('../models/usuario');

// /admin/productos
router.get('/productos', isAuth, adminController.getProductos);

// /admin/crear-producto
router.get('/crear-producto', isAuth, adminController.getCrearProducto);

router.post('/crear-producto',
    [
        body('nombre')
            .isString().withMessage('El nombre debe ser un texto')
            .notEmpty().withMessage('El nombre no puede estar vacío')
            .trim()
            .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres'),
        // body('urlImagen')
        //     .isURL().withMessage('La imagen debe ser una URL válida'),
        body('precio')
            .isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor a 0')
            .trim(),
        body('color')
            .notEmpty().withMessage('El color no puede estar vacío')
            .trim(),
        body('categoria')
            .notEmpty().withMessage('La categoría no puede estar vacía'),
        body('descripcion')
            .isLength({ min: 10, max: 1000 }),
        body('stock')
            .isInt().withMessage('El stock debe ser un número entero.')
    ]
    , isAuth, adminController.postCrearProducto);

// /admin/editar-producto
router.get('/editar-producto/:idProducto', isAuth, adminController.getEditarProducto);

router.post('/editar-producto',
    [
        body('nombre')
            .isString().withMessage('El nombre debe ser un texto')
            .notEmpty().withMessage('El nombre no puede estar vacío')
            .trim()
            .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres'),
        // body('urlImagen')
        //     .isURL().withMessage('La imagen debe ser una URL válida'),
        body('precio')
            .isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor a 0')
            .notEmpty().withMessage('El precio no puede estar vacío')
            .trim(),
        body('color')
            .notEmpty().withMessage('El color no puede estar vacío')
            .trim(),
        body('categoria')
            .notEmpty().withMessage('La categoría no puede estar vacía'),
        body('descripcion')
            .isLength({ min: 10, max: 1000 }),
        body('stock')
            .isInt().withMessage('El stock debe ser un número entero.')
    ]

    , isAuth, adminController.postEditarProducto);

// /admin/eliminar-producto
router.post('/eliminar-producto', isAuth, adminController.postEliminarProducto);

// /admin/usuarios
router.get('/usuarios', isAuth, adminController.getUsuarios);

// // /admin/usuarios
router.get('/crear-usuario', isAuth, adminController.getCrearUsuario);

router.post('/crear-usuario',
    [
        body('nombre')
            .isString().withMessage('El nombre debe ser un texto')
            .notEmpty().withMessage('El nombre no puede estar vacío')
            .trim(),
        body('dni')
            .isNumeric()
            .withMessage('Ingrese un DNI válido.')
            .isLength({ min: 8, max: 8 })
            .withMessage('Ingrese un DNI válido (8 dígitos).'),
        check('email')
            .isEmail()
            .withMessage('El correo debe ser un email válido')
            .normalizeEmail()
            .custom((value) => {
                return Usuario.findOne({ email: value }).then(usuarioDoc => {
                    if (usuarioDoc) {
                        return Promise.reject('El usuario ingresado ya existe');
                    }
                });
            }),
        body('password')
            .isLength({ min: 8 })
            .withMessage('La contraseña debe tener al menos 8 caracteres')
            .matches(/[A-Z]/)
            .withMessage('La contraseña debe contener al menos una letra mayúscula')
            .matches(/[a-z]/)
            .withMessage('La contraseña debe contener al menos una letra minúscula')
            .matches(/[0-9]/)
            .withMessage('La contraseña debe contener al menos un número')
            .matches(/[^A-Za-z0-9]/)
            .withMessage('La contraseña debe contener al menos un carácter especial (@, !, #, etc.)')
            .trim(),
    ]
    , isAuth, adminController.postCrearUsuario);

// // /admin/editar-usuario
router.get('/editar-usuario/:idUsuario', isAuth, adminController.getEditarUsuario);

router.post('/editar-usuario',
    [
        body('nombre')
            .isString().withMessage('El nombre debe ser un texto')
            .notEmpty().withMessage('El nombre no puede estar vacío')
            .trim(),
        body('dni')
            .isNumeric()
            .withMessage('Ingrese un DNI válido.')
            .isLength({ min: 8, max: 8 })
            .withMessage('Ingrese un DNI válido (8 dígitos).'),
        body('email')
            .isEmail().withMessage('El correo debe ser un email válido')
            .normalizeEmail()
    ]
    , isAuth, adminController.postEditarUsuario);

// // /admin/eliminar-usuario
router.post('/eliminar-usuario', isAuth, adminController.postEliminarUsuario);

// /admin/pedidos
router.get('/pedidos', isAuth, adminController.getPedidos);

// /admin/editar-pedido
router.get('/editar-pedido/:idPedido', isAuth, adminController.getEditarPedido);

router.post('/editar-pedido',
    [
        //para validar la fecha en base al formato de fecha mostrado de la base de dato
        body('fechaEntrega')
            .isISO8601().withMessage('La fecha de entrega debe ser una fecha válida')
            .custom(value => {
                const date = new Date(value);
                if (date.toString() === 'Invalid Date') {
                    throw new Error('La fecha de entrega no es válida');
                }
                return true;
            }),
        body('cantidadProducto')
            .isInt({ gt: 0 }).withMessage('La cantidad debe ser un número entero mayor a 0')
    ]
    , isAuth, adminController.postEditarPedido);

module.exports = router;
