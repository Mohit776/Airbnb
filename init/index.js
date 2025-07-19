const mongoose = require("mongoose"); 
const initData = require("./data");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://localhost:27017/Airbnb"; // keep naming consistent

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
    owner: "687a9cf1ce1e75a03c7c906a"
  }));

  const result = await Listing.insertMany(listingsWithOwner);
  console.log("✅ Data seeded successfully!", result);
};

// Connect and then seed
main()
  .then(() => initDB())
  .catch(err => console.log("❌ Connection Error:", err));
