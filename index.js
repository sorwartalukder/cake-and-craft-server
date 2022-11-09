const express = require('express')
var cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;



//middle wares
app.use(cors())
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.89tmjbq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const servicesCollection = client.db("cakeAndCraft").collection("services");
        const reviewsCollection = client.db("cakeAndCraft").collection("reviews");
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)
        })
        app.get('/services/home', async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services)
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service)
        })
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.send(result)
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result)
        })
    } finally {

    }
}
run().catch(e => console.log(e));

app.get('/', (req, res) => {
    res.send('Cake and Craft server is running')
})

app.listen(port, () => {
    console.log(`Cake and Craft server is running on port ${port}`)
})