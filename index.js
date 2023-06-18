import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import resolvers from './graphql/resolvers.js'
import typeDefs from './graphql/typeDefs.js';
import * as dotenv from 'dotenv'
import db_connection from './config/db_connection.js';
import staffBirthdayReminder from './functions/staffBirthdayReminder.js'




(async function(){
  console.log("Hello World...");
  dotenv.config()

  await db_connection()

  const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
  
  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => ({ token: req.headers.authorization }),
    listen: { port: process.env.PORT },
  });
  
  console.log(`🚀  Server ready at: ${url}`);

  //**Special Function
  staffBirthdayReminder()
  
})();

