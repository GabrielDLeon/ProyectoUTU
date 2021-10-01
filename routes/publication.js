const express = require('express');
const authController = require('../controllers/auth');
const mysql = require("mysql");
const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
  });

router.get('/', (req, res) => {
    res.render('publication/publication', {
        user: req.user,
        title: "Klouts"
    });
});


// Enviar formulario de pregunta
router.post('/question/:id', authController.isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { mensaje } = req.body;
    const currentDate = new Date();
    const newQuestion = {
        mensaje,
        fechaPregunta: currentDate,
        remitente: req.user.email,
        publicacion: id
    };
    if (!mensaje) {
        const path = '/publication/' + id + '/#seccion-preguntas';
        return res.redirect(path);
    }
    await db.query('INSERT INTO `preguntas` (`mensaje`, `remitente`, `publicacion`, `fechaPregunta`) VALUES (?, ?, ?, ?)', [newQuestion.mensaje, newQuestion.remitente, newQuestion.publicacion, newQuestion.fechaPregunta], (error, result) => {
        console.log('Pregunta enviada correctamente');
        const path = '/publication/' + id + '/#seccion-preguntas';
        res.redirect(path);
    });
})

// Enviar formulario de respuesta del vendedor
router.post('/respuesta/:id', authController.isLoggedIn, async (req, res) => {
    const { id } = req.params
    await db.query('SELECT idPregunta, nroPublicacion, mensaje, fechaPregunta, cuenta_empresa.nombre AS vendedor, cuenta_personal.nombre AS remitente, respuesta FROM (publicacion INNER JOIN preguntas ON publicacion.nroPublicacion = preguntas.publicacion INNER JOIN cuenta_personal ON cuenta_personal.email = preguntas.remitente INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email) WHERE idPregunta = ? ORDER BY fechaPregunta DESC', [id], async (error, questions) => {
        console.log("questions:")
        console.log(questions);
        const nroPublicacion = questions[0].nroPublicacion
        if (questions.length > 0) {
            const { id } = req.params;
            const idPregunta = questions[0].idPregunta
            console.log("ID PREGUNTA: ")
            console.log(idPregunta)
            const { respuesta } = req.body;
            if (!respuesta) {
                const path = '/publication/' + id + '/#seccion-preguntas';
                return res.redirect(path);
            }
            await db.query('UPDATE preguntas SET ? WHERE idPregunta = ?', [{ respuesta: respuesta }, idPregunta]);
            console.log('Respuesta enviada correctamente');
            const path = '/publication/' + nroPublicacion + '/#seccion-preguntas';
            return res.redirect(path);
        }
    })
});
        

// Entrar a una publicacion desde URL con el ID
router.get('/:id', authController.isLoggedIn, async (req, res) => {
    const {id} = req.params;
    await db.query('SELECT nroPublicacion, precio, titulo, descripcion, producto, cuenta_empresa.email AS vendedorEmail, cuenta_empresa.nombre AS vendedor FROM (publicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email) WHERE nroPublicacion = ?',[id], async (error, result) => { 
        // console.log(result);
        if (result.length>0){
            const vendedor = result[0].vendedorEmail;
            await db.query('SELECT idPregunta, mensaje, fechaPregunta, fechaRespuesta, cuenta_empresa.nombre AS vendedor, cuenta_personal.nombre AS remitente, respuesta, cuentas.tipo FROM (publicacion INNER JOIN preguntas ON publicacion.nroPublicacion = preguntas.publicacion INNER JOIN cuenta_personal ON cuenta_personal.email = preguntas.remitente INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email INNER JOIN cuentas ON cuentas.email = cuenta_empresa.email) WHERE nroPublicacion = ? ORDER BY fechaPregunta DESC',[id], async (error, questions) => {
                // console.log("result:")
                // console.log(result)
                // console.log("questions:")
                // console.log(questions);
                // console.log("EL REQ.USER ES:")
                // console.log(req.user);
                
                await db.query('SELECT nroPublicacion, precio, titulo FROM `publicacion` WHERE vendedor = ? AND nroPublicacion != ?',[vendedor , id], (error, products) => {
                    res.render('publication/publication', {
                        user: req.user,
                        products,
                        questions,
                        publication: result[0],
                        title: result[0].titulo
                    });
                })
            })
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;