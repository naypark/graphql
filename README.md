# 환율 정보 CRUD하는 graph API 서버

### Prerequisite
1. Install `mongodb`
2. Install `node`, `npm`
### Settings
1. create `.env` file
    - `.env` should contain: 
    ```
    PORT= ( Port number to run server )
    DB_URI= ( MongoDB URI to run with )
    ```
2. create `main.js` file
    -  `.main.js` should contain:
    ```
    1. connect to MongoDB database
    2. Define your GraphQL schema
    3. Define your MongoDB schema
    4. Define your resolvers
    5. Create an Express app and attach the GraphQL middleware
    ```

### How to run
1. run `npm install—save express` to install packages needed
2. run `npm start`
- if error, run `node main.js`
