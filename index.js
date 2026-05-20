const express = require('express')
const dontenv = require('dotenv')
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dontenv.config()

const uri = process.env.MONGODB_URI;
const app = express()

const PORT = process.env.PORT
app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    await client.connect();

   const db = client.db("ideavault")
   const ideaCollection = db.collection("ideas")
   
   
   app.get('/ideas', async(req, res) =>{
    const result = await ideaCollection.find().toArray()
    res.json(result);
   })

   
   app.post('/ideas', async (req, res) =>{
    const ideaData = req.body
    console.log(ideaData)
    const result = await ideaCollection.insertOne(ideaData)
    res.json(result)
   });

   
   app.get("/ideas/:id" , async (req , res) =>{
    const {id} = req.params
    const result = await ideaCollection.findOne({_id: new ObjectId(id)})
    res.json(result)
   })

   
   app.post('/ideas/:id/comments', async (req, res) => {
     const id = req.params.id;
     const comment = req.body; 

     const query = { _id: new ObjectId(id) };
     
     
     const updateDoc = {
       $push: { comments: comment }
     };

     const result = await ideaCollection.updateOne(query, updateDoc);
     res.json(result);
   });

   
   app.patch('/ideas/:id/comments/:commentId', async (req, res) => {
     const { id, commentId } = req.params;
     const { text } = req.body; 

     const query = { 
       _id: new ObjectId(id), 
       "comments.id": parseInt(commentId) 
     };

     const updateDoc = {
       $set: { "comments.$.text": text } 
     };

     const result = await ideaCollection.updateOne(query, updateDoc);
     res.json(result);
   });

  
   app.delete('/ideas/:id/comments/:commentId', async (req, res) => {
     const { id, commentId } = req.params;

     const query = { _id: new ObjectId(id) };
     
    
     const updateDoc = {
       $pull: { comments: { id: parseInt(commentId) } }
     };

     const result = await ideaCollection.updateOne(query, updateDoc);
     res.json(result);
   });

   
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send("Server is running fine!")
})

app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`)
})