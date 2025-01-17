const Publicacion = require('../models/publicacion');
const ITEMS_POR_PAGINA = 2;

exports.getPublicaciones = (req, res) => {
    const pagina = +req.query.pagina || 1;
    let nroPublicaciones;

    Publicacion.find()
        .countDocuments()
        .then((nroDocs) => {
            nroPublicaciones = nroDocs;
            return Publicacion.find()
                .skip((pagina-1) * ITEMS_POR_PAGINA)
                .limit(ITEMS_POR_PAGINA)
        })
        .then((publicaciones) => {
            const publicacionesCortas = publicaciones.map(publicacion => {
                return {
                    ...publicacion._doc,
                    descripcionCorta: publicacion.descripcion.length>70 ? publicacion.descripcion.substring(0,70) + "..." : publicacion.descripcion
                }
            })
            res.render('blog/lista-publicaciones', {
                publicaciones: publicacionesCortas,
                titulo: "Blog", 
                path: "/blog",
                autenticado: req.session.autenticado,
                usuario: req.usuario,
                usuario: req.usuario,
                paginaActual: pagina,
                tienePaginaSiguiente: ITEMS_POR_PAGINA * pagina < nroPublicaciones,
                tienePaginaAnterior: pagina > 1,
                paginaSiguiente: pagina + 1,
                paginaAnterior: pagina - 1,
                ultimaPagina: Math.ceil(nroPublicaciones / ITEMS_POR_PAGINA)
            });
        }).catch((err) => {
            console.log(err);
        });
};

exports.getCrearPublicacion = (req, res) => {
    res.render('blog/crear-editar-publicacion', {
        titulo: 'Crear Publicacion',
        path: '/crear-publicacion',
        autenticado: req.session.autenticado,
        modoEdicion: false
    })
};

exports.postCrearPublicacion = (req, res) => {
    const titulo = req.body.titulo;
    const urlImagen = req.body.urlImagen;
    const descripcion = req.body.descripcion;

    const publicacion = new Publicacion({
        titulo: titulo,
        urlImagen: urlImagen,
        descripcion: descripcion,
        autor: {
            nombre: req.usuario.nombre,
            idUsuario: req.usuario
        },
        comentarios: []
    });

    publicacion
        .save()
        .then((result) => {
            console.log('Publicacion creada');
            res.redirect('/blog');
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getEditarPublicacion = (req, res) => {
    const idPublicacion = req.params.idPublicacion;

    Publicacion.findById(idPublicacion)
        .then((publicacion) => {
            
            res.render('blog/crear-editar-publicacion', {
                titulo: 'Editar Producto',
                path: '/editar-publicacion',
                publicacion: publicacion,
                modoEdicion: true,
                autenticado: req.session.autenticado
            })
        }).catch((err) => {
            console.log(err);
        });
}

exports.postEditarPublicacion = (req, res, next) => {
    const idPublicacion = req.body.idPublicacion;
    const titulo = req.body.titulo;
    const urlImagen = req.body.urlImagen;
    const descripcion = req.body.descripcion;

    Publicacion.findById(idPublicacion)
        .then((publicacion) => {

            // en la vista esta la condicion para editar si es admin o autor de la publicacion
            publicacion.titulo = titulo;
            publicacion.urlImagen = urlImagen;
            publicacion.descripcion = descripcion;
            
            return publicacion.save();

        })
        .then((result) => {
            res.redirect('/blog');
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postEliminarPublicacion = (req, res) => {
    const idPublicacion = req.body.idPublicacion;

    Publicacion.deleteOne({_id: idPublicacion})
        .then((result) => {
            console.log('Producto eliminado');
            res.redirect('/blog');
        }).catch((err) => {
            console.log(err);
        });
}

exports.getPublicacion = (req, res) => {
    const idPublicacion = req.params.idPublicacion;

    Publicacion.findById(idPublicacion)
        .then((publicacion) => {
            res.render('blog/publicacion-detalle', {
                publicacion: publicacion,
                titulo: 'Publicacion', 
                path: '/blog',
                autenticado: req.session.autenticado,
                comentarios: publicacion.comentarios,
                usuario: req.usuario
            });
        }).catch((err) => {
            console.log(err);
        });
}

exports.postComentar = (req, res) => {
    const contenido = req.body.comentario;
    const usuario = req.usuario;
    const idPublicacion = req.body.idPublicacion;

    Publicacion.findById(idPublicacion)
        .then((publicacion) => {
            return publicacion.agregarComentario(contenido, usuario);
        })
        .then((result) => {
            res.redirect(`/blog/${idPublicacion}`);
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.postEliminarComentario = (req, res, next) => {
    const idPublicacion = req.body.idPublicacion;
    const idUsuario = req.usuario._id;
    const fechaComentario = req.body.fechaComentario;
    const role = req.usuario.role;
    Publicacion.findById(idPublicacion)
        .then((publicacion) => {
            
            return publicacion.deleteComentario(idUsuario, fechaComentario, role);
        })
        .then((result) => {
            res.redirect(`/blog/${idPublicacion}`);
        })
        .catch((err) => {
            console.log(err);
        });

}