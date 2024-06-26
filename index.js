const express = require("express");
const morgan = require('morgan')
const app = express();
const cors = require('cors');
const port = 5000;
const episodes = './data/episodes.json'
const crowd = './data/playlists.json'

let posts = require(episodes)
let playlist = require(crowd)
let notifications = require("./data/notifications.json")
let settings = require("./data/settings.json")
let clubs = require("./data/club.json")
let featured = require("./data/featured.json")
let promo =require("./data/promo.json")
let watch =require("./data/watch.json")
let all =require("./data/alltracks.json")
let mobile =require("./data/mobile-alltracks.json")
const DeviceDetector = require('node-device-detector');

app.use(cors());
// Body parser
app.use(express.urlencoded({ extended: false }));

// Morgan
app.use(morgan('tiny'))

var html = "<!DOCTYPE html>\n<html>\n    <head>\n    </head>\n <body>\n      <h1>TKMSHOW EXPRESS REST API</h1>\n  \n <h3>API ENDPOINTS</h3> <script src='https://gist.github.com/bmnidhin/2b6b06974246a2a8254061383b0ba726.js'></script></body>\n</html>";
// Home route
app.get("/", (req, res) => {
    res.send(html);
  });

/* All posts */
app.get("/listen", function(req, res, next) {
  const detector = new DeviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
  });
  const userAgent = 'Mozilla/5.0 (Linux; Android 5.0; NX505J Build/KVT49L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.78 Mobile Safari/537.36';
  const result = detector.detect(userAgent);
  console.log('result parse', result);
    res.json(posts);
  });
/* A post by id */
app.get('/listen/:slug',  function (req, res) {
    const slug = req.params.slug
    const row = posts.find(r => r.slug == slug)  
    
    res.json(row)
    
})

app.get("/playlist", function(req, res, next) {

    res.json(playlist);
  });
/* A post by id */
app.get('/playlist/:slug',  function (req, res) {
    const slug = req.params.slug
    const row = playlist.find(r => r.slug == slug)  
    
    res.json(row)
    
})

app.get("/clubs", function(req, res, next) {

  res.json(clubs);
});
/* A post by id */
app.get('/clubs/:slug',  function (req, res) {
  const slug = req.params.slug
  const row = clubs.find(r => r.slug == slug)  
  
  res.json(row)
  
})

app.get("/watch", function(req, res, next) {

  res.json(watch);
});
/* A post by id */
app.get('/watch/:slug',  function (req, res) {
  const slug = req.params.slug
  const row = watch.find(r => r.slug == slug)  
  
  res.json(row)
  
})
/* A post by id */
app.get('/featured/',  function (req, res) {
   res.json(featured)
})

app.get('/promo/:slug',  function (req, res) {
  const slug = req.params.slug
  const row = promo.find(r => r.slug == slug)  
  
  res.json(row)
  
})
/* A post by id */
app.get('/alltracks/',  function (req, res) {
  res.json(all)
})

app.get('/alltracks/:slug',  function (req, res) {
 const slug = req.params.slug
 const row = all.find(r => r.slug == slug)  
 
 res.json(row)
 
})
/* A post by id */
app.get('/mobile-alltracks/',  function (req, res) {
  res.json(mobile)
})

app.get('/mobile-alltracks/:slug',  function (req, res) {
 const slug = req.params.slug
 const row = mobile.find(r => r.slug == slug)  
 
 res.json(row)
 
})


app.get("/settings", function(req, res, next) {

    res.json(settings);
  });

  app.get("/notifications", function(req, res, next) {

    res.json(notifications);
  });
 

// Listen on port 5000
app.listen(port, () => {
  console.log(`Server is booming on port 5000
Visit http://localhost:5000`);
});
