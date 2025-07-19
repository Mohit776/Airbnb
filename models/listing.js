const mongoose = require("mongoose");
const Review = require("./review.js")
const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        type: String,
        default: "https://media.istockphoto.com/id/1127245421/photo/woman-hands-praying-for-blessing-from-god-on-sunset-background.webp?s=1024x1024&w=is&k=20&c=faoiFapQkhucuLuor9gBnblJ4KJpqvEgariqalvzRas=",
        set: (v) => v === "" ? "https://media.istockphoto.com/id/1127245421/photo/woman-hands-praying-for-blessing-from-god-on-sunset-background.webp?s=1024x1024&w=is&k=20&c=faoiFapQkhucuLuor9gBnblJ4KJpqvEgariqalvzRas=" : v
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "review"
        }
    ],
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        
    },
});
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
      await Review.deleteMany({
        _id: { $in: listing.reviews }
      });
    }
  });
  

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;