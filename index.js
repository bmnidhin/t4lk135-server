const express = require("express");
const morgan = require('morgan')
const app = express();
const cors = require('cors');
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const verfiyToken =require('./utils/verifytoken')
const port = 5000;

const episodes = './data/episodes.json'
const crowd = './data/playlists.json'

let posts = require(episodes)
let playlist = require(crowd)
let notifications = require("./data/notifications.json")
let settings = require("./data/settings.json");
const bodyParser = require("body-parser");

const JWT_KEY =" WinterIsComingGOT2019"
let Datastore = require('nedb'),
users = new Datastore('./data/users.db');
songs = new Datastore('./data/tom.db');
site = new Datastore('./data/site.db');

users.loadDatabase();
songs.loadDatabase()
site.loadDatabase()
app.use(cors());
// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
// Morgan
app.use(morgan('tiny'))
// app.use(bodyParser)
var html = "<!DOCTYPE html>\n<html>\n    <head>\n    </head>\n <body>\n      <h1>TKMSHOW EXPRESS REST API</h1>\n  \n <h3>API ENDPOINTS</h3> <script src='https://gist.github.com/bmnidhin/2b6b06974246a2a8254061383b0ba726.js'></script></body>\n</html>";
// Home route
app.get("/", (req, res) => {
    res.send(html);
    
  });

app.post('/signup', function(req, res){
  let  hashedPassword  =  bcrypt.hashSync(req.body.password, 8);
  const username = req.body.username
  const password = req.body.password
 
  const newUser = {username:username, password:hashedPassword}
   users.insert(newUser, function (err, newDoc,user) {   
    var  token  =  jwt.sign({ id:  newDoc._id }, JWT_KEY, {expiresIn:  86400});
    res.send({
      auth:  true, user: newDoc, token:  token
  });

  });

 
})

app.get('/user', verfiyToken, function(req, res, next){
  users.findOne({ username:  req.body.username },{ password:  0 }, function(err, user) {
      if(err) {
          return  res.status(500).send('There was a problem finding the user');
      }

      if(!user) {
          return  res.status(404).send('No user found')
      }

      res.status(200).send(user)
  });
});

app.post('/login', function(req, res) {
  users.findOne({ username:  req.body.username }, function(err, user) {
      if(err) {
          return  res.status(200).send('Server error encountered');
      }

      if(!user) {
          return  res.status(404).send('User not found');
      }

      var  passwordisValid  =  bcrypt.compareSync(req.body.password, user.password);

      if (!passwordisValid) {
          return  res.status(401).send({
              auth:  false,
              token:  null
          })
      }

      var  token  =  jwt.sign({ id:  user._id }, JWT_KEY, {
          expiresIn:  86400
      });

      res.status(200).send({
          auth:  true,
          user: req.body.username,
          token:  token
      })
  })
})



app.post("/v2/listen", verfiyToken, function(req, res, next) {
   

  
  let episode={
    title:req.body.title,
    slug:slugify(req.body.title),
    inserted: new Date(),
    published:req.body.isEventPublished,
    publishedAtDate:req.body.publishedAtDate,
    publishedAtTime:req.body.publishedAtTime,
    content:req.body.content,
    URL:req.body.URL,
    duration:req.body.duration,
    cover:req.body.cover
  }
  songs.insert(episode,function (err, newDoc) {   // Callback is optional
   res.send({sucesss:true,data:newDoc})
  })
  
});

app.get("/v2/listen",function(req, res, next){
  songs.find({}).sort({ inserted: -1}).exec(function (err, docs) {
   
    songs.count({}, function (err, count) {
      res.setHeader('Access-Control-Expose-Headers', "X-Total-Count")
      res.setHeader('X-Total-Count', count)
      res.send(docs)
    });

  });
}
)

app.get('/v2/listen/:slug',  function (req, res) {
   const slug = req.params.slug
  songs.findOne({ slug: slug }, function (err, doc) {
    res.send(doc)
  });
  
  // res.json(slug)
  
})
app.patch('/v2/listen/:slug', verfiyToken,  function (req, res) {
  const slug = req.params.slug
  let episode={
    title:req.body.title,
    slug:slugify(req.body.title),
    // inserted: new Date(),
    published:req.body.isEventPublished,
    publishedAtDate:req.body.publishedAtDate,
    publishedAtTime:req.body.publishedAtTime,
    content:req.body.content,
    URL:req.body.URL,
    duration:req.body.duration,
    cover:req.body.cover
  }
  songs.update({ slug: slug }, { $set: episode }, { multi: true }, function (err, numReplaced) {
    res.send({suceess:true, replaced : numReplaced})
  });
   
 
 // res.json(slug)
 
})
app.delete('/v2/listen/:slug', verfiyToken, function(req,res){
  const slug = req.params.slug
  songs.remove({slug:slug}, { multi: true }, function (err, numRemoved) {
    res.send({removed:true, removed:numRemoved})
  });
})

app.delete('/v2/listen/delete', verfiyToken, function(req,res){
  songs.remove({}, { multi: true }, function (err, numRemoved) {
    res.send({removed:true, removed:numRemoved})
  });
})











/* All posts */
app.get("/listen", function(req, res, next) {

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

function slugify(string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return string.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

// app.post('/v2/settings', verfiyToken, function(req, res, next) {
   

  
//   let settings={
//      posterImgOne:req.body.posterImgOne ,
//      posterImgTwo: req.body.posterImgTwo ,
//      upComingEventName:req.body.upComingEventName,
//      upComingEventDate:req.body.upComingEventDate
//   }
//   site.insert(settings,function (err, newDoc) {   // Callback is optional
//    res.send({sucesss:true,data:newDoc})
//   })
  
// });

// app.get("/v2/settings",function(req, res, next){
//   site.find({}).exec(function (err, docs) {
   
//     songs.count({}, function (err, count) {
//       res.setHeader('Access-Control-Expose-Headers', "X-Total-Count")
//       res.setHeader('X-Total-Count', count)
//       res.send(docs)
//     });

//   });
// })

// app.patch('/v2/settings', verfiyToken,  function (req, res) {
  
//   let settings={
//     posterImgOne:req.body.posterImgOne ,
//     posterImgTwo: req.body.posterImgTwo ,
//     upComingEventName:req.body.upComingEventName,
//     upComingEventDate:req.body.pComingEventDate
//  }
//   site.update({}, { $set: settings }, { multi: true }, function (err, numReplaced) {
//     res.send({suceess:true, replaced : numReplaced})
//   });
   
 
//  // res.json(slug)
 
// })