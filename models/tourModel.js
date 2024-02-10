const mongoose = require('mongoose');
const slugify = require('slugify');

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
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    priceDiscount: Number,
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
  },
  {
    // schema options (for  virtual property)
    toJSON: { virtuals: true }, // required for adding virtual properties in the result
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE
//
// pre -> indicated runs before saving/creating document in the db
// save runs only for save and create won't run for insertMany
tourSchema.pre('save', function (next) {
  console.log(this); /// this -> indicate the currently processed document before saving to the db

  // adding a new property slug to the document
  this.slug = slugify(this.name, { lower: true }); // slug is just a text

  // pass control to the next middleware
  next();
});

tourSchema.pre('save', function (next) {
  console.log('Saving the document...');
  next();
});

// post -> run after saving the document in the db
tourSchema.post('save', function (doc, next) {
  console.log(doc);
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
