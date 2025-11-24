const express = require("express")
const cors = require("cors")

const db = require("./db/models/index.js")
const categoriesController = require("./src/categories/category.controller.js")
const sitesController = require("./src/categories/sites.controller.js")


const app = express()
app.use(express.json());
app.use(cors())
// app.use(clientErrorHandler)

const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)

  categoriesController.init(app)
  sitesController.init(app)
})


function clientErrorHandler(err, req, res, next) {
  console.log("Error de aplicación: " + err);
  res.sendStatus(err.statusCode)
  // if (req.xhr) {
  //   res.status(500).send({ error: 'Something failed!' });
  // } else {
  //   next(err);
  // }
}

