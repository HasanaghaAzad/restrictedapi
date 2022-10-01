const express = require('express');

require('dotenv').config();
const PORT = process.env.PORT || 7777;

const setRouting = require('./middleware/setRouting');

const app = express();
app.use(express.json());


app.get('/', setRouting({weight: 1, access: 'public', title: 'Home'}));
app.get('/2', setRouting({weight: 2, access: 'public', title: 'Second'}));
app.get('/3', setRouting({weight: 3, access: 'public', title: 'Third'}));
app.get('/4', setRouting({weight: 4, access: 'public', title: 'Fourth'}));
app.get('/5', setRouting({weight: 5, access: 'public', title: 'Fifth'}));

app.get('/private', setRouting({weight: 1, access: 'private', title: 'Private'}));


const start = () => {
  try {
    app.listen(PORT, () => {
      console.log(`App running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

module.exports = app;
