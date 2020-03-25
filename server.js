const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schema/schema')

const app = express();
const port = process.env.PORT || 4000;


app.use('/graphql', expressGraphQL({
    graphiql: true,
    schema
}))


app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`)
});
