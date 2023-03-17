const { buildSchema } = require('graphql');
const { graphqlHTTP } = require('express-graphql');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to your MongoDB database using Mongoose
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define your GraphQL schema using the buildSchema function
const schema = buildSchema(`
  type Query {
    getExchangeRate(src: String!, tgt: String!): ExchangeInfo
  }

  type Mutation {
    postExchangeRate(info: InputUpdateExchangeInfo): ExchangeInfo
    deleteExchangeRate(info: InputDeleteExchangeInfo): ExchangeInfo
  }

  input InputUpdateExchangeInfo {
    src: String!
    tgt: String!
    rate: Float!
    date: String
  }

  input InputDeleteExchangeInfo {
    src: String!
    tgt: String!
    date: String!
  }

  type ExchangeInfo {
    src: String!
    tgt: String!
    rate: Float!
    date: String!
  }
`);

// Define your MongoDB schema and model using Mongoose
const exchangeInfoSchema = new mongoose.Schema({
  src: String,
  tgt: String,
  rate: Number,
  date: String,
});

const ExchangeRate = mongoose.model('ExchangeRate', exchangeInfoSchema);

// Define your resolvers
const rootValue = {
  getExchangeRate: async ({ src, tgt }) => {
    let ret = null;
    if (src === tgt) {
      ret = { src, tgt, rate: 1, date: new Date().toISOString().slice(0, 10) };
    }
    else {
      ret = await ExchangeRate.findOne({ src, tgt });
      if (ret === null){
        const tmp = await ExchangeRate.findOne({ src: tgt, tgt:src });
        if (tmp !== null){ 
          const {src: src_rev, tgt: tgt_rev, rate: rate_rev, date: date_rev} = tmp;
          ret = { src: src_rev, tgt: tgt_rev, rate: 1.0/rate_rev, date: date_rev};
        }
      }
    }
    return ret;
  },
  postExchangeRate: async ({ info }) => {
    if (info.src === info.tgt){
      info.rate = 1;
    }
    const { src, tgt, rate, date } = info;

    const filter = { src, tgt, date };
    const update = { src, tgt, rate, date };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    return await ExchangeRate.findOneAndUpdate(filter, update, options);
  },
  deleteExchangeRate: async ({ info }) => {
    const { src, tgt, date } = info;
    return await ExchangeRate.findOneAndDelete({ src, tgt, date });
  },
};

// Create an Express app and attach the GraphQL middleware
const app = express();
app.use('/graphql', graphqlHTTP({ schema, rootValue, graphiql: true }));
app.listen(process.env.PORT, () => {
  console.log(`GraphQL server listening on http://localhost:${process.env.PORT}`);
});
