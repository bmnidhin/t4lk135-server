# REST API For Audio Tracks

````
 "routes": [
        {
          "src": "/listen",
          "dest": "/index.js",
          "methods": ["GET"]
        },
        {
          "src": "/listen/(?<slug>[^/]+)",
          "dest": "/index.js",
          "methods": ["GET"]
        },
        {
            "src": "/playlist",
            "dest": "/index.js",
            "methods": ["GET"]
          },
          {
            "src": "/playlist/(?<slug>[^/]+)",
            "dest": "/index.js",
            "methods": ["GET"]
          },
          {
            "src": "/clubs",
            "dest": "/index.js",
            "methods": ["GET"]
          },
          {
            "src": "/clubs/(?<slug>[^/]+)",
            "dest": "/index.js",
            "methods": ["GET"]
          },
          {
            "src": "/featured",
            "dest": "/index.js",
            "methods": ["GET"]
          },
          {
            "src": "/promo/(?<slug>[^/]+)",
            "dest": "/index.js",
            "methods": ["GET"]
          },
          {
            "src": "/settings",
            "dest": "/index.js",
            "methods": ["GET"]
          },
          {
            "src": "/notifications",
            "dest": "/index.js",
            "methods": ["GET"]
          }
      ]
````
