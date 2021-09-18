const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

exports.deleteUser = async (req, res, next) => {

  if(req.cookies.jwt) {
    try {
      //1) verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      console.log(decoded);
      //2) Check if the user still exists
      db.query('SELECT * FROM cuenta WHERE mail = ?', [decoded.id], (error, result) => {
        console.log(result);

        if(!result) {
          return next();
        }

        req.user = result[0];
        console.log("user is")
        console.log(req.user);
        return next();

      });
    } catch (error) {
      console.log(error);
      return next();
    }
  } if (req.cookies.jwt) {
    try {
        const { mail } = req.params
        db.query('DELETE FROM cuenta WHERE mail = ?',[mail]);
    } catch (error) {
    }
  }
}

exports.editUser = async (req, res, next) => {
  const { nombre , mail2 , pass, passwordConfirm } = req.body;
  if(req.cookies.jwt) {
    try {
      //1) verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      console.log(decoded);
      //2) Check if the user still exists
      db.query('SELECT * FROM cuenta WHERE mail = ?', [decoded.id], (error, result) => {
        console.log(result);

        if(!result) {
          return next();
        }

        req.user = result[0];
        console.log("user is")
        console.log(req.user);
        return next();

      });
    } catch (error) {
      console.log(error);
      return next();
    }
  } if (req.cookies.jwt) {
    try {
      const { mail } = req.params
      const newData = { 
        nombre,
        mail,
      }
      console.log("Los datos son:");
      console.log(newData);
      let hashedPassword = await bcrypt.hash(passwordConfirm, 8);
      console.log(hashedPassword);
      db.query('SELECT * FROM cuenta WHERE mail = ?', [mail], async (error, results) => {
        if( results.length == 0 || !(await bcrypt.compare(pass, results[0].pass)) ) {
          res.status(401).render('/profile/edit/:mail', {
            mail: req.body.mail,
            message: 'Contraseña incorrecta'
          })
        } else {
          db.query('UPDATE cuenta set ? WHERE mail = ?',[{mail: mail2, pass: hashedPassword , nombre:nombre} , mail]);
        }
      });
      
    } catch (error) {
    }
  }
}

exports.login = async (req, res) => { 
  try {
    const { mail , pass } = req.body;

    if( !mail || !pass ) {
      return res.status(400).render('./auth/login', {
        pass: req.body.pass,
        mail: req.body.mail,
        message: 'Ingrese mail y/o contraseña'
      })
    }

    db.query('SELECT * FROM cuenta WHERE mail = ?', [mail], async (error, results) => {
      console.log(results);
      if( results.length == 0 || !(await bcrypt.compare(pass, results[0].pass)) ) {
        res.status(401).render('./auth/login', {
          mail: req.body.mail,
          message: 'Email o contraseña incorrectos'
        })
      } else {
        const id = results[0].mail;

        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });

        console.log("The token is: " + token);

        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        }

        res.cookie('jwt', token, cookieOptions );
        res.status(200).redirect("/");
      }

    })

  } catch (error) {
    console.log(error);
  }
}

exports.register = (req, res) => {
  console.log(req.body);

  const { name, mailUsuario, pass, passwordConfirm } = req.body;
  const expReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const esValido = expReg.test(mailUsuario);
  
  db.query('SELECT mailUsuario FROM users WHERE mailUsuario = ?', [mailUsuario], async (error, results) => {
    if(error) {
      console.log(error);
    }
    if(!pass || !mailUsuario || !name || !passwordConfirm  ) {
      return res.render('./auth/register', {
         mailUsuario: req.body.mailUsuario,
            pass: req.body.pass,
            pass2: req.body.passwordConfirm,
            name: req.body.name,
            message: 'Complete todos los campos'
      })
   }
   if (esValido == false) {  
      return res.render('./auth/register', {
            pass: req.body.pass,
            pass2: req.body.passwordConfirm,
            name: req.body.name,
            message: 'El correo ingresado es inválido, ingrese su correo original.'
          })
        }
    if(results.length > 0 ) {
      return res.render('./auth/register', {
            pass: req.body.pass,
            pass2: req.body.passwordConfirm,
            name: req.body.name,
            message: 'Mail ya en uso'
      })
    } else if( pass !== passwordConfirm ) {
      return res.render('./auth/register', {
        mailUsuario: req.body.mailUsuario,
            name: req.body.name,
            message: 'Las contraseñas no coinciden'
      });
    }

    let hashedPassword = await bcrypt.hash(pass, 8);
    console.log(hashedPassword);

    db.query('INSERT INTO cuenta SET ?', {mail: mailUsuario, pass: hashedPassword , tipo: 'usuario', nombre:name}, (error, results) => {
      if(error) {
        console.log(error);
      } 
    db.query('INSERT INTO users SET ?' , {mailUsuario:mailUsuario, name:name} , (error, results)=> {
        if (error) {console.log(error)
        } else {
          console.log(results);
          return res.render('./auth/register', {
            registroCompleto: 'Usuario registrado, puede ingresar'
          });
        }
     })
    })


  });

}

exports.registerCompany = (req, res) => {
  console.log(req.body);

  const { name, mailEmpresa, pass, passwordConfirm, razon, rut } = req.body;
  const expReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const esValido = expReg.test(mailEmpresa);

  db.query('SELECT mailEmpresa FROM empresas WHERE mailEmpresa = ?', [mailEmpresa], async (error, results) => {
    if(error) {
      console.log(error);
    }
  
    if(!pass || !mailEmpresa || !name || !rut || !razon ) {
      return res.render('./auth/registerCompany', {
         mailEmpresa: req.body.mailEmpresa,
            rut: req.body.rut,
            razon: req.body.razon,
            pass: req.body.pass,
            pass2: req.body.passwordConfirm,
            name: req.body.name,
            message: 'Complete todos los campos'
      })
   }
   if (esValido == false) {  
    return res.render('./auth/registerCompany', {
          pass: req.body.pass,
          pass2: req.body.passwordConfirm,
          name: req.body.name,
          rut: req.body.rut,
            razon: req.body.razon,
          message: 'El correo ingresado es inválido, ingrese su correo original.'
        })
      }
    if( results.length > 0 ) {
      return res.render('./auth/registerCompany', {
            pass: req.body.pass,
            pass2: req.body.passwordConfirm,
            name: req.body.name,
            message: 'Mail ya en uso'
      })
    } else if( pass !== passwordConfirm ) {
      return res.render('./auth/registerCompany', {
        mailEmpresa: req.body.mailEmpresa,
            name: req.body.name,
            rut: req.body.rut,
            razon: req.body.razon,
            message: 'Las contraseñas no coinciden'
      });
    }

    let hashedPassword = await bcrypt.hash(pass, 8);
    console.log(hashedPassword);

    db.query('INSERT INTO cuenta SET ?', {mail: mailEmpresa, pass: hashedPassword , tipo: 'empresa'}, (error, results) => {
      if(error) {
        console.log(error);
      } 
    db.query('INSERT INTO empresas SET ?' , {mailEmpresa:mailEmpresa, name:name, rut:rut, razon:razon} , (error, results)=> {
        if (error) {console.log(error)
        } else {
          console.log(results);
          return res.render('./auth/registerCompany', {
            registroCompleto: 'Empresa registrada, puede ingresar'
          });
        }
     })
    })
  });
}

exports.editProfile= async (req, res, next) => {
  const { pass , passwordConfirm , mailUsuario, name} = req.body;
  const expReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const esValido = expReg.test(mailUsuario)

  if(req.cookies.jwt) {
    try {
      //1) verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt,
      process.env.JWT_SECRET
      );
      
      console.log(decoded);

      //2) Check if the user still exists
      db.query('SELECT * FROM users WHERE mailUsuario = ?', [decoded.id], (error, result) => {
        console.log(result);
  
        if(!result) {
          return next();
        } 
        req.user = result[0];
        console.log("user is")
        console.log(req.user);
        return next();
      });
    
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
  db.query('SELECT mailUsuario FROM users WHERE mailUsuario = ?', [mailUsuario], async (error, results) => {
    if(error) {
      console.log(error);
    }
   /* if(!pass || !mailUsuario || !name || !passwordConfirm  ) {
      res.render('editProfile', {
            mail: req.body.mailUsuario,
            pass: req.body.pass,
            pass2: req.body.passwordConfirm,
            name: req.body.name,
            message: 'Complete todos los campos'
      })
   }
}*/})
}
 /* if(!pass || !mailUsuario || !name || !passwordConfirm ) {
          return res.render('editProfile', {
             mail: req.body.mailUsuario,
                pass: req.body.pass,
                pass2: req.body.passwordConfirm,
                name: req.body.name,
                message: 'Complete todos los campos'
          })
       }
       if (esValido == false) {  
        return res.render('editProfile', {
              pass: req.body.pass,
              pass2: req.body.passwordConfirm,
              name: req.body.name,
              message: 'El correo ingresado es inválido, ingrese su correo original.'
            })
          }
          
        /*
        if(result.length == 0 || !(await bcrypt.compare(pass, result[0].pass)) ) {
          return res.status(401).render('editProfile', {
            mail: req.body.mailUsuario,
            pass2: req.body.passwordConfirm,
            message: 'Contraseña incorrecta'
          })
        } else {
          const id = result[0].mailUsuario;
  
          const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
          });
  
          console.log("The token is: " + token);
  
          const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true
          }
  
          res.cookie('jwt', token, cookieOptions );
          res.status(200).redirect("/");
        }
      }); */
exports.isLoggedIn = async (req, res, next) => {
  if(req.cookies.jwt) {
    try {
      //1) verify the token
      
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      

      console.log(decoded);

      //2) Check if the user still exists
      db.query('SELECT * FROM cuenta WHERE mail = ?', [decoded.id], (error, result) => {
        console.log(result);

        if(!result) {
          return next();
        }

        req.user = result[0];
        console.log("user is")
        console.log(req.user);
        return next();

      });
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
  
}

exports.logout = (req, res) => {
  res.clearCookie('jwt')
  return res.redirect('/')
}
/*exports.logout = async (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 2*1000),
    httpOnly: true
  });

  res.status(200).redirect('/');
}*/

