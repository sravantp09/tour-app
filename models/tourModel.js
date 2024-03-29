const mongoose = require('mongoose');
const User = require('./userModel.js');
const slugify = require('slugify');
const validator = require('validator');

// tour schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'A tour name must be less or equal to 50 characters'],
      minlength: [10, 'A tour name must contains 10 or more characters'],
      // validate: validator.isAlpha   -> using thirdparty npm validator
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
      default: 1,
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficuty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Invalid difficulty value',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      // runs each time we get a new value to this field
      set: function (val) {
        return Math.round(val * 10) / 10;
      },
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    priceDiscount: {
      type: Number,
      // custom validator
      validate: {
        validator: function (val) {
          // this indicates the entire document value
          return val < this.price; // must return true/false value
        },
        message: 'Price discount must be less than Price',
      },
    },
    summary: {
      type: String,
      trim: true, // works only for string and removed white spaces from start and end
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    // name of the image
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    // is and object which contains mutiple fields
    startLocation: {
      // mongodb supports location data(ie, coordinates) so we need to mention like below
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // for latitude and longitude values
      address: String,
      description: String,
    },
    // array of documents
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // reference
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    // schema options (for  virtual property)
    toJSON: { virtuals: true }, // required for adding virtual properties in the result
    toObject: { virtuals: true },
  },
);

// INDEXES
tourSchema.index({ price: 1, ratingsAverage: -1 }); // creating price index and 1 indicate ascending order

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('review', {
  ref: 'Review',
  // connecting models Tour and Review
  foreignField: 'tour', // field in the other document
  localField: '_id', // ie, the _id value in the tour document is stored as tour field in the review document
});

// DOCUMENT MIDDLEWARE
//
// pre -> indicated runs before saving/creating document in the db
// save runs only for save and create won't run for insertMany
tourSchema.pre('save', function (next) {
  //console.log(this); /// this -> indicate the currently processed document before saving to the db

  // adding a new property slug to the document
  this.slug = slugify(this.name, { lower: true }); // slug is just a text

  // pass control to the next middleware
  next();
});

tourSchema.pre('save', function (next) {
  console.log('Saving the document...');
  next();
});

//[EMBEDDING DATA] ---------
// fetching the actual documents before creating to db by using guides id provided
/*
tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id)); // return promises only
  this.guides = await Promise.all(guidesPromises); // resolving promises
  next();
});
*/

// post -> run after saving the document in the db
tourSchema.post('save', function (doc, next) {
  // console.log(doc);
  console.log('Document created...');
  next();
});

// QUERY MIDDLEWARE
//
// this middleware runs before any find query
// tourSchema.pre('find', function (next) {

// ---->  /^find/ - means all query starts with find
tourSchema.pre(/^find/, function (next) {
  // here this indicate query obejct
  this.find({ secretTour: { $ne: true } }); // filtering out tours which has secretTour set to true
  next();
});

// run after any find query
tourSchema.post(/^find/, function (doc, next) {
  console.log(doc);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  // this.pipeline() indicate the aggreggation stages array and we are adding new condition to the array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// tour model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
