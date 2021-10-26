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

function hi (){
    const saludo = "hola";
    return saludo;
}

router.get('/', authController.isLoggedIn, async (req, res) => {
    const query = req.query;
    const {key, sale, newest, minPrice, maxPrice, top} = query;
    let array = [];
    let condicion = '', auxiliar = '', join = '';

    // Creación de las Variables
    let variables = 'nroPublicacion, titulo, descripcion, precio, descuento, nombreVendedor, categoria, genero, material, marca, imagen';

    // Identificación de los filtros se están usando en la URL
    if (key) {array.push('(titulo LIKE "%'+key+'%" OR categoria LIKE "%'+key+'%" OR genero LIKE "%'+key+'%" OR material LIKE "%'+key+'%" OR marca LIKE "%'+key+'%" OR nombreVendedor LIKE "%'+key+'%")')}
    if (top==1) {
        variables+= ', COUNT(favoritos.publicacion) AS cantFavoritos'
        auxiliar+= 'HAVING (COUNT(favoritos.publicacion)) ORDER BY cantFavoritos DESC LIMIT 8'
        join+= ' INNER JOIN favoritos ON favoritos.publicacion = view_publicaciones.nroPublicacion'
    }
    if (sale==1)  {array.push('(porcentaje > 0)')}
    if (newest==1)  {
        const date = new Date();
        const newDate = addDays(date, - process.env.NEWEST_PUBLICATION);
        let string = newDate.getFullYear()+'-'+(date.getMonth()+1)+'-'+newDate.getDate();
        array.push('(fechaPublicacion >=  "'+string+'")');
        variables+= ', fechaPublicacion';
    }
    if (minPrice) {array.push('(precio >= '+minPrice+' OR descuento >= '+minPrice+')')}
    if (maxPrice) {array.push('(precio <= '+maxPrice+' OR descuento <= '+maxPrice+')')}


    // Creación de las Condiciones
    if (array.length>0){
        condicion += 'WHERE ';
        let i = 0; // Contador de filtros
        array.forEach(string => {
            if (i < (array.length-1)){  // Cuando el contador de filtros no llegó al final de la array
                condicion += string.valueOf();
                condicion += ' AND ';
                i++;
            } else { condicion += string.valueOf() } // Cuando el contador llega al final
        });
    }

    // Template almacena toda la consulta + variables + join + condiciones + auxiliares
    let template = 'SELECT '+variables+' FROM (view_publicaciones'+join+') '+condicion+' GROUP BY (nroPublicacion) '+auxiliar;
    // console.log(template);

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