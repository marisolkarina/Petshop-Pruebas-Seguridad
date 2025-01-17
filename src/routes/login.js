const express = require('express');
const loginController = require('../controllers/login');
const { check, body } = require('express-validator');
const router = express.Router();
const Usuario = require('../models/usuario')

// Recuperacion de cuenta
router.get('/recuperar-contrasena', loginController.getRecuperarContrasena);
router.post('/recuperar-contrasena', [
    // Validación de email
    check('email')
        .isEmail()
        .withMessage('Por favor ingrese un email válido')
        .notEmpty()
        .withMessage('El campo de email no puede estar vacío')
], loginController.postRecuperarContrasena);

// Nueva contraseña
router.get('/nuevo-password/:token', loginController.getNuevoPassword);
router.post('/nuevo-password', [
    // Validación de contraseña: longitud, letras mayúsculas y minúsculas, números y caracteres especiales
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
        .withMessage('La contraseña debe contener al menos un carácter especial (@, !, #, etc.)'),
        
    // Confirmación de contraseña
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
    })
], loginController.postNuevoPassword);

// Inicio de sesion
router.get('/login', loginController.getLogin);
router.post('/login', [
    check('email')
        .isEmail()
        .withMessage('Ingrese un email válido')
        .notEmpty()
        .withMessage('El campo de email no puede estar vacío')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('El campo de contraseña no puede estar vacío')
        .isLength({min:8})
        
        .trim(),
], loginController.postLogin);

// Registro
router.get('/registro', loginController.getRegistrarse);
router.post('/registro', [
    // Validación de nombre: solo letras, sin números ni símbolos
    body('nombre')
        .isAlpha('es-ES', { ignore: ' ' })
        .withMessage('Ingrese un nombre válido.'),

    // Validación de email: formato correcto y no debe estar en uso
    check('email')
        .isEmail()
        .withMessage('Por favor ingrese un email válido')
        .normalizeEmail()
        .custom((value) => {
            return Usuario.findOne({ email: value }).then(usuarioDoc => {
                if (usuarioDoc) {
                    return Promise.reject('El usuario ingresado ya existe');
                }
            });
        }),

    // Validación de DNI: solo números y una longitud de 8 caracteres
    body('dni')
        .isNumeric()
        .withMessage('Ingrese un DNI válido.')
        .isLength({ min: 8, max: 8 })
        .withMessage('Ingrese un DNI válido (8 dígitos).'),

    // Validación de contraseña: longitud, letras mayúsculas y minúsculas, números y caracteres especiales
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

    // Confirmación de contraseña
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
    })
], loginController.postRegistrarse);

// Cierre de sesion
router.post('/salir', loginController.postSalir);

module.exports = router;
