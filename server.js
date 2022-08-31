const express = require("express");
const { Pool } = require("pg");
const fs = require("fs");
const app = express();
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
var data = new Object();
const port = 3000;
const secretKey = "Mi Llave Ultra Secreta";
const expressFileUpload = require("express-fileupload");
var token = jwt.sign(
  {
    exp: Math.floor(Date.now() / 1000) + 60,
    data: data,
  },
  secretKey
);

const config = {
  user: "postgres",
  host: "localhost",
  password: "Marogedon2023@$",
  port: 5432,
  database: "skatepark",
};

const pool = new Pool(config);

app.set("view engine", "handlebars");

app.engine(
  "handlebars",
  exphbs.engine({
    layoutsDir: __dirname + "/views",
    partialsDir: __dirname + "/views/components/",
    defaultLayout: null,
    extname: "handlebars",
  })
);

app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use("/assets", express.static(__dirname + "/assets"));
app.use("/js", express.static(__dirname + "/node_modules/jquery/dist"));
app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  expressFileUpload({
    limits: { fileSize: 5242880 },
    abortOnLimit: true,
    responseOnLimit:
      "El peso del archivo que intentas subir supera el limite permitido",
  })
);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, nombre, password, anos_experiencia, especialidad, foto, estado FROM skaters`
    );
    data.users = JSON.parse(JSON.stringify(result.rows));
    fs.writeFile(
      __dirname + "/assets/data/users.json",
      JSON.stringify(data),
      (err) => {
        if (err) throw err;
      }
    );
    res.render("index", {
      layout: "index",
      indexTitle: "Skate Park",
      indexSubtitle: "Lista de participantes",
      documentTitle: "Prueba Skate Park: Inicio",
      participantsListData: data.users,
    });
  } catch (error) {
    res.status(500).send("Error 500");
  }
});

app.get("/login", (req, res) => {
  res.render("login", {
    layout: "login",
    loginTitle: "Skate Park",
    loginSubTitle: "Login",
    documentTitle: "Prueba Skate Park: Acceso Usuarios",
    footerMessage: "¿Aún no tienes cuenta?",
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT id, email, nombre, password, anos_experiencia, especialidad, foto, estado FROM skaters`
    );
    data.users = JSON.parse(JSON.stringify(result.rows));
    const user = data.users.find(
      (u) => u.email == email && u.password == password
    );
    if (user) {
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 120,
          data: user,
        },
        secretKey
      );
      res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{{documentTitle}}</title>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
            integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l"
            crossorigin="anonymous"
          />
          <link rel="stylesheet" href="./assets/css/estilos.css" />
        </head>
        <body>
        <a href="/admin?token=${token}"> <p> Ir al Dashboard </p> </a>
        Bienvenido, ${email}.
        <script>
        localStorage.setItem('token', JSON.stringify("${token}"))
        </script>
        </body>
      </html>`);
    } else {
      res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{{documentTitle}}</title>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
            integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l"
            crossorigin="anonymous"
          />
          <link rel="stylesheet" href="./assets/css/estilos.css" />
        </head>
        <body>
      <p>Usuario y/o contraseña incorrectas</p>
        </body>
      </html>`);
    }
  } catch (error) {
    res.status(500).send("Error 500");
  }
});

app.get("/register", (req, res) => {
  res.render("registro", {
    layout: "registro",
    registerTitle: "Skate Park",
    registerSubTitle: "Registro",
    documentTitle: "Prueba Skate Park: Registro",
  });
});

app.post("/register", async (req, res) => {
  const { email, nombre, password, anos_experiencia, especialidad } = req.body;
  const { foto } = req.files;
  const { name } = foto;
  foto.mv(`${__dirname}/assets/img/data/${name}`, (err) => {
    if (err) console.log(err);
  });
  try {
    const insertToSkaters = `INSERT INTO skaters(email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES('${email}','${nombre}', '${password}', '${anos_experiencia}', '${especialidad}', '${name}', false)  RETURNING *`;
    const insertToSkatersResult = await pool.query(insertToSkaters);
    data.users = JSON.parse(JSON.stringify(insertToSkatersResult.rows));
    fs.writeFile(
      __dirname + "/assets/data/users.json",
      JSON.stringify(data),
      (err) => {
        if (err) throw err;
      }
    );
    res.redirect("/");
  } catch (err) {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{{documentTitle}}</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
          integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l"
          crossorigin="anonymous"
        />
        <link rel="stylesheet" href="./assets/css/estilos.css" />
      </head>
      <body>
    <p>${err}</p>
      </body>
    </html>`);
  }
});

app.get("/admin", async (req, res) => {
  let { token } = req.query;

  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      res.status(401).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{{documentTitle}}</title>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
            integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l"
            crossorigin="anonymous"
          />
          <link rel="stylesheet" href="./assets/css/estilos.css" />
        </head>
        <body>
      <p>Sector no autorizado, jwt debe ser definido, intente logearse nuevamente.</p>
        </body>
      </html>`);
    } else {
      try {
        const result = await pool.query(
          `SELECT id, email, nombre, password, anos_experiencia, especialidad, foto, estado FROM skaters`
        );
        data.users = JSON.parse(JSON.stringify(result.rows));
        fs.writeFile(
          __dirname + "/assets/data/users.json",
          JSON.stringify(data),
          (err) => {
            if (err) throw err;
          }
        );
        res.render("admin", {
          layout: "admin",
          adminTitle: "Skate Park",
          adminSubTitle: "Administración",
          documentTitle: "Prueba Skate Park: Administración",
          participantsAdminListData: data.users,
        });
      } catch (error) {
        res.status(500).send("Error 500");
      }
    }
  });
});

app.get("/profile", (req, res) => {
  let { token } = req.query;

  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      res.status(401).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{{documentTitle}}</title>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
            integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l"
            crossorigin="anonymous"
          />
          <link rel="stylesheet" href="./assets/css/estilos.css" />
        </head>
        <body>
      <p>Sector no autorizado, jwt debe ser definido, intente logearse nuevamente.</p>
        </body>
      </html>`);
    } else {
      try {
        var decoded = jwt.verify(token, secretKey);
        var id = decoded.data.id;
        const result = await pool.query(
          `SELECT id, email, nombre, password, anos_experiencia, especialidad, foto, estado FROM skaters WHERE id = '${id}'`
        );
        data.users = JSON.parse(JSON.stringify(result.rows));
        res.render("profile", {
          layout: "profile",
          profileTitle: "Skate Park",
          profileSubTitle: "Datos del perfil",
          documentTitle: "Prueba Skate Park: Edición perfil",
          profileToViewData: data.users[0],
        });
      } catch (err) {
        console.log(err);
      }
    }
  });
});

app.post("/updateProfile", async (req, res) => {
  let email = req.query.data[0];
  let nombre = req.query.data[1];
  let password = req.query.data[2];
  let anos_experiencia = req.query.data[4];
  let especialidad = req.query.data[5];
  try {
    const id = await pool.query(
      `SELECT id FROM skaters WHERE email = '${email}'`
    );
    const idToUpdate = id.rows[0].id;
    const updateResponse = await pool.query(`UPDATE skaters SET email='${email}', nombre='${nombre}', password='${password}', anos_experiencia=${anos_experiencia}, especialidad='${especialidad}' WHERE id = '${idToUpdate}' RETURNING *`);
    if (updateResponse.rowCount == 0) {
      console.log("No se ha podido actualizar");
    } else {
      console.log("Actualizado exitosamente");
    }
    res.send(req.params);
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).send("Error 500");
  }
});

app.post("/deleteProfile", async (req, res) => {
  let email = req.query.data[0];
  try {
    const idDelete = await pool.query(
      `SELECT id FROM skaters WHERE email = '${email}'`
    );
    const idToDelete = idDelete.rows[0].id;
    const deleteResponse = await pool.query(`DELETE FROM skaters WHERE id = '${idToDelete}' RETURNING *`);
    if (deleteResponse.rowCount == 0) {
      console.log("No se ha podido eliminar");
    } else {
      console.log("Eliminado exitosamente");
    }
    res.send(req.params);
  } catch (error) {
    res.status(500).send("Error 500");
  }
});

app.post("/updateState", async (req, res) => {
  let estadoNuevo = req.query.newState;
  let idReferido = req.query.idRef;
  try {
    const updateResponse = await pool.query(`UPDATE skaters SET estado='${estadoNuevo}' WHERE id = '${idReferido}' RETURNING *`);
    if (updateResponse.rowCount == 0) {
      console.log("No se ha podido actualizar estado");
    } else {
      console.log("Estado actualizado exitosamente");
    }
    res.send(req.params);
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).send("Error 500");
  }
});

app.get("/token", (req, res) => {
  const { token } = req.query;
  jwt.verify(token, secretKey, (err, data) => {
    res.send(err ? "Token inválido" : data);
  });
});

app.listen(port, () => {
  console.log(`App corriendo en el puerto escucha ${port}!`);
});
