const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;

// Connection URLs and Database Names
const loginUrl = 'mongodb+srv://dlsud-ramirez:ramirez_dlsud@cluster0.omal3j2.mongodb.net/';
const loginDbName = 'Backend';
const loginCollectionName = 'Details';

const statusUrl = 'mongodb+srv://dlsud-ramirez:ramirez_dlsud@cluster0.omal3j2.mongodb.net/';
const statusDbName = 'Backend';
const statusCollectionName = 'Status';

const reportUrl = 'mongodb+srv://dlsud-ramirez:ramirez_dlsud@cluster0.omal3j2.mongodb.net/';
const reportDbName = 'Backend';
const reportCollectionName = 'Report';

const lendingUrl = 'mongodb+srv://dlsud-ramirez:ramirez_dlsud@cluster0.omal3j2.mongodb.net/';
const lendingDbName = 'Backend';
const lendingCollectionName = 'Lending';

const lendingregisUrl ='mongodb+srv://dlsud-ramirez:ramirez_dlsud@cluster0.omal3j2.mongodb.net/';
const lendingregisDbName = 'Backend';
const lendingregisCollectionName = 'LendingRegis';

const dBoard201Url ='mongodb+srv://dlsud-ramirez:ramirez_dlsud@cluster0.omal3j2.mongodb.net/';
const dBoard201DbName = 'dBRooms';
const dBoard201CollectionName = 'dBoard201';

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'school.angeloramirez@gmail.com',
    pass: 'yrnd exxs lflw lokv',
  },
});

let loginDb;
let statusDb;
let reportDb;
let lendingDb;
let lendingregisDb;
let dBoard201Db;

async function connectToDatabases() {
  try {
    const loginClient = await MongoClient.connect(loginUrl, { useUnifiedTopology: true });
    loginDb = loginClient.db(loginDbName);
    console.log('Connected to Login MongoDB!');

    const statusClient = await MongoClient.connect(statusUrl, { useUnifiedTopology: true });
    statusDb = statusClient.db(statusDbName);
    console.log('Connected to Status MongoDB!');

    const reportClient = await MongoClient.connect(reportUrl, { useUnifiedTopology: true });
    reportDb = reportClient.db(reportDbName);
    console.log('Connected to Report MongoDB!');

    const lendingClient = await MongoClient.connect(lendingUrl, { useUnifiedTopology: true });
    lendingDb = lendingClient.db(lendingDbName);
    console.log('Connected to Lending MongoDB!');

    const lendingregisClient = await MongoClient.connect(lendingregisUrl, { useUnifiedTopology: true });
    lendingregisDb = lendingregisClient.db(lendingregisDbName);
    console.log('Connected to Lending Regis MongoDB!');

    const dBoard201Client = await MongoClient.connect(dBoard201Url, { useUnifiedTopology: true });
    dBoard201Db = dBoard201Client.db(dBoard201DbName);
    console.log('Connected to dashBoard201!');

  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

// Serve the HTML files
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'System', 'indexwelcome.html');
  res.sendFile(indexPath);
});

app.get('/mainboard', (req, res) => { // Corrected route for mainboard.html // NOT WORKING IT DISPLAYS THE DATA FROM THE LENDING SYSTEM
  res.sendFile(path.join(__dirname, 'System', 'mainboard.html'));
});

app.get('/welcome', (req, res) => {
  res.sendFile(path.join(__dirname, 'System', 'indexwelcome.html'));
});

app.use(express.static(path.join(__dirname, 'System')));

app.post('/indexlogin', async (req, res) => { // CUSTODIAN LOGIN
  const { email, password } = req.body;

  try {
    if (!loginDb) {
      console.log('Login database connection is not established yet.');
      return res.status(500).json({ error: 'Login database connection is not ready.' });
    }

    const user = await loginDb.collection(loginCollectionName).findOne({ email, password });

    if (user) {
      console.log('Login successful for user:', user);
      res.status(200).json(user);
    } else {
      console.log('Invalid username or password.');
      res.status(401).json({ error: 'Invalid username or password.' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'An error occurred during login.', message: err.message });
  }
});

// Modify your /borrowerlogin endpoint to include user data in the response
app.post('/borrowerlogin', async (req, res) => {
  const { usernum, password } = req.body;

  try {
    const client = await MongoClient.connect(lendingregisUrl, { useUnifiedTopology: true });
    const db = client.db(lendingregisDbName);
    const collection = db.collection(lendingregisCollectionName);

    const user = await collection.findOne({ usernum, password });

    if (user) {
      console.log('Login successful for user:', user);
      res.status(200).json({ success: true, user }); // Include user data in the response
    } else {
      console.log('Invalid userId or password.');
      res.status(401).json({ success: false, error: 'Invalid userId or password.' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, error: 'An error occurred during login.', message: err.message });
  }
});

app.post('/indexinput1', async (req, res) => {
  const {
    room,
    location,
    category,
    item_description,
    bundle,
    property_number,
    serial_number,
    unit_cost,
    rdf_number,
    rtf_number,
    unit_status,
    accountability,
  } = req.body;

  try {
    const client = new MongoClient(reportUrl, { useNewUrlParser: true });

    try {
      await client.connect();
      const db = client.db(statusDbName);

      // Change: Dynamic collection name based on room
      const collectionName = `dBoard${room}`;
      const collection = db.collection(collectionName);

      const assetDocument = {
        room,
        location,
        category,
        item_description,
        bundle,
        property_number,
        serial_number,
        unit_cost,
        rdf_number,
        rtf_number,
        unit_status,
        accountability,
      };

      const result = await collection.insertOne(assetDocument);

      console.log(`Inserted a document with id: ${result.insertedId}`);
      client.close();

      res.status(201).send('Asset stored successfully.');
    } catch (error) {
      console.error('Error during MongoDB operations:', error);
      res.status(500).send('Failed to submit asset.');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).send('Failed to connect to the database.');
  }
});

app.post('/indexfacultyreportinput', async (req, res) => { // BROKEN ITEMS INPUT
  const {
    room,
    computer,
    cpu,
    monitor,
  } = req.body;

  try {
    const client = new MongoClient(reportUrl, { useNewUrlParser: true });

    try {
      await client.connect();
      const db = client.db(reportDbName);
      const collection = db.collection(reportCollectionName);

      const assetDocument = {
        room,
        computer,
        cpu,
        monitor,
      };

      const result = await collection.insertOne(assetDocument);

      console.log(`Inserted a document with id: ${result.insertedId}`);
      client.close();

      res.status(201).send('Asset stored successfully.');
    } catch (error) {
      console.error('Error during MongoDB operations:', error);
      res.status(500).send('Failed to submit asset.');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).send('Failed to connect to the database.');
  }
});

app.post('/indexregister', async (req, res) => { // BORROWERS REGISTRATION
  const { name, email, usernum, password } = req.body;

  try {
    const client = new MongoClient(lendingregisUrl, { useNewUrlParser: true });

    try {
      await client.connect();
      const db = client.db(lendingregisDbName);
      const collection = db.collection(lendingregisCollectionName);

      const newUser = {
        name,
        email,
        usernum,
        password
      };

      console.log("New User Data:", newUser); // Log the newUser object

      const result = await collection.insertOne(newUser);

      console.log(`Inserted a document with id: ${result.insertedId}`);
      client.close();

      res.status(201).send("Registration successful. You can now log in.");
    } catch (error) {
      console.error("Error during MongoDB operations:", error);
      res.status(500).send("Failed to submit user.");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).send("Failed to connect to the database.");
  }
});


app.get('/data', async (req, res) => { // STATUSDB dating statusDb
  try {
    if (!dBoard201Db) {
      console.log('Status database connection is not established yet.');
      return res.status(500).json({ error: 'Status database connection is not ready.' });
    }

    const data = await dBoard201Db.collection(dBoard201CollectionName).find({}).toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/reports', async (req, res) => { // BROKEN ITEM REPORT DATABASE
  try {
    if (!reportDb) {
      console.log('Report database connection is not established yet.');
      return res.status(500).json({ error: 'Report database connection is not ready.' });
    }

    const reports = await reportDb.collection(reportCollectionName).find({}).toArray();
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/indexborrow', async (req, res) => {
  const {
    name,
    email,
    usernum,
    asset_type,
    barcode,
    borrow_date,
    return_date,
    status,
  } = req.body; // Use req.body instead of req.query

  try {
    const client = new MongoClient(lendingUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
      await client.connect();
      const db = client.db(lendingDbName);
      const collection = db.collection(lendingCollectionName);

      const assetDocument = {
        name,
        email,
        usernum,
        asset_type,
        barcode,
        borrow_date,
        return_date,
        status: status || "Pending",
      };

      const result = await collection.insertOne(assetDocument);

      console.log(`Inserted a document with id: ${result.insertedId}`);
      client.close();

      if (result.insertedId) {
        console.log("Data is registered:");
        console.log(assetDocument);

        const mailOptions = {
          from: 'school.angeloramirez@gmail.com',
          to: email,
          subject: 'Asset Borrowed',
          text: `Dear ${name}
          Your request has been approved for borrowing ${asset_type} from our School's inventory. 
          
          We would like to remind you of our School's policy regarding the responsible use and return of borrowed items. 
          We place great importance on the timely return of assets to ensure they are readily available for other students/faculty who may require them.
          
          The item is needed to be returned at ${return_date} 
          
          Please arrange for the return of the ${asset_type} to its designated location as soon as it is no longer required for your specific project or task.
          
          Your cooperation in this matter is vital to maintaining our operational efficiency and resource management.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
          } else {
            console.log("Email sent:", info.response);
          }
        });

        const userData = await lendingregisDb.collection(lendingregisCollectionName).findOne({ usernum });

        res.status(201).json({
          message: "Asset stored successfully.",
          userData,
        });
      } else {
        console.log("Data is undefined.");
        res.status(500).json({ message: "Failed to submit asset." });
      }
    } catch (error) {
      console.error("Error during MongoDB operations:", error);
      res.status(500).json({ message: "Failed to submit asset." });
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ message: "Failed to connect to the database." });
  }
});

app.get('/assets', async (req, res) => {
  try {
    const loggedInUserNum = req.usernum;

    if (!lendingDb) {
      console.log('Lending database connection is not established yet.');
      return res.status(500).json({ error: 'Lending database connection is not ready.' });
    }

    const assets = await lendingDb.collection(lendingCollectionName).find({
      usernum: loggedInUserNum,
      _id: { $exists: true, $ne: null }
    }).toArray();

    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.put('/assetsupdate/:id', async (req, res) => { // BORROWING SYSTEM INPUT UPDATE BUTTON
  const { id } = req.params;
  const updatedAsset = req.body;

  try {
    if (!lendingDb) {
      console.log('Lending database connection is not established yet.');
      return res.status(500).json({ error: 'Lending database connection is not ready.' });
    }

    const result = await lendingDb.collection(lendingCollectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedAsset }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'Asset updated successfully' });
    } else {
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (err) {
    console.error('Error updating asset:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/assetdelete/:assetId', async (req, res) => {
  const assetId = req.params.assetId;

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const database = client.db('Backend'); // Replace with your database name
    const collection = database.collection('LendingRegis'); // Replace with your collection name

    const result = await collection.updateOne(
      { _id: new ObjectID(assetId) },
      { $set: { status: 'deleted' } }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: 'Asset not found' });
    } else {
      res.status(200).json({ message: 'Asset marked as deleted' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating asset' });
  } finally {
    await client.close();
  }
});


connectToDatabases()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });