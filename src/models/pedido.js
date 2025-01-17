const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const pedidoSchema = new Schema({
    productos: [
        {
            producto: { type: Object, required: true },
            cantidad: { type: Number, required: true }
        }
    ],
    precioTotal: { type: Number, required: true },
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
    estado: {
        type: String,
        enum: ['pendiente', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente',
        required: true,
    },
    fechaPedido: {
        type: Date,
        default: Date.now,
        required: true
    },
    fechaEntrega: {
        type: Date,
        required: true 
    }
});

module.exports = mongoose.model('Pedido', pedidoSchema);