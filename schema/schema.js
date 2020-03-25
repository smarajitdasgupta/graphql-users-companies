// schema file contains all of the knowledge required
// for telling graphql what what the app data looks like
// including what properties each objects have and
// how each object is related to each other


const graphql = require('graphql');
const axios = require('axios');

const API_URL = 'http://localhost:3000';

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

/*
const users = [
    { id: '23', firstName: 'Bill', age: 20 },
    { id: '47', firstName: 'Samantha', age: 34 }
];
*/

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType), // list of users for a single company
            args: {},
            resolve(parentValue, args) {
                //  console.log(parentValue, args)

                return axios.get(`${API_URL}/companies/${parentValue.id}/users`)
                    .then(res => res.data)
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                // console.log(parentValue, args)
                return axios.get(`${API_URL}/companies/${parentValue.companyId}`)
                    .then(res => res.data)
            }
        }
    })
});

// RootQuery is used to allow GraphQL to enter
// into our app's data graph
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            // resolve function returns actual piece
            // of data from database
            resolve(parentValue, args) {
                // return users.find(user => user.id === args.id);
                // axios returns a data object in response
                return axios.get(`${API_URL}/users/${args.id}`)
                    .then(res => res.data);
            }
        },
        company: {
            type: CompanyType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            resolve(parentValue, args) {
                return axios.get(`${API_URL}/companies/${args.id}`)
                    .then(res => res.data)
            }
        }
    }
});

const RootMutation = new GraphQLObjectType({
    name: 'RootMutation',
    fields: {
        // mutation to add a user
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) }, // GraphQLNonNull for mandatory fields
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, args) {
                const { firstName, age } = args;
                return axios.post(`${API_URL}/users`, {
                    firstName,
                    age
                })
                    .then(res => res.data);
            }
        },
        // mutation to delete a user
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parentValue, args) {
                const { id } = args;
                return axios.delete(`${API_URL}/users/${id}`)
                    .then(res => res.data)
            }
        },
        // mutation to edit user
        editUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, args) {
                const { id, firstName, age, companyId } = args;
                return axios.patch(`${API_URL}/users/${id}`, args)
                    .then(res => res.data)
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});

