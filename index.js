const express = require('express')
const app = express()
var cors = require('cors')
const port = process.env.PORT||5000
app.use(express.json())
app.use(cors())

require('dotenv').config()
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f7zs7lw.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
  
    if (!authorization) {
      return res.status(401).send({ error: true, message: "unauthorized acess" });
    }
    const token = authorization.split(" ")[1];
    jwt.verify(token, process.env.DB_ACCESS_TOKEN, function (error, decoded) {
      if (error) {
        return res
          .status(403)
          .send({ error: true, message: "unauthorized access" });
      }
      req.decoded = decoded;
      next();
    });
  };

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const houseHuntingUsers = client.db("houseHuntingDB").collection("houseHuntingUsersCollections")

    app.post("/jwt", async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.DB_ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        res.send({ token });
      });

    app.post('/allusers',async (req, res) => {
        const users = req.body;
        const query = {
          email: users.email,
        };
        const existingUser = await houseHuntingUsers.findOne(query);
        if (existingUser) {
          return res.send({ message: "user already exist" });
        }
        const result = await houseHuntingUsers.insertOne(users);
        res.send(result);
      })
      



      app.get('/allusers',async (req, res) => {
          const result = await houseHuntingUsers.find().toArray();
        res.send(result);
      })
      





    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);









app.get('/', (req, res) => {
  res.send('Welcome to house hunting server')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})