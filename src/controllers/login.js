const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const APIKEY = '';

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_key:
                APIKEY
        }
    })
);

// LOGIN

//      localhost:3000/login
// Controlador para procesar el inicio de sesión
exports.postLogin = (req, res) => {
    const { email, password } = req.body;

    // Captura los errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg
        });
    }

    Usuario.findOne({ email: email })
        .then((usuario) => {
            if (!usuario) {
                return res.status(422).json({
                    message: 'Email o contraseña invalido'
                });
            }

            bcrypt.compare(password, usuario.password)
                .then((doMatch) => {
                    if (!doMatch) {
                        return res.status(422).json({
                            message: 'Email o contraseña invalido'
                        });
                    }

                    req.session.autenticado = true;
                    req.session.usuario = usuario;
                    req.session.save((err) => {
                        if (err) console.log('Error al guardar la sesión:', err);
                    });
                    res.status(200).json({message: 'Login exitoso'});
                });
        })
        .catch((err) => {
            res.status(500).json({ message: err.message });
        });
};


//      localhost:3000/recuperar-contrasena
// Controlador para manejar el envío del formulario de recuperación de contraseña
exports.postRecuperarContrasena = (req, res) => {
    const {email} = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg
        });
    }

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        const token = buffer.toString('hex');

        Usuario.findOne({ email: email })
            .then((usuario) => {
                if (!usuario) {
                    return res.status(422).json({
                        message: 'La cuenta no existe'
                    });
                }

                usuario.tokenReinicio = token;
                usuario.expiracionTokenReinicio = Date.now() + 3600000;
                return usuario.save();
            })
            .then(() => {
                transporter.sendMail({
                    to: email,
                    from: 'marisol.karina.pr40@gmail.com',
                    subject: 'Reinicio de password',
                    html: `<p>Has solicitado un reinicio de password</p>
                           <p>Click aquí <a href="http://localhost:3000/nuevo-password/${token}">link</a> para establecer una nueva password.</p>
                           <p>Token para recuperar contraseña: ${token}</p>`
                });
                return res.status(200).json({message: 'Correo enviado con el token para recuperar contraseña', tokenRecuperacion: token});
            })
            .catch((err) => {
                res.status(500).json({ message: err.message });
            });
    });
};


// Crear la nueva contraseña usando el token
//      localhost:3000/nuevo-password
exports.postNuevoPassword = (req, res) => {
    const { password, email, tokenPassword } = req.body;

    // Captura los errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: errors.array()[0].msg });
    }

    let usuarioParaActualizar;

    Usuario.findOne({
        tokenReinicio: tokenPassword,
        expiracionTokenReinicio: { $gt: Date.now() },
        // _id: idUsuario
        email: email
    })
        .then(usuario => {
            if (!usuario) {
                return res.status(422).json({ message: 'Token invalido o ha expirado.' });
            }
            usuarioParaActualizar = usuario;
            return bcrypt.hash(password, 12);
        })
        .then(hashedPassword => {
            usuarioParaActualizar.password = hashedPassword;
            usuarioParaActualizar.tokenReinicio = undefined;
            usuarioParaActualizar.expiracionTokenReinicio = undefined;
            usuarioParaActualizar.save();
            return res.status(200).json({ message: 'Nueva contraseña creada.' });
        })
        .catch(err => {
            res.status(500).json({ message: err.message });
        });
};



// REGISTRO
//        localhost:3000/registro
// Controlador para manejar el registro de nuevos usuarios
exports.postRegistrarse = (req, res) => {
    const { nombre, dni, email, password } = req.body;

    // Captura los errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg
        });
    }

    // Cifrar la contraseña y guardar el usuario
    bcrypt.hash(password, 12)
        .then((hashedPassword) => {
            const usuario = new Usuario({
                nombre,
                dni,
                email,
                password: hashedPassword,
                role: 'user',
                carrito: { items: [], precioTotal: 0 }
            });
            return usuario.save();
        })
        .then(() => {

            // Enviar correo de confirmación
            transporter.sendMail({
                to: email,
                from: 'marisol.karina.pr40@gmail.com',
                subject: 'Registro exitoso',
                html: '<h1>Bienvenido. Se ha registrado satisfactoriamente en el PetShop.</h1>'
            });
            return res.status(200).json({message: 'Registro exitoso'});
        })
        .catch((err) => {
            res.status(500).json({ message: err.message });
        });
};


//     localhost:3000/salir
exports.postSalir = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json({message: "Cerró sesión."})
    })
}