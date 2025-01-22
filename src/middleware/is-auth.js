module.exports= (req,res,next) =>{
    if (!req.session.autenticado){
        return res.status(500).json({message: 'No está autenticado.'});
        // return res.redirect('/ingresar');
    }
    next();
}