const express = require('express')
const morgan = require('morgan')
const app = express()
const maxRandomInt = 999999999
const cors = require('cors')

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

const getRandomId = () => {
  return Math.floor(Math.random() * maxRandomInt).toString();
}

let persons = 
[
    {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": "1"
    },
    {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": "2"
    },
    {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": "3"
    },
    {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": "4"
    },
    {
    "id": "2576",
    "name": "Mikko",
    "number": "123123"
    }
]
  

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})


app.get('/info', (request, response) => {
  response.send(`<div>
                  <h3>Hello World! Phonebook has info on ${persons.length} persons!</h3>
                  <p>${Date()}</p>
                  <p>Random int for your pleasure: ${getRandomInt()}</p>
                </div>`)
})

app.get('/api/persons', (request, response) => {
  
  response.json(persons)
})

app.post('/api/persons', (request, response) => {
  
  let newPerson = request.body

  if (!newPerson.name || !newPerson.number) {
    return response.status(400).json({ 
      error: 'name or number missing' 
    })
  } 

  if (persons.find((p => p.name ===  newPerson.name))) {
    return response.status(400).json({ 
      error: 'name has to be unique' 
    })
  } else {
    newPerson = {...request.body, id : getRandomId()} 

    persons = persons.concat(newPerson)
    response.json(newPerson)
  }
  

})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find((p => p.id === id))
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter((p => p.id !== id))

  response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})