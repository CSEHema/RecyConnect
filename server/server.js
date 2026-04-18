const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// --- 1. MIDDLEWARE & SETUP ---
app.use(express.json());
app.use(cors());

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static('uploads'));

// --- 2. DATABASE CONNECTION ---
const mongoURI = "mongodb+srv://jntuproject22_db_user:bhavya@cluster0.7fdc7om.mongodb.net/recyconnect?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB Atlas (RecyConnect)"))
  .catch(err => console.error("❌ Connection error:", err.message));

// --- 3. MODELS ---

const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phno: { type: String, required: true },
  address: { type: String, required: true },
  purposes: { type: [String], default: [] },
  date: { type: Date, default: Date.now }
}), 'users'); 

const Vendor = mongoose.model('Vendor', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phno: { type: String, required: true },
  address: { type: String, required: true },
  date: { type: Date, default: Date.now }
}), 'vendors');

const Listing = mongoose.model('Listing', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  weight: { type: String, required: true },
  qty: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  address: { type: String, required: true }, 
  phone: { type: String, required: true },   
  imageUrl: { type: String }, 
  status: { type: String, default: 'active' }, // 'active' or 'requested'
  createdAt: { type: Date, default: Date.now }
}));

const OrderRequest = mongoose.model('OrderRequest', new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  itemName: String,
  qty: Number,
  price: Number,
  vendorName: String,
  vendorEmail: String,
  vendorPhone: String,
  vendorAddress: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}), 'requests');

const SoldItem = mongoose.model('SoldItem', new mongoose.Schema({
  itemName: String,
  price: Number,
  qty: Number,
  weight: String,
  imageUrl: String,
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  vendorEmail: String,
  vendorName: String,
  vendorPhone: String,
  soldDate: { type: Date, default: Date.now }
}), 'sold_items');

// --- 4. MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- 5. AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: "User Registered" });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email, password: req.body.password });
  if (user) res.status(200).json({ message: "User Login Success", user });
  else res.status(401).json({ error: "Invalid Credentials" });
});

app.post('/api/auth/vendor/register', async (req, res) => {
  try {
    const newVendor = new Vendor(req.body);
    await newVendor.save();
    res.status(201).json({ message: "Vendor Registered" });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/auth/vendor/login', async (req, res) => {
  const vendor = await Vendor.findOne({ email: req.body.email, password: req.body.password });
  if (vendor) res.status(200).json({ message: "Vendor Login Success", vendor });
  else res.status(401).json({ error: "Invalid Credentials" });
});

// --- 6. LISTING ROUTES ---

app.post('/api/user/listings', upload.single('image'), async (req, res) => {
  try {
    const userProfile = await User.findById(req.body.userId);
    const newListing = new Listing({
      ...req.body,
      address: userProfile.address, 
      phone: userProfile.phno, 
      imageUrl: req.file ? `https://recyconnect.onrender.com/uploads/${req.file.filename}` : null
    });
    await newListing.save();
    res.status(201).json(newListing);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// This route serves the "Discover" tab for vendors
app.get('/api/user/listings', async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// This route serves the Homeowner's inventory (Only their items)
app.get('/api/user/listings/:userId', async (req, res) => {
  try {
    const listings = await Listing.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 7. REQUEST & HISTORY ROUTES ---

// Vendor Place Request (Hides item from others instantly)
app.post('/api/user/requests', async (req, res) => {
  try {
    const newRequest = new OrderRequest(req.body);
    await newRequest.save();
    // Reservation: Hide from Discover for other vendors
    await Listing.findByIdAndUpdate(req.body.itemId, { status: 'requested' });
    res.status(201).json({ message: "Request placed and item reserved." });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Get requests for Homeowner (Notifications)
app.get('/api/user/requests/:userId', async (req, res) => {
  try {
    const requests = await OrderRequest.find({ userId: req.params.userId, status: 'pending' });
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get requests for Vendor (To see their "Active Pickups" - waiting for approval)
app.get('/api/vendor/requests/:email', async (req, res) => {
  try {
    const requests = await OrderRequest.find({ vendorEmail: req.params.email, status: 'pending' });
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ACCEPT: Moves item to SoldItem collection and cleans up active DB
app.patch('/api/user/requests/:id/accept', async (req, res) => {
  try {
    const request = await OrderRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });

    const listing = await Listing.findById(request.itemId);

    // 1. Move to Archive (Sold History)
    const soldEntry = new SoldItem({
      itemName: request.itemName,
      price: request.price,
      qty: request.qty,
      weight: listing?.weight || "N/A",
      imageUrl: listing?.imageUrl,
      sellerId: request.userId,
      vendorEmail: request.vendorEmail,
      vendorName: request.vendorName,
      vendorPhone: request.vendorPhone
    });
    await soldEntry.save();

    // 2. Cleanup: Remove listing and request
    await Listing.findByIdAndDelete(request.itemId);
    await OrderRequest.findByIdAndDelete(req.params.id);

    res.json({ message: "Item Sold and History Updated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// REJECT: Makes item visible to others again
app.patch('/api/user/requests/:id/reject', async (req, res) => {
  try {
    const request = await OrderRequest.findById(req.params.id);
    await Listing.findByIdAndUpdate(request.itemId, { status: 'active' });
    await OrderRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Request rejected." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 8. HISTORY FETCHING ---

// Add/Verify this in server.js
app.get('/api/history/user/:userId', async (req, res) => {
  try {
    // This fetches all items the user has successfully sold/accepted
    const history = await SoldItem.find({ sellerId: req.params.userId }).sort({ soldDate: -1 });
    res.json(history);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/history/vendor/:email', async (req, res) => {
  try {
    const history = await SoldItem.find({ vendorEmail: req.params.email }).sort({ soldDate: -1 });
    res.json(history);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 9. START SERVER ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
