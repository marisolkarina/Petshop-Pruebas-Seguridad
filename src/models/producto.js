const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productoSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    },
    urlImagen: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    descuento: {
        valor: {
            type: Number,
            required: false,
            default: 0
        },
        fechaExpiracion : {
            type: Date,
            required: false
        }
        
    },
    categoria: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
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
    ],
    idUsuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
})

productoSchema.methods.agregarComentario = function(contenido, usuario) {
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

productoSchema.methods.deleteComentario = function(idUsuario, fechaComentario, role) {

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

module.exports = mongoose.model('Producto', productoSchema);