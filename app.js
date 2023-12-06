const express = require('express');
const shortid = require('shortid');
const ShortUniqueId = require('short-unique-id');

const nano = require('nano')('http://localhost:5984'); 
const db = nano.use('company');

const app = express();
const PORT = 3000;

// In-memory storage for URL mappings
const urlDatabase = {};

app.use(express.json());

// Route to shorten a URL
app.post('/shorten', (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: 'Long URL is required' });
  }

  const shortUrl = shortid.generate();
  urlDatabase[shortUrl] = longUrl;

  const shortUrlFull = `http://localhost:${PORT}/${shortUrl}`;
  res.json({ 
    shortUrl: shortUrlFull
  });
});

// Route to redirect to the original URL
app.get('/:shortUrl', (req, res) => {

  const { shortUrl } = req.params;
  const longUrl = urlDatabase[shortUrl];

  if (!longUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }


  res.redirect(301, longUrl);
});


app.post('/createshorturl', (req, res) => {

  const { longUrl } = req.body;
  // Route to short Url using ShortUniqueId
  const uid = new ShortUniqueId();

  if (!longUrl) {
    return res.status(400).json({ error: 'Long URL is required' });
  }

  // Generate a short, unique ID
  const shortId = uid();

  urlDatabase[shortUrl] = longUrl;

  const shortUrlFull = `http://localhost:${PORT}/${shortId}`;
  res.json({ 
    shortUrl: shortUrlFull
  });

})

app.post('/hi', (req, res) => {

  res.json({ 
    wish: "Hi Ankur"
  });

})

const mapFunction = function (doc) {
  if (doc.collectionName === 'PaymentLink') {
    // emit(doc._id, doc);
    emit(doc._id, { 
      lead: doc.lead, 
      channelInfo: doc.channelInfo, 
      courseType: doc.courseType 
    })
  }
};

const designDocument = {
  _id: '_design/employees',
  views: {
    allEmployees: {
      map: mapFunction.toString()
    }
  }
};



app.post('/createView', (req, res) => {

  db.insert(designDocument, (err, body) => {
    if (err) {
      console.error('Error creating design document:', err);
    } else {
      console.log('Design document created:', body);
      res.json({
        "message": "Design document created:",
        "body": body
      })
    }
  });

})

app.post('/showView', (req, res) => {

  const pageSize = 2;
  const page = 2;

  db.view('employees', 'allEmployees', {
    startkey: null, // Start from the beginning
    limit: pageSize,
    skip: (page - 1) * pageSize
  }, (err, body) => {
    if (err) {
      console.error('Error querying view:', err);
    } else {
      console.log('View results:', body.rows);
      res.json({
        "message": "Design document created:",
        "body": body
      })
    }
  });

})



app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
