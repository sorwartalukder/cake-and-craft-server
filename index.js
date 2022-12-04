const express = require('express')
var cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
        const ordersCollection = client.db("cakeAndCraft").collection("orders");
        const paymentsCollection = client.db("cakeAndCraft").collection("payments");

        // send total service data
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)
        })
        //send limited service data
        app.get('/services/home', async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services)
        })
        //send single service data
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service)
        })
        // send single service total reviews
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { serviceId: id };
            const cursor = reviewsCollection.find(query, { sort: { _id: -1 } });
            const reviews = await cursor.toArray();
            res.send(reviews)
        })
        //send update review 
        app.get('/update/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewsCollection.findOne(query);
            res.send(review)
        })
        //send my orders
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const orders = await ordersCollection.find(query, { sort: { _id: -1 } }).toArray()
            res.send(orders)
        })
        //send order
        app.get('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await ordersCollection.findOne(query)
            res.send(order)
        })

        //send user total reviews
        app.get('/userReviews/:uid', async (req, res) => {
            const uid = req.params.uid;
            const query = { userId: uid };
            const cursor = reviewsCollection.find(query);
            const userReviews = await cursor.toArray();
            res.send(userReviews)
        })

        //payment intent
        app.post("/create-payment-intent", async (req, res) => {
            const order = req.body;
            const price = order.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: "usd",
                amount: amount,
                "payment_method_types": [
                    "card"
                ],
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        //add payment
        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.ProductID;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    paid: true,
                    transactionID: payment.transactionID
                }
            }
            const updateOrder = await ordersCollection.updateOne(filter, updateDoc)
            res.send(result)
        })
        //add order database
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result)
        })
        // add service database
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.send(result)
        })
        //add review database
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result)
        })
        //add update review
        app.patch('/update/review/:id', async (req, res) => {
            const id = req.params.id
            const feedback = req.body;
            const query = { _id: ObjectId(id) };
            console.log(id, feedback)
            const updateDoc = {
                $set:
                    feedback
                ,
            };
            console.log(updateDoc)
            const result = await reviewsCollection.updateOne(query, updateDoc);
            res.send(result)
        })
        //cancel order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result)
        })
        //delete user review
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
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