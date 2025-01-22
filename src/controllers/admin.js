const Pedido = require('../models/pedido');
const Producto = require('../models/producto');
const Usuario = require('../models/usuario');

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');


//Administracion de Productos
//      localhost:3000/admin/productos
exports.getProductos = (req, res,next) => {

    Producto
        .find()
        .then((productos) => {
            if (req.usuario.role !== 'admin') {
                return res.status(500).json({
                    message: 'No tiene rol de admin.'
                });
            }
            res.status(200).json({
                message: 'Administracion de productos',
                prods: productos,
                autenticado: req.session.autenticado
            });
        }).catch((err) => {
            res.status(500).json({ message: err.message });
        });

};

//      localhost:3000/crear-producto
exports.postCrearProducto = (req, res) => {

    const {nombre, precio, descuento, fechaExpiracion, descripcion, categoria, color, stock, urlImagen} = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg,
        });
      }

    const producto = new Producto({
        nombre: nombre,
        urlImagen: urlImagen,
        descripcion: descripcion,
        precio: precio,
        descuento: {
            valor: descuento,
            fechaExpiracion: fechaExpiracion
        },
        categoria: categoria,
        color: color,
        stock: stock,
        comentarios: [],
        idUsuario: req.usuario._id
    });

    if (req.usuario.role !== 'admin') {
        return res.status(500).json({
            message: 'No tiene rol de admin.'
        });
    }
    producto
        .save()
        .then((result) => {
            res.status(200).json({
                message: 'Producto creado',
                producto: producto
            });
        })
        .catch((err) => {
            res.status(500).json({ message: err.message });
        });
};

//      localhost:3000/admin/editar-producto/:idProducto
exports.postEditarProducto = (req, res) => {
    const {idProducto} = req.params;
    const {nombre, precio, descuento, fechaExpiracion, descripcion, categoria, color, stock, urlImagen} = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg,
        });
      }

    Producto.findById(idProducto)
        .then((producto) => {
            if (req.usuario.role !== 'admin') {
                return res.status(500).json({
                    message: 'No tiene rol de admin.'
                });
            }
            if(!producto) {
                return res.status(500).json({
                    message: 'No existe el producto.'
                });
            }
            producto.nombre = nombre;
            producto.urlImagen = urlImagen;
            producto.descripcion = descripcion;
            producto.precio = precio;
            producto.descuento.valor = descuento;
            producto.descuento.fechaExpiracion = fechaExpiracion;
            producto.categoria = categoria;
            producto.color = color;
            producto.stock = stock;
            producto.save();
            return res.status(200).json({
                message: 'Producto editado',
                producto: producto
            });

        })
        .catch((err) => {
            res.status(500).json({ message: err.message });
        });
};

// exports.postEliminarProducto = (req, res) => {

//     const {idProducto} = req.params;

//     if (req.usuario.role !== 'admin') {
//         return res.status(500).json({
//             message: 'No tiene rol de admin.'
//         });
//     }

//     Producto.findById(idProducto)
//         .then(producto => {
//             if(!producto) {
//                 return res.status(500).json({
//                     message: 'No existe el producto.'
//                 });
//             }
//             return Producto.findByIdAndDelete(idProducto);
//         })
//         .then(() => {
//             return res.status(200).json({
//                 message: 'Producto eliminado.',
//             });
//         })
//         .catch(err => {
//             res.status(500).json({ message: err.message });
//         });
// };
exports.postEliminarProducto = async (req, res) => {
    const idProducto = req.params.idProducto;

    try {
        // Validar rol de admin
        if (req.usuario.role !== 'admin') {
            return res.status(500).json({ message: 'No tiene rol de admin.' });
        }

        // Buscar producto por ID
        const producto = await Producto.findById(idProducto);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        // Eliminar producto
        await Producto.findByIdAndDelete(idProducto);

        // Responder con éxito
        res.status(200).json({ message: 'Producto eliminado.' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el producto.' });
    }
};


// Administracion de usuarios 
exports.getUsuarios = (req, res,next) => {
    Usuario.find()
        .then((usuarios) => {
            res.render('admin/usuarios', {
                users: usuarios,
                titulo: "Administracion de Usuarios",
                path: "/admin/usuarios",
                autenticado: req.session.autenticado
            });
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.getCrearUsuario = (req, res,next) => {
    if (req.usuario.role !== 'admin') {
        return res.redirect('/');
    }
    const errors = validationResult(req).array();
    res.render('admin/crear-editar-usuario', {
        titulo: 'Crear usuario',
        path: '/admin/crear-usuario',
        modoEdicion: false,
        autenticado: req.session.autenticado,
        mensajeError: '',
        validationErrors: errors
    })
};

exports.postCrearUsuario = (req, res,next) => {

    const { nombre, dni, email, password, role } = req.body;
    // Captura los errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('admin/crear-editar-usuario', {
            path: '/admin/crear-usuario',
            titulo: 'Crear usuario',
            modoEdicion: false,
            mensajeError: errors.array()[0].msg,
            validationErrors: errors.array(),

            usuario: {
                nombre: nombre,
                email: email,
                dni: dni,
                role: role,
                password: password
            },
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
                role: role,
                carrito: { items: [], precioTotal: 0 }
            });
            return usuario.save();
        })
        .then(() => {
            res.redirect('/admin/usuarios');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getEditarUsuario = (req, res,next) => {

    const idUsuario = req.params.idUsuario;
    Usuario.findById(idUsuario)
        .then((usuario) => {
            if (!usuario) {
                return res.redirect('/admin/usuarios');
            }
            const errors = validationResult(req).array();
            res.render('admin/crear-editar-usuario', {
                titulo: 'Editar Usuario',
                path: '/admin/editar-usuario',
                usuario: usuario,
                modoEdicion: true,
                autenticado: req.session.autenticado,
                mensajeError: '',
                validationErrors: errors
            })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

exports.postEditarUsuario = (req, res, next) => {

    const idUsuario = req.body.idUsuario;
    const nombre = req.body.nombre;
    const email = req.body.email;
    const dni = req.body.dni;
    const role = req.body.role;
    const password = req.body.password;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/crear-editar-usuario', {
            path: '/admin/crear-editar-usuario',
            titulo: 'Editar Usuario',
            mensajeError: errors.array()[0].msg,
            modoEdicion: true,
            validationErrors: errors.array(),

            usuario: {
                nombre: nombre,
                email: email,
                dni: dni,
                role: role,
                password: password,
                _id: idUsuario
            },
        });

    }

    Usuario.findById(idUsuario)
        .then((usuario) => {
            if (req.usuario.role !== 'admin') {
                return res.redirect('/');
            }
            usuario.nombre = nombre;
            usuario.dni = dni;
            usuario.email = email;
            usuario.role = role;
            usuario.password = password;
            return usuario.save();
        })
        .then((result) => {
            console.log('Usuario guardado');
            res.redirect('/admin/usuarios');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEliminarUsuario = (req, res, next) => {

    const idUsuario = req.body.idUsuario;

    if (req.usuario.role !== 'admin') {
        return res.redirect('/');
    }
    Usuario.findByIdAndDelete(idUsuario)
        .then((result) => {
            console.log('Usuario eliminado');
            res.redirect('/admin/usuarios');
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}


exports.getPedidos = (req, res,next) => {

    Pedido
        .find()
        .then((pedidos) => {
            res.render('admin/pedidos', {
                path: '/admin/pedidos',
                titulo: 'Todos los pedidos',
                pedidos: pedidos,
                autenticado: req.session.autenticado
            })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditarPedido = (req, res,next) => {
    const idPedido = req.params.idPedido;
    console.log(idPedido)

    Pedido.findById(idPedido)
        .then((pedido) => {
            if (!pedido) {
                return res.redirect('/admin/pedidos');
            }
            res.render('admin/editar-pedido', {
                titulo: 'Editar Pedido',
                path: '/admin/editar-pedido',
                pedido: pedido,
                autenticado: req.session.autenticado
            })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postEditarPedido = (req, res, next) => {
    const idPedido = req.body.idPedido;
    const estado = req.body.estado;
    const fechaEntrega = req.body.fechaEntrega;

    Pedido.findById(idPedido)
        .then((pedido) => {
            if (req.usuario.role !== 'admin') {
                return res.redirect('/');
            }

            for (let i = 0; i < pedido.productos.length; i++) {
                const nuevaCantidad = parseInt(req.body[`cantidadProducto${i}`], 10);
                const cantidadAnterior = pedido.productos[i].cantidad;

                if (!isNaN(nuevaCantidad)) {
                    // actualizar cantidad de cada producto
                    pedido.productos[i].cantidad = nuevaCantidad;
                }

                const precio = pedido.productos[i].producto.precio;
                pedido.precioTotal = pedido.precioTotal - precio * cantidadAnterior + precio * nuevaCantidad;
            }

            pedido.estado = estado;
            pedido.fechaEntrega = fechaEntrega;
            return pedido.save();
        })
        .then((result) => {
            console.log('Pedido guardado');
            res.redirect('/admin/pedidos');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}