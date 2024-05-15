const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

const corsData ={
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://assignment-ss-e02b6.web.app',
    'https://assignment-ss-e02b6.firebaseapp.com'
  ],
  credentials: true,
  optionSuccessStatus: 200,
}

app.use(cors(corsData));
app.use(express.json());
app.use(cookieParser())

const logger = async(req, res, next) => {
  console.log('called',req.host, req.originalUrl)
  next();
}


const verifyToken = (req, res, next) =>{
  const token = req.cookies?.token
  if(!token) {
    return res.status(401).send({message: 'unauthorized access'})
  }
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
        if(err) {
          console.log(err)
          return res.status(401).send({message: 'unauthorized access'})
        }
        console.log(decoded)
        req.user = decoded
        next()
      })
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xfjzvlh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

cookieOption ={
  httpOnly:true,
  secure:process.env.NODE_ENV === "production"? true: false,
  sameSite: process.env.NODE_ENV === "production"? "none":"strict",
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const assignmentCollection = client.db("skillUpDB").collection('skillUp');
    const pdfCollection = client.db("skillUpDB").collection('pdf');
    const submitAssignmentCollection = client.db("skillUpDB").collection('submitAssignment');


    app.post('/jwt',logger, async(req, res) =>{
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '24h'})
      res
      .cookie('token',token,cookieOption)
      .send({success: true});
  })
    

  app.post('/logOut', async (req, res) => {
    const user = req.body;
    console.log('logged in user',user)
    res.clearCookie('token', {...cookieOption,maxAge: 0, sameSite:'none',secure:true}).send({success: true});
})

    app.get('/my-assignment', async(req, res) =>{
        const result = await submitAssignmentCollection.find().toArray();
        res.send(result);
    })

    app.post('/my-assignment', async(req, res) =>{
        const data = req.body;
        console.log(data);
        const result = await submitAssignmentCollection.insertOne(data);
        res.send(result);
    })

    app.get('/pdf', async(req, res) =>{
         const result =await pdfCollection.find().toArray();
        res.send(result);
    })

    app.post('/pdf', async(req, res) =>{
        const newPdf = req.body;
        const result = await pdfCollection.insertOne(newPdf);
        res.send(result);
    })


    app.get('/skillUp', async(req, res) =>{
        const result =await assignmentCollection.find().toArray();
        res.send(result);
    })

    app.get('/skillUp/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result =await assignmentCollection.findOne(query);
        res.send(result);
    })

    app.post('/skillUp', async(req, res) =>{
        const newCard = req.body;
        const result = await assignmentCollection.insertOne(newCard);
        res.send(result);
    })

    app.delete('/skillUp/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await assignmentCollection.deleteOne(query);
        res.send(result);
    })

    app.put('/skillUp/:id', async(req, res) =>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = {upsert: true};
        const assignmentForm = req.body;
        const assignment = {
            $set: {
                name: assignmentForm.name,
                mark: assignmentForm.mark,
                date: assignmentForm.date,
                description: assignmentForm.description,
                difficulty: assignmentForm.difficulty,
                image: assignmentForm.image
            }
        }
        const result = await assignmentCollection.updateOne(filter, assignment,options );
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
    res.send('Assignment server making is running')
  })
  
  app.listen(port, () => {
    console.log(`Assignment server is running on port ${port}`)
  })