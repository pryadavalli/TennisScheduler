var http = require('http');
const express = require('express');
const mysql = require("mysql");
const dotenv = require('dotenv');
const app = express();
dotenv.config({ path: './.env'});
 
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'dbadmin',
  database: 'login-db'
})
 

db.connect((error) => {
  if(error) {
console.log("Connection failed")
      console.log(error)
  } else {
      console.log("My SQL Server connected!")
  }
})

app.set('view engine', 'hbs');
const path = require("path")
const publicDir = path.join(__dirname, './public')
app.use(express.static(publicDir))
app.listen(5000, ()=> {
  console.log("server started on port 5000")
})
app.get("/", (req, res) => {
  res.render("index")
})

app.get("/register", (req, res) => {
  res.render("register")
})
app.get("/login", (req, res) => {
  res.render("login")
})

const bcrypt = require("bcryptjs")
app.use(express.urlencoded({extended: 'false'}))
app.use(express.json())


app.post("/auth/login",async (req, res) => { 
  var {email, password} = req.body
  //get password for given email id
  var sqlStatementForPassword = "SELECT password FROM users WHERE email = '"+[email]+"'"
  db.query(sqlStatementForPassword , (error, result) => {
    if(error){
      console.log("Getting password failed!")
      console.log(error) 
    }
    else
    {
        if(result.length > 0 ) {
          var tempdbPassword = result[0].password;
          bcrypt.compare(password, tempdbPassword, function(err, bcryptres) {
              if(err)
              {
                console.log("Invalid username or password!")
              }
              else
              {
                console.log("Login Successful!")
                  return res.render('main', {
                    message: 'Login success!'
                  })
              }
          });
        }
        else{
          console.log("no user dumb");
        }
    }
  })
  
})

//USER REGISTRATION CODE STARTS HERE
app.post("/auth/register", (req, res) => {    
  const { name, email, password, password_confirm } = req.body
  console.log("User clicked on register")

  // db.query() code goes here
  db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => 
  {
      if(error){
        console.log("error")
        console.log(error) 
      }
      if( result.length > 0 ) {
        return res.render('register', {
            message: 'This email is already in use'
        })
      } else if(password !== password_confirm) {
        console.log("PASSSWORD ERROR : Passwords do not match!!") 
        return res.render('register', {
            message: 'Passwords do not match!'
        })
      }

     let hashedPassword = await bcrypt.hash(password, 8)
      db.query('INSERT INTO users SET?', {name: name, email: email, password: hashedPassword}, (err, sqlres) => {
          if(error) {
              console.log(error)
         } else {
              console.log("USER REGISTRATION SUCCESSFUL!!")
                    return res.render('login', {
                        message: 'User registered!'
                    })
          }
      })

      //get db results

      db.query('SELECT * FROM users', async (error, result) => {
        // remaining code goes here
        if(error){
          console.log(error) 
        }
        if( result.length > 0 ) {
          console.log("TOTAL USERS IN THE DATABASE:" + result.length);
        }  
      })
      //end

    })

})


/*
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Hello World!');
}).listen(8080); */