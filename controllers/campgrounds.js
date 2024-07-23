const { Campground } = require('../models/campground');
const { cloudinary } = require('../cloudinary/index');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingService = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

const index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('./campgrounds/index.ejs', { campgrounds: campgrounds });
};

const newForm = (req, res) => {
  res.render('./campgrounds/new.ejs');
};

const create = async (req, res) => {
  //because we use campground[title] in the form
  const campground = await new Campground(req.body.campground);
  const geoData = await geocodingService
    .forwardGeocode({
      query: campground.location,
      limit: 1,
    })
    .send();
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => {
    return { url: f.path, filename: f.filename };
  }); //create an array and returning the objects
  campground.creator = req.user._id;
  await campground.save();
  // console.log(campground);
  req.flash('success', 'Campground is successfully created!');
  res.redirect(`/campgrounds/${campground._id}`); //enter url, not file path
};

const show = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  await campground.populate({
    path: 'reviews',
    populate: {
      path: 'creator',
    },
  });
  await campground.populate('creator');
  // console.log(campground)
  // console.log({ ...campground.toObject().reviews[0].creator });
  res.render('./campgrounds/show.ejs', { ...campground.toObject() });
};

const editForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  // pass in virtual ture to get the virtual property
  res.render('./campgrounds/edit.ejs', { ...campground.toObject({ virtuals: true }) });
};

const update = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true, runValidators: true });
  const newImgs = req.files.map((f) => {
    return { url: f.path, filename: f.filename };
  });
  campground.images.push(...newImgs);
  const geoData = await geocodingService
    .forwardGeocode({
      query: campground.location,
      limit: 1,
    })
    .send();
  campground.geometry = geoData.body.features[0].geometry;
  await campground.save();
  if (req.body.deleteImage) {
    for (let filename of req.body.deleteImage) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImage } } } });
  }
  req.flash('success', 'Campground is updated!');
  res.redirect(`/campgrounds/${id}`);
};

const remove = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Campground is deleted!');
  res.redirect('/campgrounds');
};

module.exports = { index, newForm, create, show, editForm, update, remove };
