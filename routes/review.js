const express = require("express");
const router = express.Router({ mergeParams: true });
const app = express();
const WrapAsync = require("../utils/WrapAsync.js"); // Corrected path
const ExpressError = require("../utils/ExpressError.js"); // Corrected path
const Listing = require("../models/listing.js"); // Import Listing model
const Review = require("../models/review.js"); // Renamed to follow convention
const { reviewSchema } = require("../schema.js"); // Corrected path
const { isLoggedin } = require("../middleware.js");

app.use(express.urlencoded({ extended: true }));

const validateReview = (req, res, next) => {
  if (!req.body || !req.body.review) {
    throw new ExpressError(400, "Invalid Review Data");
  }

  let { error } = reviewSchema.validate(req.body.review);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

router.post(
  "/",
  validateReview,isLoggedin,
  WrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    const newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    newReview.author = req.user._id;
    await newReview.save();
    await listing.save();
  //  console.log(newReview)
    req.flash("success", "Review Added Successfully")

    res.redirect(`/listings/${req.params.id}`);
  })
);

router.delete(
  "/:reviewId",isLoggedin,
  WrapAsync(async (req, res) => {
    const { id ,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id);
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "Review Deleted Successfully")
    res.redirect(`/listings/${req.params.id}`);
   
  })
);

module.exports = router;
