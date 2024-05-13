const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xfjzvlh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const assignmentCollection = client.db("skillUpDB").collection('skillUp');
    const pdfCollection = client.db("skillUpDB").collection('pdf');
    const SubmitAssignmentCollection = client.db("skillUpDB").collection('submitAssignment');


    app.get('/assignment/pending', async(req, res) =>{
         const result =await pdfCollection.find({status:"pending"}).toArray();
        console.log(result)
        res.send(result);
    })

    app.get('/my-assignment', async(req, res) =>{
        const email= req.query.email
        const result = await SubmitAssignmentCollection.find({email }).toArray();
        res.send(result);
    })
    app.post('/my-assignment', async(req, res) =>{
        const data = req.body;
        const result = await pdfCollection.insertOne(data);
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