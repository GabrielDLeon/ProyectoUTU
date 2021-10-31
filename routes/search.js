const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const mysql = require("mysql");
const { filter } = require('lodash');
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

router.post('/', async (req, res) => {
    const { palabra } = req.body;
    if (palabra){
        const path = '/search?key='+palabra+'&page=1';
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

function paginations(Page, quantity, query, path, callback) {
    const page = parseInt(Page);
    let end = (page * quantity);
    let start = end - quantity;
    db.query(query, [quantity, start], (error, recommendations) => {
        if (recommendations.length > 0) {
            db.query(query, [quantity, (start + quantity)], (error, existNextPage) => {
                if (existNextPage.length > 0) { var pagination = { lastPage: page - 1, actualPage: page, nextPage: page + 1, path} }
                else { var pagination = { lastPage: page - 1, actualPage: page, path} }
                return (callback(null, {
                    recommendations,
                    pagination,
                }))
            })
        } else {
            return callback();
        }
    });
}

router.get('/', authController.isLoggedIn, async (req, res) => {    
    let array = [];
    let pattern = [];
    const query = req.query;
    let path = '/search?';
    let condicion = '', auxiliar = '', join = '';
    const { key, sale, newest, minPrice, maxPrice, top } = query;
    // Creación de las Variables
    let variables = 'nroPublicacion, titulo, descripcion, precio, descuento, nombreVendedor, categoria, genero, material, marca, imagen';

    // Identificación de los filtros se están usando en la URL
    if (key) {
        array.push('(titulo LIKE "%' + key + '%" OR categoria LIKE "%' + key + '%" OR genero LIKE "%' + key + '%" OR material LIKE "%' + key + '%" OR marca LIKE "%' + key + '%" OR nombreVendedor LIKE "%' + key + '%")')
        pattern.push('key=' + key);
    }
    if (top == 1) {
        variables += ', COUNT(favoritos.publicacion) AS cantFavoritos'
        auxiliar += 'HAVING (COUNT(favoritos.publicacion)) ORDER BY cantFavoritos '
        join += ' INNER JOIN favoritos ON favoritos.publicacion = view_publicaciones.nroPublicacion'
        pattern.push('top=1');
    }
    if (sale == 1) {
        array.push('(porcentaje > 0)')
        pattern.push('sale=1');
    }
    if (newest == 1) {
        const date = new Date();
        const newDate = addDays(date, - process.env.NEWEST_PUBLICATION);
        let string = newDate.getFullYear() + '-' + (date.getMonth() + 1) + '-' + newDate.getDate();
        array.push('(fechaPublicacion >=  "' + string + '")');
        variables += ', fechaPublicacion';
        pattern.push('newest=1');
    }
    if (minPrice) {
        array.push('(precio >= ' + minPrice + ' OR descuento >= ' + minPrice + ')')
        pattern.push('minPrice=' + minPrice);
    }
    if (maxPrice) {
        array.push('(precio <= ' + maxPrice + ' OR descuento <= ' + maxPrice + ')')
        pattern.push('maxPrice=' + maxPrice);
    }

    // Creación de las Condiciones
    if (array.length > 0) {
        condicion += 'WHERE ';
        let i = 0; // Contador de filtros
        array.forEach(string => {
            if (i < (array.length - 1)) {  // Cuando el contador de filtros no llegó al final de la array
                condicion += string.valueOf();
                condicion += ' AND ';
                i++;
            } else { condicion += string.valueOf() } // Cuando el contador llega al final
        });
    }

    if (pattern.length > 0) {
        pattern.forEach(element => {
            path += element.valueOf();
            path += '&'
        });
    }

    // Template almacena toda la consulta + variables + join + condiciones + auxiliares
    let template = 'SELECT ' + variables + ' FROM (view_publicaciones' + join + ') ' + condicion + ' GROUP BY (nroPublicacion) ' + auxiliar + 'LIMIT ? OFFSET ?';
    if (req.query.page) {
        const {page} = req.query;
        db.query('SELECT * FROM perfil WHERE perfil.email LIKE "%"?"%"', [key], (error, shops) => {
            paginations(page, 12, template, path, function (error, result) {
                if (result) {
                    res.render('search', {
                        recommendations: result.recommendations,
                        pagination: result.pagination,
                        palabra: key,
                        shops: shops,
                        user: req.user,
                        title: "Búsqueda"
                    });
                } else {
                    res.render('search', {
                        palabra: key,
                        shops: shops,
                        user: req.user,
                        title: "Búsqueda"
                    });
                }
            });
        });
    } else {
        res.redirect(path+'page=1');
    }
});

module.exports = router;