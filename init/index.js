const mongoose = require("mongoose"); 
const initData = require("./data");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb+srv://HomeTrip:MLkjfvEPTVpu4H9e@cluster0.bus31.mongodb.net/HomeTrip?retryWrites=true&w=majority&appName=Cluster0"; // keep naming consistent

// Function to connect to MongoDB
async function main() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log("🟢 MongoDB connected! 🟢");
}

// Function to seed the database
const initDB = async () => {
  await Listing.deleteMany({});
  const listingsWithOwner = initData.data.map((obj) => ({
    ...obj,
    owner: "68e144864c31b7eba2bff9c4"
  }));

  const result = await Listing.insertMany(listingsWithOwner);
  console.log("✅ Data seeded successfully!", result);
};

// Connect and then seed
main()
  .then(() => initDB())
  .catch(err => console.log("❌ Connection Error:", err));
