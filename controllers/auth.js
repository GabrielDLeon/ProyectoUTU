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

exports.login = async (req, res) => {
  try {
    const { mail , pass } = req.body;

    if( !mail || !pass ) {
      return res.status(400).render('./auth/login', {
        message: 'Ingrese mail y contraseña'
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
  
  db.query('SELECT mailUsuario FROM users WHERE mailUsuario = ?', [mailUsuario], async (error, results) => {
    if(error) {
      console.log(error);
    }
    if(!pass || !mailUsuario || !name || !passwordConfirm  ) {
      return res.render('./auth/signup', {
         mailUsuario: req.body.mailUsuario,
            pass: req.body.pass,
            pass2: req.body.passwordConfirm,
            name: req.body.name,
            message: 'Complete todos los campos'
      })
   }
    if( results.length > 0 ) {
      return res.render('./auth/signup', {
            pass: req.body.pass,
            pass2: req.body.passwordConfirm,
            name: req.body.name,
            message: 'Mail ya en uso'
      })
    } else if( pass !== passwordConfirm ) {
      return res.render('./auth/signup', {
        mailUsuario: req.body.mailUsuario,
            name: req.body.name,
            message: 'Las contraseñas no coinciden'
      });
    }

    let hashedPassword = await bcrypt.hash(pass, 8);
    console.log(hashedPassword);

    db.query('INSERT INTO cuenta SET ?', {mail: mailUsuario, pass: hashedPassword , tipo: 'usuario'}, (error, results) => {
      if(error) {
        console.log(error);
      } 
    db.query('INSERT INTO users SET ?' , {mailUsuario:mailUsuario, name:name} , (error, results)=> {
        if (error) {console.log(error)
        } else {
          console.log(results);
          return res.render('./auth/signup', {
            registroCompleto: 'Usuario registrado, puede ingresar'
          });
        }
     })
    })


  });

}

exports.signupCompany = (req, res) => {
  console.log(req.body);

  const { name, mailEmpresa, pass, passwordConfirm, razon, rut } = req.body;
  
  db.query('SELECT mailEmpresa FROM empresas WHERE mailEmpresa = ?', [mailEmpresa], async (error, results) => {
    if(error) {
      console.log(error);
    }
    if(!pass || !mailEmpresa || !name || !rut || !razon ) {
      return res.render('./auth/signupCompany', {
         mailEmpresa: req.body.mailEmpresa,
            rut: req.body.rut,
            razon: req.body.razon,
            pass: req.body.pass,
            pass2: req.body.passwordConfirm,
            name: req.body.name,
            message: 'Complete todos los campos'
      })
   }
    if( results.length > 0 ) {
      return res.render('./auth/signupCompany', {
            pass: req.body.pass,
            pass2: req.body.passwordConfirm,
            name: req.body.name,
            message: 'Mail ya en uso'
      })
    } else if( pass !== passwordConfirm ) {
      return res.render('./auth/signupCompany', {
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
          return res.render('./auth/signupCompany', {
            registroCompleto: 'Empresa registrada, puede ingresar'
          });
        }
     })
    })


  });

}

exports.editProfile= async (req, res, next) => {
  // console.log(req.cookies);
  if( req.cookies.jwt) {
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
}

exports.isLoggedIn = async (req, res, next) => {
  // console.log(req.cookies);
  if(req.cookies.jwt) {
    try {
      //1) verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt,
      process.env.JWT_SECRET
      );

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

exports.logout = async (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 2*1000),
    httpOnly: true
  });

  res.status(200).redirect('/');
}