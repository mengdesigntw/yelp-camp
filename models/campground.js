const mongoose = require('mongoose');
const { Review } = require('./review');
const Schema = mongoose.Schema;

const schemaOptions = {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
};

const ImageSchema = new Schema(
  {
    url: String,
    filename: String,
  },
  schemaOptions
);

ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/ar_1.0,c_fill,h_100');
});

const CampgroundSchema = new Schema(
  {
    title: String,
    price: {
      type: Number,
      min: 0,
    },
    images: [ImageSchema],
    description: String,
    location: String,
    geometry: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  schemaOptions
);

CampgroundSchema.virtual('properties').get(function () {
  if (this.images.length) {
    return {
      title: `<h6><a href='/campgrounds/${this._id}'>${this.title}</a></h6>`,
      location: `<p>${this.location}</p>`,
      image: `<img src='${this.images[0].thumbnail}'>`,
    };
  } else {
    return {
      title: `<h6><a href='/campgrounds/${this._id}'>${this.title}</a></h6>`,
      location: `<p>${this.location}</p>`,
      image: `<img src='https://res.cloudinary.com/dkiqet71x/image/upload/ar_1.0,c_fill,h_100/v1721099764/cld-sample-2.jpg'>`,
    };
  }
});


CampgroundSchema.post('findOneAndDelete', async function (campground) {
  if (campground.reviews.length) {
    await Review.deleteMany({
      _id: {
        $in: campground.reviews,
      },
    });
  }
});

const Campground = new mongoose.model('CampGround', CampgroundSchema);

module.exports = { Campground, CampgroundSchema };
