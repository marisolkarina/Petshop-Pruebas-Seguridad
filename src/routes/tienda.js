const express = require('express');

const tiendaController = require('../controllers/tienda');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
const { check, body } = require('express-validator');

router.get('/', tiendaController.getIndex);
router.get('/productos', tiendaController.getProductos);
router.post('/productos', tiendaController.postProductoPalabra);

//filtros por categoria
router.get('/productos/perro', tiendaController.getProductosPorCategoria('perro'));
router.get('/productos/gato', tiendaController.getProductosPorCategoria('gato'));
router.get('/productos/conejo', tiendaController.getProductosPorCategoria('conejo'));
router.get('/productos/hamster', tiendaController.getProductosPorCategoria('hamster'));

//filtrar por precio
router.post('/productos/filtrados-por-precio', tiendaController.postProductosPorPrecio);

//ordenar por precio o alfabeticamente
router.get('/productos/ordenar/menor-a-mayor', tiendaController.getProductosMenorMayor);
router.get('/productos/ordenar/mayor-a-menor', tiendaController.getProductosMayorMenor);
router.get('/productos/ordenar/alfabeticamente', tiendaController.getProductosAlfabeticamente);
//filtrar por color
router.get('/productos/rojo', tiendaController.getProductosPorColor('rojo'));
router.get('/productos/azul', tiendaController.getProductosPorColor('azul'));
router.get('/productos/celeste', tiendaController.getProductosPorColor('celeste'));
router.get('/productos/blanco', tiendaController.getProductosPorColor('blanco'));
router.get('/productos/marron', tiendaController.getProductosPorColor('marron'));

//ver detalle de producto
router.get('/productos/:idProducto', tiendaController.getProducto);

//Carrito
router.get('/carrito', isAuth, tiendaController.getCarrito);
router.post('/agregar-carrito',
    [
        body('cantidad')
          .isInt({ gt: 0 }).withMessage('La cantidad debe ser un número entero mayor a 0')
      ]
    ,isAuth,  tiendaController.postCarrito);

router.post('/eliminar-producto', isAuth,tiendaController.postEliminarProductoCarrito)

router.post('/actualizar-cantidad', isAuth, tiendaController.postActualizarCantidadCarrito);

// Mis pedidos
router.get('/pedidos', isAuth, tiendaController.getMisPedidos);
router.post('/crear-pedido',
    [
        body('cantidad')
          .isInt({ gt: 0 }).withMessage('La cantidad debe ser un número entero mayor a 0')
      ]
    ,isAuth, tiendaController.postMisPedidos);
router.post('/cancelar-pedido', isAuth, tiendaController.postCancelarPedido);

router.get('/pedidos/:idPedido', isAuth, tiendaController.getComprobante);

// Promociones (productos con descuentos)
router.get('/promociones', tiendaController.getPromociones);

//Detalles de mi cuenta
router.get('/detalles-cuenta', isAuth, tiendaController.getDetallesCuenta);

// Reseña, comentarios del producto
router.post('/producto/comentar', isAuth, tiendaController.postComentar);
router.post('/producto/eliminar-comentario', isAuth, tiendaController.postEliminarComentario);

//Lista de deseos
router.get('/lista-deseos', isAuth, tiendaController.getMiListaDeseos);
router.post('/agregar-lista-deseos', isAuth, tiendaController.postAgregarListaDeseos);
router.post('/eliminar-prod-lista-deseos', isAuth, tiendaController.postEliminarProdListaDeseos);

module.exports = router;