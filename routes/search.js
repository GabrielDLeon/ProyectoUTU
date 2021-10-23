const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const mysql = require("mysql");
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

router.post('/', async (req, res) => {
    const { palabra } = req.body;
    if (palabra){
        const path = '/search?key='+palabra;
        res.redirect(path);
    } else if (!palabra) {
        res.redirect('/');
    }
})

function addDays(date, days) {
    const copy = new Date(Number(date))
    copy.setDate(date.getDate() + days)
    return copy
}

router.get('/', authController.isLoggedIn, async (req, res) => {
    const query = req.query;
    const {key, sale, newest, minPrice, maxPrice} = query;
    let array = [];

    // Variables almacena todos los valores que se extraerán de la consulta SQL
    let variables = 'nroPublicacion, fotos.imagen AS imagen,precio, titulo, precio-precio*descuento.porcentaje/100 AS descuento, descripcion, producto, cuenta_empresa.nombre AS vendedor, categoria, genero, material, marca'

    // Se verifica que filtros se están usando en la URL
    if (key) {array.push('(titulo LIKE "%'+key+'%" OR categoria LIKE "%'+key+'%" OR genero LIKE "%'+key+'%" OR material LIKE "%'+key+'%" OR marca LIKE "%'+key+'%" OR cuenta_empresa.nombre LIKE "%'+key+'%")')}
    if (sale==1)  {array.push('(descuento.porcentaje > 0)')}
    if (newest==1)  {
        const date = new Date();
        const newDate = addDays(date, - process.env.NEWEST_PUBLICATION);
        let string = newDate.getFullYear()+'-'+(date.getMonth()+1)+'-'+newDate.getDate();
        array.push('(fechaPublicacion >= "'+string+'")');
        variables+= ', fechaPublicacion';
    }
    if (minPrice) {array.push('(precio >'+minPrice+' OR (precio-precio*descuento.porcentaje/100) >'+minPrice+')')}
    if (maxPrice) {array.push('(precio <'+maxPrice+' OR (precio-precio*descuento.porcentaje/100) <'+maxPrice+')')}

    // Template almacena una consulta de SQL donde acumula todos los filtros de la búsqueda
    let template = 'SELECT '+variables+' FROM (publicacion LEFT JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email LEFT JOIN fotos ON fotos.publicacion = publicacion.nroPublicacion INNER JOIN producto ON publicacion.producto = producto.idProducto LEFT JOIN descuento ON descuento.publication = publicacion.nroPublicacion) ';

    // Añade los filtros de la búsqueda a la consulta SQL (template)
    template += 'WHERE ';
    let i = 0; // Contador de filtros
    array.forEach(string => {
        
        if (i < (array.length-1)){  // Cuando el contador de filtros no llegó al final de la array
            template += string.valueOf();
            template += ' AND ';
            i++;
        } else { template += string.valueOf() } // Cuando el contador llega al final
    });

    // Se completa el template con el GROUP BY para dar por finalizado la consulta
    template += ' GROUP BY nroPublicacion;';

    db.query('SELECT * FROM perfil WHERE perfil.email LIKE "%"?"%"', [key], (error, shops) => {
        db.query(template, (error, recommendations) => {
            res.render('search', {
                recommendations,
                palabra: key,
                shops: shops,
                user: req.user,
                title: "Búsqueda"
            });
        });
    });
});

module.exports = router;