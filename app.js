'use strict'
let express = require('express')
let path = require('path')
let favicon = require('serve-favicon')
let logger = require('morgan')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')

let app = express()



// MKR1000 stuffs
let httpServer = require("http").Server(app)
let io = require('socket.io')(httpServer)

httpServer.listen(3000)

let net = require('net')
let five = require('johnny-five')
let firmata = require('firmata')

// set options to match Firmata config for wifi
// using MKR1000 with WiFi101
var options = {
  host: '192.168.1.9',
  port: 3030
}

var led, moistureSensor, tempSensor, lightSensor

net.connect(options, function() { //'connect' listener
  console.log('connected to server!')

  var socketClient = this

  // use the socketClient instead of a serial port for transport
  var boardIo = new firmata.Board(socketClient)

  boardIo.once('ready', function(){
    console.log('boardIo ready')
    boardIo.isReady = true

    var board = new five.Board({io: boardIo, repl: true})

    board.on('ready', function(){
      // full Johnny-Five support here
      console.log('five ready')

      // setup led to correct pin
      led = new five.Led(6)

      pulseLed(led, 2000, function () {
        console.log('LED √')
      })

      // setup temperature sensor LM35
      tempSensor = new five.Thermometer({
        controller: "LM35",
        pin: "A1"
      })

      // setup moisture sensor to correct pin
      moistureSensor = new five.Sensor({
        pin: 'A2'
      })

      // setup light sensor to correct pin
      lightSensor = new five.Sensor({
        pin: "A3",
        freq: 250
      })

      io.on('connection', function (socket) {
        console.log(socket.id)

        // led actions
        //socket.on('led:on', function (data) {
        //  led.on()
        //  console.log('led:on received')
        //})
        //
        //socket.on('led:off', function (data) {
        //  led.off()
        //  console.log('led:off received')
        //
        //})
        //
        //socket.on('led:pulse', function (data) {
        //  pulseLed(led, 2000, function () {
        //    socket.emit('done:pulsing')
        //  })
        //  console.log('led:pulse received')
        //})

        setInterval(function () {
          socket.emit('chart:data', {
            date: new Date().getTime(),
            value: [getTemp(tempSensor), getLight(lightSensor), getMoisture(moistureSensor)] })
        }, 1000)
      })

    })
  })

})

function getTemp(tempSensor) {
  return +tempSensor.fahrenheit.toFixed(1)
}

function getLight(tempSensor) {
  return Math.round(lightSensor.value/1023*100)
}

function getMoisture(moisture) {
  return Math.round(moisture.value/1023*100)
}

function pulseLed(led, duration, cb) {
  led.blink()
  setTimeout(function () {
    led.stop().off()
    cb()
  }, duration)
}

// setting app stuff
app.locals.title = 'MKR1000'

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}))
app.use(express.static(path.join(__dirname, 'public')))


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index')
})