const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f7zs7lw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).send({ error: true, message: "Unauthorized access" });
  }

  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.DB_ACCESS_TOKEN, function (error, decoded) {
    if (error) {
      return res.status(403).send({ error: true, message: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    await client.connect();
    const houseHuntingUsers = client.db("houseHuntingDB").collection("houseHuntingUsersCollections");
  
    const houseHuntingHouses = client.db("houseHuntingHouseDB").collection("houseHuntingHousesCollections");





  app.post("/houses", async (req, res) => {
   const house=req.body
   const result= await houseHuntingHouses.insertOne(house)
   res.send(result)
    });


    app.get("/houses", async (req, res) => {

       let query={}
       if(req.query?.email){
        query={email:req.query?.email}
       }
        const result= await houseHuntingHouses.find(query).toArray()
        res.send(result)
         });
     



         app.delete('/houses/:id', async(req, res) => {
            const id=req.params.id
            let query={_id: new ObjectId(id)}
            let result= await houseHuntingHouses.deleteOne(query)
            res.send(result)
          })
    
          app.get('/houses/:id', async(req, res) => {
         
            let result= await houseHuntingHouses.findOne({_id: new ObjectId(req.params.id)})
            res.send(result)
          })
    

          app.put('/houses/:id',async (req, res) => {

            const id =req.params.id
            const houseinfo=req.body
            const filter={_id: new ObjectId(id)}
            const options = { upsert: true };
          
            const updateDoc = {
              $set: {
               
                name:houseinfo.name,
                address:houseinfo.address,
                city:houseinfo.city,
                email:houseinfo.email,
                bedrooms:houseinfo.bedrooms,
                bathrooms:houseinfo.bathrooms,
                roomSize:houseinfo.roomSize,
                picture:houseinfo. picture,
                availabilityDate:houseinfo.availabilityDate,
                rentPerMonth:houseinfo.rentPerMonth,
                phoneNumber:houseinfo. phoneNumber,
                description:houseinfo.description,
              },
            };
            const result=await houseHuntingHouses.updateOne(filter, updateDoc, options);
            res.send(result)
        
        
          })



    app.post("/register", async (req, res) => {
      const { fullName, role, phone, email, password } = req.body;
      
      // Check if user with the given email already exists
      const existingUser = await houseHuntingUsers.findOne({ email });
      if (existingUser) {
        return res.status(400).send({ message: "User already exists" });
      }
      
      // Create a new user
      const newUser = {
        fullName,
        role,
        phone,
        email,
        password
      };
      
      // Store the user in the database
      const result = await houseHuntingUsers.insertOne(newUser);
      res.send({ message: "User registered successfully", result });
    });

    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      
      // Find the user with the given email
      const user = await houseHuntingUsers.findOne({ email:email });
      if (!user || user.password !== password) {
        return res.status(401).send({ message: "Invalid email or password" });
      }
      
      
      const token = jwt.sign({ email: user.email }, process.env.DB_ACCESS_TOKEN, { expiresIn: "1h" });
      
      res.send({ token });
    });

    app.get("/allusers", async(req, res) => {
     const result= await houseHuntingUsers.find().toArray()
     res.send(result)
      });
  
    // Protected route example
    app.get("/dashboard", verifyJWT, (req, res) => {
      const user = req.decoded;
      res.send({ message: `Welcome to the dashboard, ${user.email}` });
    });





    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Welcome to house hunting server');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
