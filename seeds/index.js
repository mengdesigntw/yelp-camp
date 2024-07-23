if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

//connect mongoose
const mongoose = require('mongoose');
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  console.log('mongo connection open');
}

//import model
const { Campground } = require('../models/campground');

const { cities } = require('./cities');
const { descriptors, places } = require('./seedHelpers');

//import axios for api call function below
const axios = require('axios');

// function for unsplash api call
const getImg = async () => {
  try {
    const res = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        client_id: 'TBbJr-dHKui5gvaysUTLbHt4l4iId4ac1dowKNoitZ8',
        query: 'tent',
        orientation: 'landscape',
        count: 30,
      },
    });
    return res.data; //this will be an array of objects
  } catch (err) {
    console.log(err);
  }
};

// define a function for picking random num in an array, ex. cities[2]
function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

//insert seed campgrounds
async function seedDB() {
  await Campground.deleteMany({});
  const seedImgs = await getImg(); // this is res.data(array of objs)
  for (let i = 0; i < 30; i++) {
    const locationIndex = sample(cities);
    const camp = await new Campground({
      creator: '66909d84314acd73e0362105',
      title: `${sample(descriptors)} ${sample(places)}`,
      price: Math.floor(Math.random() * 20) + 10,
      // image: `${sample(seedImgs).urls.regular}`,
      images: [],
      description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellendus molestiae, necessitatibus corporis quo quisquam expedita maxime commodi recusandae dolore voluptatem aspernatur numquam vero saepe nihil, blanditiis enim, tempora exercitationem cumque!',
      location: `${locationIndex.city}, ${locationIndex.state}`, 
      geometry: {
        type: 'Point',
        coordinates: [locationIndex.longitude, locationIndex.latitude],
      },
    });

    await camp.save();
  }
}

//async function will return a promise
seedDB().then(() => {
  mongoose.disconnect();
  mongoose.connection.on('close', () => console.log('close'));
});
