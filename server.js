require('dotenv').config()
var crypto = require('crypto')
var path = require('path')
var express = require('express')
var session = require('express-session')
var nunjucks = require('nunjucks')
var routes = require('./app/routes.js')
var documentationRoutes = require('./docs/documentation_routes.js')
var favicon = require('serve-favicon')
var app = express()
var documentationApp = express()
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var browserSync = require('browser-sync')
var config = require('./app/config.js')
var utils = require('./lib/utils.js')
var packageJson = require('./package.json')
var moment = require('moment')
var calendar = require('node-calendar');



// Grab environment variables specified in Procfile or as Heroku config vars
var releaseVersion = packageJson.version
var username = process.env.USERNAME
var password = process.env.PASSWORD
var env = process.env.NODE_ENV || 'development'
var useAuth = process.env.USE_AUTH || config.useAuth
var useAutoStoreData = process.env.USE_AUTO_STORE_DATA || config.useAutoStoreData
var useHttps = process.env.USE_HTTPS || config.useHttps
var useBrowserSync = config.useBrowserSync
var analyticsId = process.env.ANALYTICS_TRACKING_ID

env = env.toLowerCase()
useAuth = useAuth.toLowerCase()
useHttps = useHttps.toLowerCase()
useBrowserSync = useBrowserSync.toLowerCase()

var useDocumentation = (config.useDocumentation === 'true')

// Promo mode redirects the root to /docs - so our landing page is docs when published on heroku
var promoMode = process.env.PROMO_MODE || 'false'
promoMode = promoMode.toLowerCase()

// Disable promo mode if docs aren't enabled
if (!useDocumentation) promoMode = 'false'

// Force HTTPs on production connections. Do this before asking for basicAuth to
// avoid making users fill in the username/password twice (once for `http`, and
// once for `https`).

var isSecure = (env === 'production' && useHttps === 'true')

if (isSecure) {
  app.use(utils.forceHttps)
  app.set('trust proxy', 1) // needed for secure cookies on heroku
}

// Authenticate against the environment-provided credentials, if running
// the app in production (Heroku, effectively)
if (env === 'production' && useAuth === 'true') {
  app.use(utils.basicAuth(username, password))
}

// Set up App
var appViews = [path.join(__dirname, '/app/views/'), path.join(__dirname, '/lib/')]



var nunjucksAppEnv = nunjucks.configure(appViews, {
  autoescape: true,
  express: app,
  noCache: true,
  watch: true
})

// Nunjucks filters
utils.addNunjucksFilters(nunjucksAppEnv)

// Set views engine
app.set('view engine', 'html')

// Middleware to serve static assets
app.use('/public', express.static(path.join(__dirname, '/public')))
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_template/assets')))
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit')))
app.use('/public/images/icons', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit/images')))

// Elements refers to icon folder instead of images folder
app.use(favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'assets', 'images', 'favicon.ico')))

// Set up documentation app
if (useDocumentation) {
  var documentationViews = [path.join(__dirname, '/docs/views/'), path.join(__dirname, '/lib/')]

  var nunjucksDocumentationEnv = nunjucks.configure(documentationViews, {
    autoescape: true,
    express: documentationApp,
    noCache: true,
    watch: true
  })
  // Nunjucks filters
  utils.addNunjucksFilters(nunjucksDocumentationEnv)

  // Set views engine
  documentationApp.set('view engine', 'html')
}

// Support for parsing data in POSTs
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(cookieParser())

// Add variables that are available in all views
app.locals.analyticsId = analyticsId
app.locals.asset_path = '/public/'
app.locals.useAutoStoreData = (useAutoStoreData === 'true')
app.locals.cookieText = config.cookieText
app.locals.promoMode = promoMode
app.locals.releaseVersion = 'v' + releaseVersion
app.locals.serviceName = config.serviceName

// Support session data
app.use(session({
  cookie: {
    maxAge: 1000 * 60 * 60 * 4, // 4 hours
    secure: isSecure
  },
  // use random name to avoid clashes with other prototypes
  name: 'govuk-prototype-kit-' + crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  secret: crypto.randomBytes(64).toString('hex')
}))

// add nunjucks function called 'checked' to populate radios and checkboxes,
// needs to be here as it needs access to req.session and nunjucks environment
var addCheckedFunction = function (app, nunjucksEnv) {
  app.use(function (req, res, next) {
    nunjucksEnv.addGlobal('checked', function (name, value) {
      // check session data exists
      if (req.session.data === undefined) {
        return ''
      }

      var storedValue = req.session.data[name]

      // check the requested data exists
      if (storedValue === undefined) {
        return ''
      }

      var checked = ''

      // if data is an array, check it exists in the array
      if (Array.isArray(storedValue)) {
        if (storedValue.indexOf(value) !== -1) {
          checked = 'checked'
        }
      } else {
        // the data is just a simple value, check it matches
        if (storedValue === value) {
          checked = 'checked'
        }
      }
      return checked
    })

    next()
  })
}

if (useAutoStoreData === 'true') {
  app.use(utils.autoStoreData)
  addCheckedFunction(app, nunjucksAppEnv)
  addCheckedFunction(documentationApp, nunjucksDocumentationEnv)
}

// Disallow search index idexing
app.use(function (req, res, next) {
  // Setting headers stops pages being indexed even if indexed pages link to them.
  res.setHeader('X-Robots-Tag', 'noindex')
  next()
})

app.get('/robots.txt', function (req, res) {
  res.type('text/plain')
  res.send('User-agent: *\nDisallow: /')
})

app.get('/prototype-admin/clear-data', function (req, res) {
  req.session.destroy()
  res.render('prototype-admin/clear-data')
})

// Redirect root to /docs when in promo mode.
if (promoMode === 'true') {
  console.log('Prototype kit running in promo mode')

  app.get('/', function (req, res) {
    res.redirect('/docs')
  })

  // allow search engines to index the prototype kit promo site
  app.get('/robots.txt', function (req, res) {
    res.type('text/plain')
    res.send('User-agent: *\nAllow: /')
  })
} else {
  // Disallow search index idexing
  app.use(function (req, res, next) {
    // Setting headers stops pages being indexed even if indexed pages link to them.
    res.setHeader('X-Robots-Tag', 'noindex')
    next()
  })

  app.get('/robots.txt', function (req, res) {
    res.type('text/plain')
    res.send('User-agent: *\nDisallow: /')
  })
}

// routes (found in app/routes.js)
if (typeof (routes) !== 'function') {
  console.log(routes.bind)
  console.log('Warning: the use of bind in routes is deprecated - please check the prototype kit documentation for writing routes.')
  routes.bind(app)
} else {
    // Handle 404
  

  //routes
  app.use('/assess/mvp/', require('./app/views/assess/mvp/_routes.js'))
  app.use('/assess/v1/', require('./app/views/assess/v1/_routes.js'))
  app.use('/assess/v2/', require('./app/views/assess/v2/_routes.js'))
  app.use('/assess/v3/', require('./app/views/assess/v3/_routes.js'))
  app.use('/assess/v3Upgrade/', require('./app/views/assess/v3Upgrade/_routes.js'))
  app.use('/assess/v4/', require('./app/views/assess/v4/_routes.js'))
  app.use('/assess/v5/', require('./app/views/assess/v5/_routes.js'))
  app.use('/assess/v6/', require('./app/views/assess/v6/_routes.js')) 
  app.use('/assess/v7/', require('./app/views/assess/v7/_routes.js'))  
  app.use('/assess/v7a/', require('./app/views/assess/v7a/_routes.js'))  
  app.use('/assess/v8/', require('./app/views/assess/v8/_routes.js')) 
  app.use('/assess/v8a/', require('./app/views/assess/v8a/_routes.js'))  
  app.use('/assess/v9/', require('./app/views/assess/v9/_routes.js'))   
  app.use('/assess/v9a/', require('./app/views/assess/v9a/_routes.js')) 
  app.use('/assess/v9b/', require('./app/views/assess/v9b/_routes.js')) 
  app.use('/assess/v9d/', require('./app/views/assess/v9d/_routes.js'))
  app.use('/assess/v10/', require('./app/views/assess/v10/_routes.js'))  
  app.use('/assess/v10a/', require('./app/views/assess/v10a/_routes.js'))
  app.use('/assess/v10b/', require('./app/views/assess/v10b/_routes.js'))
  app.use('/assess/v11/', require('./app/views/assess/v11/_routes.js')) 
  app.use('/assess/v12/', require('./app/views/assess/v12/_routes.js')) 
  app.use('/caselist/v1/', require('./app/views/caselist/v1/_routes.js')) 

  app.use('/appoint/v1/', require('./app/views/appoint/v1/_routes.js'))
  app.use('/appoint/v2/', require('./app/views/appoint/v2/_routes.js'))
  app.use('/appoint/v3/', require('./app/views/appoint/v3/_routes.js')) 
  app.use('/appoint/v3-1/', require('./app/views/appoint/v3-1/_routes.js'))
  app.use('/appoint/v4/', require('./app/views/appoint/v4/_routes.js')) 
  app.use('/appoint/v5/', require('./app/views/appoint/v5/_routes.js'))    
  app.use('/appoint/v6/', require('./app/views/appoint/v6/_routes.js'))    
  app.use('/appoint/v7/', require('./app/views/appoint/v7/_routes.js'))    
  app.use('/appoint/v8/', require('./app/views/appoint/v8/_routes.js'))   
  app.use('/appoint/v8-1/', require('./app/views/appoint/v8-1/_routes.js'))   
  app.use('/appoint/v8-2/', require('./app/views/appoint/v8-2/_routes.js'))   
  app.use('/appoint/v8-3/', require('./app/views/appoint/v8-3/_routes.js'))   
  app.use('/appoint/v8-4/', require('./app/views/appoint/v8-4/_routes.js'))   
  app.use('/appoint/v8-5/', require('./app/views/appoint/v8-5/_routes.js'))   
  app.use('/appoint/v9/', require('./app/views/appoint/v9/_routes.js'))   
  app.use('/appoint/v10/', require('./app/views/appoint/v10/_routes.js'))   
  app.use('/appoint/v11/', require('./app/views/appoint/v11/_routes.js'))   
  app.use('/appoint/v12/', require('./app/views/appoint/v12/_routes.js')) 
  app.use('/appoint/v13/', require('./app/views/appoint/v13/_routes.js')) 
  app.use('/appoint/v14/', require('./app/views/appoint/v14/_routes.js')) 

  app.use('/vouch/', require('./app/views/vouch/_routes.js'))
  app.use('/esa113/', require('./app/views/esa113/_routes.js'))

  app.use('/fha/v1', require('./app/views/fha/v1/_routes.js')) 
  app.use('/fha/v1-1', require('./app/views/fha/v1-1/_routes.js')) 
  app.use('/fha/v2', require('./app/views/fha/v2/_routes.js')) 


  app.use('/fha/v3', require('./app/views/fha/v3/_routes.js')) 
  app.use('/fha/v4', require('./app/views/fha/v4/_routes.js')) 
  app.use('/fha/v5', require('./app/views/fha/v5/_routes.js'))
  app.use('/fha/v6', require('./app/views/fha/v6/_routes.js'))
  app.use('/fha/v7', require('./app/views/fha/v7/_routes.js'))  
  app.use('/fha/v8', require('./app/views/fha/v8/_routes.js'))
  app.use('/fha/v9', require('./app/views/fha/v9/_routes.js'))
  app.use('/fha/scrutiny-scenarios', require('./app/views/fha/scrutiny-scenarios/_routes.js')) 
  app.use('/fha/appointment-scenarios', require('./app/views/fha/appointment-scenarios/_routes.js')) 
  app.use('/fha/capacity-scenarios', require('./app/views/fha/capacity-scenarios/_routes.js')) 
  app.use('/fha/assessment-scenarios', require('./app/views/fha/assessment-scenarios/_routes.js')) 
  app.use('/', routes)

  
}

// Returns a url to the zip of the latest release on github
app.get('/prototype-admin/download-latest', function (req, res) {
  var url = utils.getLatestRelease()
  res.redirect(url)
})

if (useDocumentation) {
  // Copy app locals to documentation app locals
  documentationApp.locals = app.locals

  // Create separate router for docs
  app.use('/docs', documentationApp)

  // Docs under the /docs namespace
  documentationApp.use('/', documentationRoutes)
}

// Strip .html and .htm if provided
app.get(/\.html?$/i, function (req, res) {
  var path = req.path
  var parts = path.split('.')
  parts.pop()
  path = parts.join('.')
  res.redirect(path)
})

// Auto render any view that exists

// App folder routes get priority
app.get(/^\/([^.]+)$/, function (req, res) {
  utils.matchRoutes(req, res)
})

if (useDocumentation) {
  // Documentation  routes
  documentationApp.get(/^\/([^.]+)$/, function (req, res) {
    if (!utils.matchMdRoutes(req, res)) {
      utils.matchRoutes(req, res)
    }
  })
}

// redirect all POSTs to GETs - this allows users to use POST for autoStoreData
app.post(/^\/([^.]+)$/, function (req, res) {
  res.redirect('/' + req.params[0])
})

console.log("\x1b[37m"+'\nGOV.UK Prototype kit v' + releaseVersion+"\x1b[0m")
// Display warning not to use kit for production services.
console.log('\nNOTICE: the kit is for building prototypes, do not use it for production services.')

// start the app
utils.findAvailablePort(app, function (port) {
  console.log('Listening on port ' + port + '   url: ' + "\x1b[36m" + 'http://localhost:' + port + "\x1b[0m")
  if (env === 'production' || useBrowserSync === 'false') {
    app.listen(port)
  } else {
    app.listen(port - 50, function () {
      browserSync({
        proxy: 'localhost:' + (port - 50),
        port: port,
        ui: false,
        files: ['public/**/*.*', 'app/views/**/*.*'],
        ghostmode: false,
        open: false,
        notify: false,
        logLevel: 'error'
      })
    })
  }
})

module.exports = app
