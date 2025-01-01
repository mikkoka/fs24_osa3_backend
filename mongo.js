const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const password = process.argv[2]

const url =
  `mongodb+srv://mikkoosoite:${password}@cluster0.505od.mongodb.net/puhelinluettelo?retryWrites=true&w=majority&appName=Cluster0`

const Person = mongoose.model('Person', personSchema)

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

mongoose.set('strictQuery', false)
mongoose.connect(url)

if (process.argv.length===3) {
  Person.find({}).then(result => {
    result.forEach(p => {
      console.log(p.name, p.number)
    })
    mongoose.connection.close()
  })   
}

if (process.argv.length>5) {
  console.log('too many arguments!')
  mongoose.connection.close()
}

if (process.argv.length===4) {
  console.log('phone number missing')
  mongoose.connection.close()
}

if (process.argv.length===5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })
    
  person.save().then(() => {
    console.log('person saved!')
    mongoose.connection.close()
  })  
}









