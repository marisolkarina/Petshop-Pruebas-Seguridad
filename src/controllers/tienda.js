const Producto = require('../models/producto');
const Pedido = require('../models/pedido');
const Usuario = require('../models/usuario');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');


exports.getProductos = (req, res) => {

    Producto.find()

        .then((productos) => {
            res.status(200).json({
                message: 'Productos de la tienda',
                prods: productos
            })
        }).catch((err) => {
            res.status(500).json({ message: err.message });
        });
};

exports.getIndex = (req, res) => {

    Producto.find()
        .then((productos) => {
            res.render('tienda/index', {
                prods: productos,
                titulo: "Pagina principal de la Tienda",
                path: "/",
                autenticado: req.session.autenticado
            });
        }).catch((err) => {
            res.status(500).json({ message: err.message });
        });
}

exports.getProductosPorCategoria = (req, res) => {
    const {categoria} = req.params;

        Producto.find()
            .then((productosObtenidos) => {
                const productosFiltrados = productosObtenidos.filter(producto =>
                    producto.categoria.toLowerCase() === categoria.toLowerCase()
                );

                res.status(200).json({
                    message: 'Productos Filtrados',
                    prods: productosFiltrados
                });
            }).catch((err) => {
                res.status(500).json({ message: err.message });
            });
    // }
}

//Filtrar por precio
exports.postProductosPorPrecio = (req, res) => {

    const {precioMin, precioMax} = req.body;
    
    Producto.find()

        .then((productosObtenidos) => {
            let productosFiltrados;
            if(!precioMin) {
                productosFiltrados = productosObtenidos.filter(producto => producto.precio <= precioMax );
                console.log(productosFiltrados);
            } else if (!precioMax) {
                productosFiltrados = productosObtenidos.filter(producto => producto.precio >= precioMin );
            } else {
                productosFiltrados = productosObtenidos.filter(producto => producto.precio >= precioMin && producto.precio <= precioMax );
            }

            res.status(200).json({
                message: 'Productos segun precio',
                prods: productosFiltrados
            });

        }).catch((err) => {
            res.status(500).json({ message: err.message });
        });
}

//Ordenar productos alfabeticamente o por precio ascendente/descendente
//       /productos/ordenar/:orden
exports.getProductosOrdenados = (req, res) => {

    const {orden} = req.params

    Producto.find()

        .then((productosObtenidos) => {
            let productosOrdenados;
            if (orden === 'alfabeticamente') {
                productosOrdenados = productosObtenidos.sort((prod1, prod2) => prod1.nombre.localeCompare(prod2.nombre));
            } else if (orden === 'precio-ascendente') {
                productosOrdenados = productosObtenidos.sort((prod1, prod2) => prod1.precio - prod2.precio);
            } else if (orden === 'precio-descendente') {
                productosOrdenados = productosObtenidos.sort((prod1, prod2) => prod2.precio - prod1.precio);
            }
            res.status(200).json({
                message: 'Productos ordenados',
                prods: productosOrdenados
            });

        }).catch((err) => {
            res.status(500).json({ message: err.message });
        });

}


// filtrar productos por color
exports.getProductosPorColor = (req, res) => {

    const {color} = req.params;

    Producto.find()
        .then((productosObtenidos) => {
            const productosFiltrados = productosObtenidos.filter(producto =>
                producto.color.toLowerCase() === color.toLowerCase()
            );

            res.status(200).json({
                message: 'Productos ordenados',
                prods: productosFiltrados
            });
        }).catch((err) => {
            res.status(500).json({ message: err.message });
        });
}

//ver detalle de un producto
exports.getProducto = (req, res) => {
    const {idProducto} = req.params;

    Producto.findById(idProducto)
        .then((producto) => {
            res.status(200).json({
                message: 'Detalle de producto',
                producto: producto
            });
        }).catch((err) => {
            res.status(500).json({ message: err.message });
        });
}

//mostrar productos buscados por palabra
exports.postProductoPalabra = (req, res) => {
    const {stringBuscado} = req.body;

    Producto.find()
        .then((productos) => {
            const productosBuscados = productos.filter(prod => prod.nombre.toLowerCase().includes(stringBuscado.toLowerCase()));
            res.status(200).json({
                message: 'Productos buscados',
                prods: productosBuscados
            });
        }).catch((err) => {
            res.status(500).json({ message: err.message });
        });

}

//comentarios acerca del producto

exports.postComentar = (req, res) => {
    const contenido = req.body.comentario;
    const usuario = req.usuario;
    const idProducto = req.body.idProducto;

    Producto.findById(idProducto)
        .then((producto) => {
            return producto.agregarComentario(contenido, usuario);
        })
        .then((result) => {
            res.redirect(`/productos/${idProducto}`);
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.postEliminarComentario = (req, res) => {
    const idProducto = req.body.idProducto;
    const idUsuario = req.usuario._id;
    const fechaComentario = req.body.fechaComentario;
    const role = req.usuario.role;
    Producto.findById(idProducto)
        .then((producto) => {
            return producto.deleteComentario(idUsuario, fechaComentario, role);
        })
        .then((result) => {
            res.redirect(`/productos/${idProducto}`);
        })
        .catch((err) => {
            console.log(err);
        });

}


exports.getCarrito = (req, res) => {
    req.usuario
        .populate('carrito.items.idProducto')
        .then((usuario) => {
            const productosEnCarrito = usuario.carrito.items;
            const total = usuario.carrito.precioTotal;
            res.render('tienda/carrito', {
                path: '/carrito',
                titulo: 'Mi Carrito',
                items: productosEnCarrito,
                total: total,
                autenticado: req.session.autenticado
            })
        })
        .catch((err) => {
            console.log(err);
        });
};


exports.postCarrito = (req, res) => {
    const idProducto = req.body.idProducto;
    const cantidad = parseInt(req.body.cantidad, 10);

    Producto.findById(idProducto)
        .then((producto) => {
            if (producto.stock === 0) {
                console.log('no hay stock')
                return;
            }
            return req.usuario.agregarAlCarrito(producto, cantidad);
        })
        .then((result) => {
            // console.log(result);
            res.redirect('/carrito');
        })
        .catch((err) => {
            console.log(err);
        });

}

// exports.postEliminarProductoCarrito = (req, res) => {
//     const idProducto = req.body.idProducto;

//     Producto.findById(idProducto)
//         .then((producto) => {
//             if (!producto) {
//                 return res.redirect('/carrito'); // Si no existe, redirige directamente
//             }
//             return req.usuario.deleteItemDelCarrito(idProducto, producto);
//         })
//         .then((result) => {
//             res.redirect('/carrito');
//         })
//         .catch((err) => {
//             console.log(err);
//             res.redirect('/carrito'); // Redirige incluso si hay errores
//         });

// }

exports.postEliminarProductoCarrito = async (req, res) => {
    try {
        const idProducto = req.body.idProducto;

        const producto = await Producto.findById(idProducto);
        if (!producto) {
            return res.redirect('/carrito'); // Producto no encontrado
        }

        const resultado = await req.usuario.deleteItemDelCarrito(idProducto, producto);
        if (!resultado) {
            console.error('Error eliminando el producto del carrito');
        }

        res.redirect('/carrito'); // Redirige si todo salió bien
    } catch (err) {
        console.error(err);
        res.redirect('/carrito'); // Redirige en caso de error
    }
};


exports.postActualizarCantidadCarrito = (req, res, next) => {
    const idProducto = req.body.idProducto;
    const nuevaCantidad = parseInt(req.body.cantidad, 10);

    Producto.findById(idProducto)
        .then((producto) => {
            return req.usuario.actualizarCantidadProducto(idProducto, nuevaCantidad, producto);
        })
        .then((result) => {
            res.redirect('/carrito');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};


exports.getMisPedidos = (req, res, next) => {
    Pedido.find({ 'usuario.idUsuario': req.usuario._id })
        .then((pedidos) => {
            res.render('user/pedidos', {
                path: '/pedidos',
                titulo: 'Mis pedidos',
                pedidos: pedidos,
                usuario: req.usuario
            })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}


exports.postMisPedidos = (req, res) => {
    req.usuario
        .populate('carrito.items.idProducto')
        .then((usuario) => {
            // construir un array productosDelPedido 
            // con objetos de 2 propiedades: cantidad y producto
            const productosDelPedido = usuario.carrito.items.map(item => {
                // traer los detalles del producto ._doc
                return { cantidad: item.cantidad, producto: { ...item.idProducto._doc } };
            });
            const precioTotal = usuario.carrito.precioTotal;
            const pedido = new Pedido({
                productos: productosDelPedido,
                precioTotal: precioTotal,
                usuario: {
                    nombre: req.usuario.nombre,
                    idUsuario: req.usuario
                },
                estado: 'pendiente',
                fechaPedido: new Date(),
                fechaEntrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias despues del pedido
            })
            return pedido.save();
        })
        .then(result => {
            return req.usuario.limpiarCarrito();
        })
        .then(() => {
            res.redirect('/pedidos');
        })
        .catch((err) => {
            console.log(err)
        });
}

exports.postCancelarPedido = (req, res) => {
    const idPedido = req.body.idPedido;

    Pedido.findById(idPedido)
        .then((pedido) => {
            pedido.estado = 'cancelado';
            return pedido.save();
        })
        .then((result) => {
            console.log('Pedido cancelado');
            res.redirect('/pedidos');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
        });
}

//Promociones
exports.getPromociones = (req, res, next) => {
    let fechaActual = new Date();
    Producto.find()
        .then((productosObtenidos) => {
            const productosConDescuento = productosObtenidos.filter(producto =>
                producto.descuento.valor !== 0 && producto.descuento.fechaExpiracion>fechaActual
            );

            res.render('tienda/promociones', {
                prods: productosConDescuento,
                titulo: 'Promociones',
                path: '/promociones',
                autenticado: req.session.autenticado
            })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

//Detalles de mi cuenta
exports.getDetallesCuenta = (req, res, next) => {
    Usuario.findById(req.usuario._id)
        .then((usuario) => {
            res.render('user/detalles-cuenta', {
                path: '/detalles-cuenta',
                titulo: 'Mi Cuenta',
                usuario: usuario,
                autenticado: req.session.autenticado
            })
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getComprobante = (req, res, next) => {
    const idPedido = req.params.idPedido;
    Pedido.findById(idPedido)
        .then(pedido => {
            if (!pedido) {
                return next(new Error('No se encontro el pedido'));
            }
            if (pedido.usuario.idUsuario.toString() !== req.usuario._id.toString()) {
                return next(new Error('No Autorizado'));
            }
            const nombreComprobante = 'comprobante-' + idPedido + '.pdf';
            // const nombreComprobante = 'comprobante' + '.pdf';
            const rutaComprobante = path.join('data', 'comprobantes', nombreComprobante);


            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'attachment ; filename="' + nombreComprobante + '"'
            );
            pdfDoc.pipe(fs.createWriteStream(rutaComprobante));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(20).text('Comprobante', {
                underline: true
            });
            pdfDoc.fontSize(12).text('---------------------------------------');
            let precioTotal = 0;
            pedido.productos.forEach(prod => {
                let precioProd = Number(prod.producto.precio);
                if (prod.producto.descuento && prod.producto.descuento.valor && prod.producto.descuento.fechaExpiracion > new Date()) {
                    precioProd = precioProd - (precioProd * prod.producto.descuento.valor) / 100;
                }
                
                precioTotal += prod.cantidad * precioProd;
                pdfDoc
                    .fontSize(12)
                    .text(
                        prod.producto.nombre +
                        ' - ' +
                        prod.cantidad +
                        ' x ' +
                        'S/ ' +
                        precioProd
                    );
            });
            pdfDoc.text('---------------------------------------');
            pdfDoc.fontSize(18).text('Precio Total: S/' + precioTotal);

            pdfDoc.end();

        })
        .catch(err => next(err));
};

// Lista de deseos

exports.getMiListaDeseos = (req, res, next) => {
    req.usuario
        .populate('listaDeseos.idProducto')
        .then((usuario) => {
            const productosEnListaDeseos = usuario.listaDeseos;
            res.render('user/lista-deseos', {
                path: '/lista-deseos',
                titulo: 'Mi Lista de Deseos',
                productosEnListaDeseos: productosEnListaDeseos,
                autenticado: req.session.autenticado,
                usuario: req.usuario
            })
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postAgregarListaDeseos = (req, res, next) => {
    const idProducto = req.body.idProducto;

    Producto.findById(idProducto)
        .then((producto) => {
            return req.usuario.agregarAListaDeseos(idProducto);
        })
        .then((result) => {
            res.redirect('/lista-deseos');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postEliminarProdListaDeseos = (req, res) => {
    const idProducto = req.body.idProducto;

    Producto.findById(idProducto)
        .then((producto) => {
            return req.usuario.deleteProdListaDeseos(idProducto);
        })
        .then((result) => {
            res.redirect('/lista-deseos');
        })
        .catch((err) => {
            console.log(err);
        });
}
