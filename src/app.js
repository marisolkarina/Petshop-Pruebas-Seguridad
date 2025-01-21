const path = require('path');
const bodyParser = require('body-parser');

const express = require('express');

// const csrf = require('csurf');
const multer = require('multer');

const mongoose = require('mongoose');
const Usuario = require('./models/usuario');
const session = require('express-session');

const MongoDBStore = require('connect-mongodb-session')(session);

const MONGODB_URI = 'mongodb+srv://marisol:secreto@cluster0.71urh.mongodb.net/mascotas?retryWrites=true&w=majority&appName=Cluster0';

const adminRoutes = require('./routes/admin');
const tiendaRoutes = require('./routes/tienda');
const errorController = require('./controllers/error');
const loginRoutes = require('./routes/login');
const blogRoutes = require('./routes/blog');


const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'imagenes'));
  },
  filename: (req, file, cb) => {
    // Windows no permite guardar archivos con el signo ':'
    // Cambiamos ':' por '_'
    cb(null, new Date().toISOString().replace(/:/g, '_') + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/webp'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('imagen'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

app.use('/utils', express.static(path.join(__dirname, 'utils')));
app.use(express.static(path.join('node_modules', 'bootstrap', 'dist')));
app.use(session({ secret: 'algo muy secreto', resave: false, saveUninitialized: false, store: store }));

// app.use(csrfProtection);

app.use((req, res, next) => {
  // console.log(req.session);
  if (!req.session.usuario) {
    return next();
  }
  Usuario.findById(req.session.usuario._id)
    .then(usuario => {
      if (!usuario) {
        return next();
      }
        req.usuario = usuario;
        next();
    })
    .catch(err => {
      next(new Error(err));
    });

});

app.use((req, res, next) => {
  res.locals.autenticado = req.session.autenticado;
  // res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(loginRoutes);
app.use('/admin', adminRoutes);
app.use(tiendaRoutes);
app.use(blogRoutes);
app.get('/500',errorController.get500);
app.use(errorController.get404);

app.use((err, req, res, next) => {
  console.log(err);
  // res.redirect('/500');
  // res.status(500).render('500', {
  //   titulo: 'Error!',
  //   path: '/500',
  //   autenticado: req.session ? req.session.autenticado : false
  // });
  return res.status(500).json({ message: err.message });
})

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    Usuario.findOne().then((usuario) => {
      if (!usuario) {
        const usuario = new Usuario({
          nombre: 'Marisol Pachauri',
          email: 'mpachaurir@uni.pe', // espinozaromero1999@gmail.com
          password: 'Admin01!',   // Usuario01!
          role: 'admin',
          carrito: {
            items: [],
            precioTotal: 0
          }
        });
        usuario.save();
      }
    })
    app.listen(3000);
  })
  .catch(err => {
    // const error = new Error(err);
    // error.httpStatusCode = 500;
    // return next(error);
    return res.status(500).json({ message: err.message });
  });

module.exports = app;