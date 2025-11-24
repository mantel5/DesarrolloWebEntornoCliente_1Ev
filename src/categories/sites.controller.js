const models = require("../../db/models")

async function findAll(req, res) {
    res.send(await models.Site.findAll())
}

async function add(req, res) {
    let result = await models.Site.build(req.body)
    result.categoryId = req.params.id
    
    await result.save()
    res.send(result)
}

async function deleteOne(req, res) {
    let site = await models.Site.findByPk(req.params.id)
    if (!site)
      res.sendStatus(404)
  
    await site.destroy()
    res.sendStatus(200)
}

async function findOne(req, res) {
    let site = await models.Site.findByPk(req.params.id)
    if (site)
        res.send(site)
    else
        res.sendStatus(404)
}

async function update(req, res) {
    let site = await models.Site.findByPk(req.params.id)

    site.name = req.body.name
    site.url = req.body.url
    site.user = req.body.user
    site.password = req.body.password
    site.description = req.body.description
    site.updatedAt = new Date()
  
    await site.save()
    res.sendStatus(200)
}

function init(app) {
    app.get('/sites', findAll)
    app.get('/sites/:id', findOne)
    app.post('/categories/:id', add)
    app.delete('/sites/:id', deleteOne)
    app.put('/sites/:id', update)
}

module.exports = {
    init
}