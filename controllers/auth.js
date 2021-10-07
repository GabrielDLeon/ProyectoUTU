const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

exports.deleteUser = async (req, res, next) => {

  if(req.cookies.jwt) {
    try {
      //1) verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      console.log(decoded);
      //2) Check if the user still exists
      db.query('SELECT * FROM cuentas WHERE email = ?', [decoded.id], (error, result) => {
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
        db.query('DELETE FROM cuentas WHERE email = ?',[mail]);
    } catch (error) {
    }
  }
}

exports.editUser = async (req, res, next) => {
  const { nombre , mail2 , pass2 } = req.body;
  if(req.cookies.jwt) {
    try {
      //1) verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      console.log(decoded);
      //2) Check if the user still exists
      db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.nombre FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE email = ?', [decoded.id], (error, result) => {
        console.log("resultado de consulta");
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
      let hashedPassword = await bcrypt.hash(pass2, 8);
      console.log(hashedPassword);
      
      db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.nombre FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE email = ?', [mail], async (error, results) => {
        if( results.length == 0) {
          res.status(401).render('/profile/edit/:mail', {
            mail: req.body.mail,
            message: 'Contraseña incorrecta'
          })
        } else {
          db.query('UPDATE cuentas set ? WHERE email = ?',[{email: mail2, password: hashedPassword} , mail]);
          db.query('UPDATE cuenta_personal set ? WHERE email = ?',[{name:nombre} , mail]);
        }
      });
      
    } catch (error) {
    }
  }
}

exports.editCompany = async (req, res, next) => {
  const { nombre , mail2 , pass2, razon } = req.body;
  if(req.cookies.jwt) {
    try {
      //1) verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      console.log(decoded);
      //2) Check if the user still exists
      db.query('SELECT cuentas.email, cuentas.password, cuenta_empresa.nombre, cuenta_empresa.razonSocial FROM cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email WHERE email = ?', [decoded.id], (error, result) => {
        console.log("resultado de consulta");
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
      }
      console.log("Los datos son:");
      console.log(newData);
      let hashedPassword = await bcrypt.hash(pass2, 8);
      console.log(hashedPassword);
      
      db.query('SELECT cuentas.email, cuentas.password, cuenta_empresa.nombre, cuenta_empresa.razonSocial FROM cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email WHERE email = ?', [mail], async (error, results) => {
        if( results.length == 0) {
          res.status(401).render('/profile/edit/:mail', {
            mail: req.body.mail,
            message: 'Contraseña incorrecta'
          })
        } else {
          db.query('UPDATE cuentas set ? WHERE email = ?',[{email: mail2, password: hashedPassword} , mail]);
          db.query('UPDATE cuenta_empresa set ? WHERE email = ?',[{nombre:nombre, razonSocial:razon} , mail]);
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
        message: 'Ingrese mail y contraseña'
      })
    }

    db.query('SELECT * FROM cuentas WHERE email = ?', [mail], async (error, results) => {
      console.log(results);
      if( results.length == 0 || !(await bcrypt.compare(pass, results[0].password)) ) {
        res.status(401).render('./auth/login', {
          mail: req.body.mail,
          message: 'Email o contraseña incorrectos'
        })
      } else {
        const id = results[0].email;

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
  
  db.query('SELECT email FROM cuentas WHERE email = ?', [mailUsuario], async (error, results) => {
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

    db.query('INSERT INTO cuentas SET ?', {email: mailUsuario, password: hashedPassword , tipo: 'usuario'}, (error, results) => {
      if(error) {
        console.log(error);
      } 
    db.query('INSERT INTO cuenta_personal SET ?' , {email:mailUsuario, nombre:name} , (error, results)=> {
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
  const {name, mailEmpresa, pass, passwordConfirm, razon, rut} = req.body;
  function validate_isRUT(rut) {
    if (rut.length != 12) {
      return false;
    }
    if (!/^([0-9])*$/.test(rut)) {
      return false;
    }
    var dc = rut.substr(11, 1);
    var rut = rut.substr(0, 11);
    var total = 0;
    var factor = 2;

    for (i = 10; i >= 0; i--) {
      total += (factor * rut.substr(i, 1));
      factor = (factor == 9) ? 2 : ++factor;
    }

    var dv = 11 - (total % 11);

    if (dv == 11) {
      dv = 0;
    } else if (dv == 10) {
      dv = 1;
    }
    if (dv == dc) {
      return true;
    }
    return false;
  }
  console.log()
  const expReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const esValido = expReg.test(mailEmpresa);

  db.query('SELECT email FROM cuentas WHERE email = ?', [mailEmpresa], async (error, results) => {
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
            title: 'Registro de empresa',
            message: 'Complete todos los campos'
      })
   }
  //  if (validate_isRUT(rut) == false) {
  //   return res.render('./auth/registerCompany', {
  //     mailEmpresa: req.body.mailEmpresa,
  //        razon: req.body.razon,
  //        pass: req.body.pass,
  //        pass2: req.body.passwordConfirm,
  //        name: req.body.name,
  //        title: 'Registro de empresa',
  //        message: 'RUT inválido'
  //  })
  //  }
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

    db.query('INSERT INTO cuentas SET ?', {email: mailEmpresa, password: hashedPassword , tipo: 'empresa'}, (error, results) => {
      if(error) {
        console.log(error);
      } 
    db.query('INSERT INTO perfil SET ?', {email: mailEmpresa, nombre:name}, (error, results) => {
        if(error) {
          console.log(error);
        } 
    db.query('INSERT INTO cuenta_empresa SET ?' , {email:mailEmpresa, nombre:name, RUT:rut, razonSocial:razon} , (error, results)=> {
        if (error) {console.log(error)
        } else {
          console.log(results);
          return res.render('./auth/registerCompany', {
            registroCompleto: 'Empresa registrada, puede ingresar'
          });
        }
     })
    })
  })
  });
}

exports.isLoggedIn = async (req, res, next) => {
  if(req.cookies.jwt) {
    try {
      //1) verify the token

      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      console.log(decoded);

      db.query('SELECT * from cuentas WHERE cuentas.email = ?', [decoded.id], (error, result) => {
        const tipo = (result[0].tipo);
        //comprobacion de q el usuario exista
        if (tipo == 'usuario') {
          db.query('SELECT cuentas.email , cuentas.password, cuentas.tipo, cuenta_personal.nombre, cuenta_personal.id FROM (cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email) WHERE cuentas.email = ?', [decoded.id], (error, result2) => {
            if(!result2) {
              return next();
            }
            req.user = result2[0];
            return next();
          })
        } if(tipo == 'empresa') {
          db.query('SELECT cuentas.email , cuentas.password, cuentas.tipo, cuenta_empresa.nombre, cuenta_empresa.id FROM (cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email) WHERE cuentas.email = ?', [decoded.id], (error, result) => {
            if(!result) {
              return next();
            }
    
            req.user = result[0];
            return next();
    
          })
        }
      })
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    return next();
  }
}

exports.verTienda = async (req, res, next) => {
  try {
    db.query('SELECT nombre FROM cuenta_empresa', (error, result) => {
      console.log(result)
      req.tienda = result[0];
      console.log("datos de tiendas")
      console.log(req.tienda)
    })
  } catch (error) {
    console.log(error);
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

