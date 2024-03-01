const mongoose = require('mongoose');
const Tour = require('./tourModel.js');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can't be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belongs to a tour'],
    },
    // user who wrote the review
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  // virtual properties settings
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// middleware for populating user and tour fields in the review document
reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'user',
  //     select: 'name photo',
  //   }).populate({
  //     path: 'tour',
  //     select: 'name',
  //   });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// static method
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // here this keyword is the model itself
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // updating tour with the details
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRating,
  });
};

reviewSchema.post('save', function () {
  // here this keyword is pointing to review document, to get Review model access here use this.constructor
  this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
