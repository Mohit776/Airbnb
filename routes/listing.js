const express = require("express");
const router = express.Router();
const WrapAsync = require("../utils/WrapAsync.js"); // Corrected path
const ExpressError = require("../utils/ExpressError.js"); // Corrected path
const Listing = require("../models/listing.js"); // Added import for Listing model
const { listingSchema, reviewSchema } = require("../schema.js"); // Corrected path
const { isLoggedin } = require("../middleware.js");
const app = express();
const stripe = require("stripe")(process.env.Stripe_Secret_Key)


app.use(express.urlencoded({ extended: true }));

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

router.get(
  "/",
  WrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// Route to display the form for creating a new listing
router.get("/new", isLoggedin, (req, res) => {

  res.render("listings/new.ejs");
});

// Route to display a specific listing
router.get(
  "/:id",
  WrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }, }).populate("owner");
    if (!listing) {
      req.flash("error", "Listing Not Exist")
      res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
  }

  )
);

// Route to create a new listing

router.post(
  "/",
  validateListing,
  WrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    console.log(req.user)
    newListing.owner = req.user._id; // Set the owner to the current user
    await newListing.save();
    req.flash("success", "New Listing Added!")
    res.redirect("/listings");
  })
);

// Route to edit a listing
router.get(
  "/:id/edit", isLoggedin,
  WrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing Not Exist")
      res.redirect("/listings");
    } else {
      res.render("listings/edit.ejs", { listing });
    }
  })
);

// Route to update a listing
router.put(
  "/:id",
  WrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!res.locals.currUser._id.equals(listing.owner)) {
      req.flash("error", "You don't have permission to edit this")
      return res.redirect(`/listings/${id}`);
    }

    await Listing.findByIdAndUpdate(id, req.body.listing);

    req.flash("success", "Listing Updated Successfully")
    res.redirect(`/listings/${id}`);
  })
);

// Use DELETE method for deleting listings

router.delete(
  "/:id", isLoggedin,
  WrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted Successfully")
    res.redirect("/listings");
  })
);





//Payment Integration

router.post(
  "/:id/pay",isLoggedin,
  WrapAsync(async (req, res) => {
  try { const { id } = req.params;
    const listing = await Listing.findById(id);

      if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
      }


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: listing.title,
              description: listing.description,
              images: listing.image ? [listing.image] : [],

            },
            unit_amount: listing.price * 100,
          },
          quantity: 1,
        },],
    success_url: `${req.protocol}://${req.get('host')}/listings/${id}/success`,
    cancel_url: `${req.protocol}://${req.get('host')}/listings/${id}/canceled`,

    })
    res.redirect(session.url);
   // res.json({ url: session.url});
      console.log(session.url);
}catch (error) {

    res.status(500).json({ error: error.message });
  
  }
  }))

  // Add these before module.exports

router.get(
  "/:id/success",
  isLoggedin,
  WrapAsync(async (req, res) => {
    const { id } = req.params;
    req.flash("success", "Payment successful!");
    res.redirect(`/listings/${id}`);
  })
);

router.get(
  "/:id/canceled",
  isLoggedin,
  WrapAsync(async (req, res) => {
    const { id } = req.params;
    req.flash("error", "Payment canceled");
    res.redirect(`/listings/${id}`);
  })
);

  module.exports = router;
