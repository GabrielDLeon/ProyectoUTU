const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const {promisify} = require('util')
const { reset } = require('nodemon')

exports.register = async (req, res) => {

   try {
   const name = req.body.name
   const user = req.body.user
   const pass = req.body.pass
   let passHash = await bcryptjs.hash(pass, 8)
   conexion.query('INSERT INTO users SET ?' , {user:user , name:name, pass:passHash} , (error, results)=> {
      if (error) {console.log(error)}
      res.redirect('/')
   })
   
   } catch (error) {
      console.log(error)
   }
}

exports.login = async (req, res) => {
   try {
      const user = req.body.user
      const pass = req.body.pass

      if(!user || !pass) {
         res.render('login', {
            alert:true,
            alertTitle: "Advertencia" ,
            alertMessage: "Ingrese usuario y/o contraseña" ,
            alertIcon: 'info' ,
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
         })
      } else {
         conexion.query('SELECT * from users WHERE user = ?', [user], async (error, results)=>{
            if(results.length == 0 || ! (await bcryptjs.compare(pass, results[0].pass))){
               res.render('login', {
                  alert:true,
                  alertTitle: "Error" ,
                  alertMessage: "Ingrese un usuario y/o contraseña válidos" ,
                  alertIcon: 'error' ,
                  showConfirmButton: true,
                  timer: false,
                  ruta: 'login'
               })
            } else {
               const id = results[0].id
               const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {

               })

               const cookiesOptions = {
                  httpOnly: true
               }
               res.cookie('jwt' , token , cookiesOptions)
               res.render('login' ,{
                  alert:true,
                  alertTitle: "Conexion exitosa" ,
                  alertMessage: "¡Login correcto!" ,
                  alertIcon: 'success' ,
                  showConfirmButton: false,
                  timer: 1000,
                  ruta: ''
               } )
            }

         })
      }

   } catch (error) {
      console.log(error)
   }
}

exports.isAuthenticated = async (req, res, next) => {
   if (req.cookies.jwt) {
      try {
         const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env,JWT_SECRETO) 
         conexion.query('SELECT * FROM users WHERE ID = ? ' , [decodificada.id], (error, results)=> {
            req.user = results[0]
            return next()
         })
      } catch (error) {
         console.log(error)
         return next()
         
      }
   } else {
      res.redirect('/login')
   }
}

exports.logout = (req, res) => {
   res.clearCookie('jwt')
   return res.redirect('/')
}