const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jwqfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const database = client.db("BangladeshiITDB");
    const usersCollection = database.collection("users");
    const blogsCollection = database.collection("blogs");
    const teamCollection = database.collection("team");
    const reviewsCollection = database.collection("reviews");
    const reviewVideosCollection = database.collection("reviewVideos");

    // POST endpoint to save user data (with role)
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      // console.log(req.headers);
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Get role by email
    app.get("/users/role", async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      if (!user) {
        return res.status(404).send({ role: null, message: "User not found" });
      }
      res.send({ role: user.role });
    });

    // PATCH endpoint to make a user an admin by ID
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // DELETE endpoint to remove a user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // POST - Add a blog
    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      const result = await blogsCollection.insertOne(blog);
      res.send(result);
    });

    // GET - Fetch all blogs
    app.get("/blogs", async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
    });
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });
      res.send(blog);
    });

    // DELETE a blog
    app.delete("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // POST Review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    // GET Reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    // DELETE: Delete a review by ID
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/team", async (req, res) => {
      const { name, position, facebook, github, linkedin, email, image } =
        req.body;

      console.log("📦 Received from frontend (team):", req.body); // check full body
      console.log("Image field value:", image);

      const memberData = {
        name,
        position,
        facebook,
        github,
        linkedin,
        email,
        image,
      };

      try {
        const result = await teamCollection.insertOne(memberData);
        res.send(result);
      } catch (err) {
        console.error("❌ Failed to insert member:", err);
        res.status(500).send({ message: "Failed to add team member" });
      }
    });

    // GET Members
    app.get("/team", async (req, res) => {
      const result = await teamCollection.find().toArray();
      res.send(result);
    });

    app.put("/team/:id", async (req, res) => {
      const id = req.params.id;
      const { name, position, facebook, github, linkedin, image } = req.body;

      const updateDoc = {
        $set: {
          name,
          position,
          facebook,
          github,
          linkedin,
          image,
        },
      };

      const result = await teamCollection.updateOne(
        { _id: new ObjectId(id) },
        updateDoc
      );
      res.send(result);
    });

    // DELETE Member
    app.delete("/team/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await teamCollection.deleteOne(query);
      res.send(result);
    });

    // POST a Review Video
    app.post("/review-videos", async (req, res) => {
      const video = req.body;
      const result = await reviewVideosCollection.insertOne(video);
      res.send(result);
    });

    // GET all Review Videos
    app.get("/review-videos", async (req, res) => {
      const result = await reviewVideosCollection.find().toArray();
      res.send(result);
    });

    // DELETE a Review Video
    app.delete("/review-videos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewVideosCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to you in Bangladeshi IT page");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
