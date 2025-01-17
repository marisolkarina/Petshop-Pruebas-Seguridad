const mongoose = require('mongoose');
const usuario = require('./usuario');

const Schema = mongoose.Schema;

const publicacionSchema = new Schema({
    titulo: {
        type: String,
        required: true
    },
    urlImagen: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    autor: {
        nombre: {
            type: String,
            required: true
        },
        idUsuario: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Usuario'
        }
    },
    fechaPublicacion: {
        type: Date,
        default: Date.now,
        required: true
    },
    comentarios: [
        {
            contenido: { type: String, required: true },
            usuario: { 
                nombre: {
                    type: String,
                    required: true
                },
                idUsuario: {
                    type: Schema.Types.ObjectId,
                    required: true,
                    ref: 'Usuario'
                } 
            },
            fechaComentario: { type: Date, default: Date.now }
        }
    ]
});

publicacionSchema.methods.agregarComentario = function(contenido, usuario) {
    if (!this.comentarios) {
        this.comentarios = [];
    }
    const comentariosActualizados = [...this.comentarios];

    comentariosActualizados.push({
        contenido: contenido,
        usuario: {
            nombre: usuario.nombre,
            idUsuario: usuario._id
        },
        fechaComentario: new Date()
    })

    this.comentarios = comentariosActualizados;
    return this.save();
};

publicacionSchema.methods.deleteComentario = function(idUsuario, fechaComentario, role) {

    const comentariosActualizados = this.comentarios.filter(comentario => {
        if(role==='admin'){
            return comentario.fechaComentario.toString() !== fechaComentario.toString();
        }
        return (
            (comentario.usuario.idUsuario.toString() !== idUsuario.toString()) 
            || 
            (comentario.usuario.idUsuario.toString() === idUsuario.toString() && comentario.fechaComentario.toString() !== fechaComentario.toString())
        );
    })

    this.comentarios = comentariosActualizados;
    return this.save();
};

module.exports = mongoose.model('Publicacion', publicacionSchema);