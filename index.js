const express = require('express');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const port = process.env.PORT || 5000;

// middlewares
app.use(cors())
app.use(express.json())

// SeY1RO3RHSwnAaea
// subscribe-plan

const uri = "mongodb+srv://subscribe-plan:SeY1RO3RHSwnAaea@cluster0.cpvrkgd.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
        await client.connect();
        const usersCollection = client.db('subscribePlan-users').collection('users')
        const planCollection = client.db('subscribePlan-users').collection('plans')
        const paymentCollection = client.db('subscribePlan-users').collection('payments')

        app.put('/users/:email', async (req, res) => {
            const user = req.body;
            const email = req.params.email;
            const filter = { email: email }
            const options = { upsert: true }
            const updatedDoc = {
                $set: user
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        app.get('/users', async (req, res) => {
            let email = {}
            if (req.query?.email) {
                email = { email: req.query.email }
            }
            const result = await usersCollection.find(email).toArray()
            res.send(result)
        })

        app.post('/plans', async (req, res) => {
            const plan = req.body;
            const result = await planCollection.insertOne(plan)
            res.send(result)
        })

        app.get('/plans', async (req, res) => {
            let email = {}
            if (req.query?.email) {
                email = { email: req.query.email }
            }
            const result = await planCollection.find(email).toArray()
            res.send(result)
        })

        app.get('/plans/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await planCollection.findOne(filter)
            res.send(result)
        })

        app.delete('/plans/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await planCollection.deleteOne(filter)
            res.send(result)
        })

        app.post('/create-payment-intent', async (req, res) => {
            const { cost } = req.body
            const amount = parseInt(cost * 100);
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            })
            res.send({
                clientSecret: paymentIntent.client_secret
            })
        })

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment)
            res.send(result)
        })

        app.get('/payments', async (req, res) => {
            let email = {}
            if (req.query?.email) {
                email = { email: req.query.email }
            }
            const result = await paymentCollection.find(email).toArray()
            res.send(result)
        })

        app.delete('/payments/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await paymentCollection.deleteOne(filter)
            res.send(result)
        })

        app.delete('/payments/plans/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { classId: new ObjectId(id) }
            const result = await paymentCollection.deleteOne(filter)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('infinite mart server is running')
})

app.listen(port, () => {
    console.log('server running at 5000');
})