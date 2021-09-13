const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const {promisify} = require('util')
const { reset } = require('nodemon')
const { validationResult, check } = require('express-validator')

exports.resultsValidator = (req) => {
   const messages = []
   if (!validationResult(req).isEmpty()) {
     const errors = validationResult(req).array()
     for (const i of errors) {
       messages.push(i)
     }
   }
   return messages
 }


exports.register = async (req, res) => {
   try {
   const name = req.body.name
   const mailUsuario = req.body.mailUsuario
   const pass = await req.body.pass
   let passHash = await bcryptjs.hash(pass, 8)
   
   

   conexion.query('INSERT INTO cuenta SET ? ' , {mail:mailUsuario, pass:passHash , tipo:'usuario'} , (error, results)=> {
         if (error) {console.log(error) }
      })
      conexion.query('INSERT INTO users SET ?' , {mailUsuario:mailUsuario, name:name} , (error, results)=> {
         if (error) {console.log(error)}
         res.redirect('/')
      })
   
   } catch (error) {
      console.log(error)
   }
}



exports.registerCompany = async (req, res) => {

   try {
   const name = req.body.name
   const pass = req.body.pass
   const rut = req.body.rut 
   const mailEmpresa = req.body.mailEmpresa
   const razon = req.body.razon
   let passHash = await bcryptjs.hash(pass, 8)
   
   conexion.query('INSERT INTO cuenta SET ?' , {mail:mailEmpresa, pass:passHash , tipo:'empresa'} , (error, results)=> {
      if (error) {console.log(error)}
   })
   conexion.query('INSERT INTO empresas SET ?' , {name:name, rut:rut, mailEmpresa:mailEmpresa, razon:razon} , (error, results)=> {
      if (error) {console.log(error)}
      res.redirect('/')
   })
   
      } catch (error) {
      console.log(error)
   }
}

exports.login = async (req, res) => {
   try {
      const mail = req.body.mail
      const pass = req.body.pass
      
      if(!pass || !mail) {
         res.render('login', {
            alert:true,
            alertTitle: "Advertencia" ,
            alertMessage: "Ingrese mail y/o contraseña" ,
            alertIcon: 'info' ,
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
         })
      } else {
         conexion.query('SELECT * from cuenta WHERE mail = ?', [mail] , async (error, results)=>{
            if(results.length == 0 || ! (await bcryptjs.compare(pass, results[0].pass))){
               res.render('login', {
                  alert:true,
                  alertTitle: "Error" ,
                  alertMessage: "Ingrese un mail y/o contraseña válidos" ,
                  alertIcon: 'error' ,
                  showConfirmButton: true,
                  timer: false,
                  ruta: 'login'
               })
            } else {
               //inicio de sesión correcto
               const id = results[0].mail
               const token = jwt.sign({mail:id}, process.env.JWT_SECRETO, {
                   expiresIn: process.env.JWT_TIEMPO_EXPIRA
               })
               console.log("TOKEN: "+token +"para user: " + mail)
               const cookiesOptions = {
                  httpOnly: true
               }
               res.cookie('jwt' , token , cookiesOptions)
               res.render('login' ,{
                  alert:true,
                  alertTitle: "" ,
                  alertMessage: "" ,
                  alertIcon: '' ,
                  showConfirmButton: false,
                  timer: 01,
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
         const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO) 
         conexion.query('SELECT * FROM cuenta WHERE mail = ? ' , [decodificada.mail], (error, results)=> {
            req.mail = results[0]
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