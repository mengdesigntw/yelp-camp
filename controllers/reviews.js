const { Campground } = require('../models/campground');
const { Review } = require('../models/review');

const create = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  const review = await new Review(req.body.review);
  review.creator = req.user._id;
  await review.populate('creator');
  await review.save();
  // console.log(review)
  await campground.reviews.push(review);
  await campground.save();
  req.flash('success', 'Review is added!');
  res.redirect(`/campgrounds/${campground._id}`);
};

const remove = async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }, { new: true });
    req.flash('success', 'Review is deleted!');
    res.redirect(`/campgrounds/${id}`);
  }
module.exports = { create, remove };
