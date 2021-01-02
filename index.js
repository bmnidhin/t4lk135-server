const express = require("express");
const morgan = require('morgan')
const app = express();
const cors = require('cors');
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const verfiyToken =require('./utils/verifytoken')
const port = 5000;
const { Deta } = require("deta")
require('dotenv').config()
const episodes = './data/episodes.json'
const crowd = './data/playlists.json'

let posts = require(episodes)
let playlist = require(crowd)
let notifications = require("./data/notifications.json")
let settings = require("./data/settings.json")
let clubs = require("./data/club.json")
let featured = require("./data/featured.json")
let promo =require("./data/promo.json")
let all =require("./data/alltracks.json")

const bodyParser = require("body-parser");

const JWT_KEY =process.env.JWT

const deta = Deta(process.env.deta)
const db = deta.Base("humans")
const ep = deta.Base("episodes")
const log = deta.Base("log")
const like = deta.Base("likes")

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
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*'); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });



app.post('/signup', function(req, res){
  const password = req.body.password
  let  hashedPassword  =  bcrypt.hashSync(password, 8);
  const username = req.body.username
  
  const key = req.body.id
  // const newUser = { key:key, username:username, password:hashedPassword}
  db.put({
     key:username, password:hashedPassword
  })
  var  token  =  jwt.sign({ id:  key }, JWT_KEY, {expiresIn:  86400});
  res.send({
    auth:  true, token:  token
});
})

app.get('/user', verfiyToken, async (req, res) => {
  const id = req.body.username;
  const user = await db.get(id);
  if (user) {
      res.json(user);
  } else {
      res.status(404).json({"message": "user not found"});
  }
});
app.get('/login', (req, res) => {
  res.status(200).send({
    auth:  true,
    user: true,
    token:  true
})
  });
app.post('/login', async (req, res) => {
  const id = req.body.username;
  const user = await db.get(id);
  if (!user) {
   res.status(404).send('User not found');
  } 
  else {
    var  passwordisValid  =  bcrypt.compareSync(req.body.password, user.password);
    if (!passwordisValid) {
      return  res.status(401).send({
          auth:  false,
          token:  null
      })
  }

  var  token  =  jwt.sign({ id:  user.id }, JWT_KEY, {
      expiresIn:  86400
  });
  res.status(200).send({
      auth:  true,
      user: req.body.username,
      token:  token
  })
  }
  
});



app.post("/v2/listen", function(req, res, next) {
   
  ep.put({
    title:req.body.title,
    key:slugify(req.body.title),
    slug:slugify(req.body.title),
    inserted: new Date(),
    published:req.body.published,
    publishedAtDate:req.body.publishedAtDate,
    publishedAtTime:req.body.publishedAtTime,
    content:req.body.content,
    URL:req.body.URL,
    duration:req.body.duration,
    cover:req.body.cover
 })
 res.send(req.body.isEventPublished)
});

app.get('/v2/listen', async (req, res, next) => {
 
  const user = await ep.fetch({"published":true}).next();
  if (user) {
      res.json(user.value);
  } else {
      res.status(404).json({"message": "user not found"});
  }
});

app.get('/v2/listen/:slug', async (req, res) => {
  const slug = req.params.slug
  const user = await ep.get(slug);
  if (user) {
      res.json(user);
  } else {
      res.status(404).json({"message": "user not founds"});
  }
});

app.put('/v2/listen/:slug',verfiyToken, async (req, res) => {
  const id  =  req.params.slug;
  
  const toPut = {
    key: id, 
    title:req.body.title,
    slug:slugify(req.body.title),
    inserted: new Date(),
    published:req.body.published,
    publishedAtDate:req.body.publishedAtDate,
    publishedAtTime:req.body.publishedAtTime,
    content:req.body.content,
    URL:req.body.URL,
    duration:req.body.duration,
    cover:req.body.cover
    };
  const newItem = await ep.put(toPut);
  return res.json(newItem)
});

app.patch('/v2/listen/:slug', verfiyToken,  function (req, res) {
  const id  =  req.params.slug;
  
  const toPut = {
    key: id, 
    title:req.body.title,
    slug:slugify(req.body.title),
    inserted: new Date(),
    published:req.body.published,
    publishedAtDate:req.body.publishedAtDate,
    publishedAtTime:req.body.publishedAtTime,
    content:req.body.content,
    URL:req.body.URL,
    duration:req.body.duration,
    cover:req.body.cover
    };
  const newItem = ep.put(toPut);
  return res.json(newItem)
 
})
app.delete('/v2/listen/:slug', verfiyToken, async (req, res) => {
  const id = req.params.slug;
  await ep.delete(id);
  res.json({"message": "deleted"})
});

app.post("/v2/log",async function(req, res, next) {
  let d = new Date();
  await log.put({
    key:req.body.slug+ "-"+ req.body.userId ,
    name: req.body.name,
    userId: req.body.userId,
    
    title: req.body.title,
    type: req.body.type,
    progress: req.body.progress,
   
    slug: req.body.slug,
    cover: req.body.cover,
    time: d.getTime()
    
 })
 res.send({status :"done"})
});


app.get('/v2/log/:user', async (req, res, next) => {
  let uid = req.params.user
  const water = await log.fetch({"userId":uid}).next();
  
  if (water) {
      res.json(
      
       water.value
        
      
      );
  } else {
      res.status(404).json({"message": "user not found"});
  }
});

app.post("/v2/eplike",async function(req, res, next) {
   
  await like.put({
    key:req.body.slug+ "-"+ req.body.userId ,
    name: req.body.name,
    slug: req.body.slug,
    userId: req.body.userId,
    isLiked : req.body.isLiked
    
 })
 res.send({status :"done"})
});

app.get('/v2/eplike/:slug', async (req, res) => {
  const slug = req.params.slug
  const user = await like.get(slug);
  if (user) {
      res.json(user);
  } else {
      res.status(404).json({"message": "user not founds"});
  }
});

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

app.get("/clubs", function(req, res, next) {

  res.json(clubs);
});
/* A post by id */
app.get('/clubs/:slug',  function (req, res) {
  const slug = req.params.slug
  const row = clubs.find(r => r.slug == slug)  
  
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
