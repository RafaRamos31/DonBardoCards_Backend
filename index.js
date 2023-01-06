import { ApolloServer, gql, UserInputError } from "apollo-server"
import './db.js'
import Person from './models/person.js'

const typeDefs = gql`
    enum HasPhone {
        YES
        NO
    }

    type Address {
        street: String!
        city: String!
    }

    type Person {
        name: String!
        age: Int!
        phone: String
        address: Address!
        check: String!
        isAdult: Boolean!
        id: ID!
    }

    type Query {
        personCount: Int!
        allPersons(phone: HasPhone): [Person]!
        findPerson(name: String!): Person
    }

    type Mutation {
        addPerson(
            name: String!
            age: Int!
            phone: String
            street: String!
            city: String!
        ): Person
        editPhone(
            name: String!
            phone: String!
        ): Person
    }
`

const resolvers = {
    Query: {
        personCount: () => Person.collection.countDocuments(),
        allPersons: async (root, args) => {
            return Person.find({})
        },
        findPerson: (root, args) => {
            const {name} = args
            return Person.findOne({name})
        }
    },
    Mutation: {
        addPerson: (root, args) => {
            const person = new Person({...args})
            return person.save()
        },
        editPhone: async (root, args) => {
            const person = await Person.findOne({name: args.name})
            if (!person) return null

            person.phone = args.phone
            try{
                await person.save()
            } catch(error){
                throw new UserInputError(error.message, {invalidArgs: args})
            }
            return person            
        }
    },
    Person: {
        isAdult: (root) => root.age >= 18,
        check: () => "valid",
        address: (root) => {
            return {
                street: root.street,
                city: root.city
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs, resolvers
})

server.listen().then(({url}) => {
    console.log(`Server ready at ${url}`)
})