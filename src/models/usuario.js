const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    dni: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    tokenReinicio: String,
    expiracionTokenReinicio: Date,
    carrito: {
        items: [
            {
                idProducto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
                cantidad: { type: Number, required: true }
            }
        ],
        precioTotal: {
            type: Number, 
            required: true
        }
    },
    listaDeseos: [
        {
            idProducto: { type: Schema.Types.ObjectId, ref: 'Producto' }
        }
    ]
})


usuarioSchema.methods.agregarAlCarrito = function(producto, cantidadInput) {
    if (!this.carrito) {
        this.carrito = {items: [], precioTotal: 0};
    }
    const indiceEnCarrito = this.carrito.items.findIndex(cp => {
        return cp.idProducto.toString() === producto._id.toString();
    });
    let nuevaCantidad;
    const itemsActualizados = [...this.carrito.items];
  
    if (indiceEnCarrito >= 0) {

        // Verificando que no se compre mas de lo disponible en el stock
        if (cantidadInput > producto.stock) {
            cantidadInput = producto.stock;
        }

        nuevaCantidad = this.carrito.items[indiceEnCarrito].cantidad + cantidadInput;

        // Actualizando la cantidad de un producto existente en el carrito
        itemsActualizados[indiceEnCarrito].cantidad = nuevaCantidad;

    } else {
        // Verificando que no se compre mas de lo disponible en el stock
        if (cantidadInput > producto.stock) {
            cantidadInput = producto.stock;
        }

        nuevaCantidad = cantidadInput;

        // Añadiendo producto nuevo al carrito
        itemsActualizados.push({
            idProducto: producto._id,
            cantidad: nuevaCantidad
        });
    }
    
    let precioProd = Number(producto.precio);
    if (producto.descuento.valor !== 0 && producto.descuento.fechaExpiracion > new Date()) {
        precioProd = producto.precio - (producto.precio*producto.descuento.valor)/100;
    }
    
    const total = this.carrito.precioTotal + precioProd*Number(cantidadInput);
    const carritoActualizado = {
        items: itemsActualizados,
        precioTotal: total
    };
  
    this.carrito = carritoActualizado;

    // Actualizando el stock
    producto.stock = producto.stock - cantidadInput;

    // Guardando el carrito y el producto
    return Promise.all([this.save(), producto.save()]);
};


usuarioSchema.methods.deleteItemDelCarrito = function(idProducto, producto) {

    const productoEliminar = this.carrito.items.find(cp => cp.idProducto.toString() === idProducto.toString());
    const cantidadProducto = productoEliminar.cantidad;

    let precioProd = Number(producto.precio);
    if (producto.descuento.valor !== 0 && producto.descuento.fechaExpiracion > new Date()) {
        precioProd = producto.precio - (producto.precio*producto.descuento.valor)/100;
    }
    this.carrito.precioTotal = this.carrito.precioTotal - precioProd*cantidadProducto;

    const itemsActualizados = this.carrito.items.filter(item => {
        return item.idProducto.toString() !== idProducto.toString();
    });
    this.carrito.items = itemsActualizados;

    // Actualizando el stock
    producto.stock = producto.stock + cantidadProducto;
    return Promise.all([this.save(), producto.save()]);
};

usuarioSchema.methods.actualizarCantidadProducto = function (idProducto, nuevaCantidadInput, producto) {
    if (!this.carrito) {
        this.carrito = {items: [], precioTotal: 0};
    }
    const productoEditar = this.carrito.items.find(cp => cp.idProducto.toString() === idProducto.toString());
    if (!productoEditar) {
        return;
    }
    
    const cantidadAnterior = productoEditar.cantidad;

    // Verificando que no se compre mas de lo disponible
    // disponible: producto.stock + cantidadAnterior
    if (nuevaCantidadInput > producto.stock + cantidadAnterior && producto.stock !== 0) {
        nuevaCantidadInput = producto.stock + cantidadAnterior;
    }

    // Actualizar la cantidad
    productoEditar.cantidad = nuevaCantidadInput;
    
    let precioProd = Number(producto.precio);
    if (producto.descuento.valor !== 0 && producto.descuento.fechaExpiracion > new Date()) {
        precioProd = producto.precio - (producto.precio*producto.descuento.valor)/100;
    }
    // Actualizar el precio total
    this.carrito.precioTotal = this.carrito.precioTotal - (precioProd * cantidadAnterior) + (precioProd * nuevaCantidadInput);
    
    // Actualizando el stock
    producto.stock = producto.stock + cantidadAnterior - nuevaCantidadInput;
    return Promise.all([this.save(), producto.save()]);
     
}

usuarioSchema.methods.limpiarCarrito = function() {
    this.carrito = { items: [], precioTotal: 0 };
    return this.save();
};


usuarioSchema.methods.agregarAListaDeseos = function(idProducto) {
    const indiceProducto = this.listaDeseos.findIndex((pl) => {
        return pl.idProducto.toString() === idProducto.toString();
    });

    if (indiceProducto < 0) {
        this.listaDeseos.push({ idProducto: idProducto });
    }

    return this.save();
}

usuarioSchema.methods.deleteProdListaDeseos = function(idProducto) {
    this.listaDeseos = this.listaDeseos.filter((pl) =>
        pl.idProducto.toString() !== idProducto.toString()
    );
    return this.save();
}

module.exports = mongoose.model('Usuario', usuarioSchema);