const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

morgan.token('id', function getId (req) {
  if(req.body.name) return JSON.stringify(req.body)
})

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.id(req, res)
  ].join(' ')
}))


app.get('/', (request, response, next) => {
  response.send('<h1>Hello World!</h1>').catch(error => next(error))
})


app.get('/info', (request, response, next) => {
  Person.estimatedDocumentCount().then(count => {
    response.send(`<div>
      <h3>Hello World! Phonebook has info on ${count} persons!</h3>
      <p>${Date()}</p>
    </div>`)
  }).catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(pers => {
    response.json(pers)
  }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name or number missing' 
    })

  } else {
    const newPerson = new Person({...body, number: body.number.replace(/\D/g, '-')})
    newPerson.save().then(p => {
      response.json(p)
    }).catch(error => next(error))
  }
})

app.get('/api/persons/:id', (request, response, next) => {

  Person.findById(request.params.id).then(pers => {
    console.log(pers)
    response.json(pers)
  })
    .catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  Person.findByIdAndUpdate(request.params.id, { number: body.number.replace(/\D/g, '-') }, { new: true, runValidators: true, context: 'query'  })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})