const request = require('request');

var express = require('express'),
    app = express(),
    port = process.env.PORT || 4000;
 
const fs = require('fs');

const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');

//Allow images to be viewed
app.use(express.static('public'));


//Example email page requesting image
app.get('/', (req, res) => {
  res.send('Dynamic Image - April 4, 2023 00:00:00 <br> <img src="/countdown">');
})


//Generate countdown animated gif
app.get('/countdown', (req, res) => {

  //about 40 time zones
  //https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  //console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)

  //Set Time Zone per guest
  let setTimeZone = 'UTC'
  if( req.query.tz != undefined){
    setTimeZone = req.query.tz
  }
  //process.env.TZ = setTimeZone
  console.log(setTimeZone)

  const width = 500;
  const height = 100;

  const { registerFont, createCanvas } = require('canvas')
  registerFont('./fonts/Inter-Regular.ttf', { family: 'Inter' })

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  //Configure Gif Image
  const encoder = new GIFEncoder(width, height);
  encoder.createReadStream().pipe(fs.createWriteStream('./public/countdown-img.gif'));
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(1000);
  encoder.setQuality(10);

  // Countdown date to
  let futureDate = "April 4, 2023 00:00:00"
  //let futureDate = "February 20 2023 12:24:00"
  let countDownDate = new Date(futureDate).getTime();

  // Today's date and time per time zone
  let getDateNow = new Date().toLocaleString('en-US', { timeZone: setTimeZone });
  console.log(getDateNow)
  let dateNow = new Date(getDateNow)

  //var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  //console.log( dateNow.toLocaleString('en-US', { timeZone: setTimeZone }) )
  //console.log((dateNow.getUTCMonth()+1) +"/"+  dateNow.getUTCDate() +"/"+ d.getUTCFullYear() + " " + dateNow.getUTCHours() + ":" + dateNow.getUTCMinutes() + ":" + dateNow.getUTCSeconds())

  /*
  let d = new Date();
  var now_utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(),
                d.getUTCDate(), d.getUTCHours(),
                d.getUTCMinutes(), d.getUTCSeconds());
  console.log(now_utc)
  const convDate = new Date(now_utc);
  console.log(convDate.toLocaleString())
  */

  // Difference between now and the countdown date
  let dateDiff = countDownDate - dateNow;

  // Time calculations for days, hours, minutes and seconds
  let days = Math.floor(dateDiff / (1000 * 60 * 60 * 24));
  if(days < 10 && days >= 0){
    days = "0" + days
  }
  if(days < 0){
    days = "00"
  }
  let hours = Math.floor((dateDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if(hours < 10 && hours >= 0){
    hours = "0" + hours
  }
  if(hours < 0){
    hours = "00"
  }
  let minutes = Math.floor((dateDiff % (1000 * 60 * 60)) / (1000 * 60));
  if(minutes < 10 && minutes >= 0){
    minutes = "0" + minutes
  }
  if(minutes < 0){
    minutes = "00"
  }
  //let seconds = Math.floor((dateDiff % (1000 * 60)) / 1000);
    


    //Background Color
    //ctx.fillStyle = '#FFFF00';
    //ctx.fillRect(0, 0, width, height);

    const imageP =  loadImage(`./images/countdown-temp1.gif`);
    imageP.then(image => {
      
      for (let i = 60; i >= 0; i--) {
        
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

        //ctx.font = '45px Impact'        
        ctx.font = '45px "Inter"'
        ctx.fillStyle = "#FFFFFF";

        let seconds = i
        if(seconds < 10){
          seconds = "0" + seconds
        }

        ctx.fillText( days + "  :   " + hours + "   :   " + minutes + "   :   " + seconds, 15, 50);
        encoder.addFrame(ctx);

      }

      encoder.finish();
      //res.send('Dynamic Image <br> <img src="/countdown-img.gif">');
      
      let rootURL = req.protocol + "://" + req.get('host');
      const url = rootURL + '/countdown-img.gif';

      request({
        url: url,
        encoding: null
      }, 
      (err, resp, buffer) => {
        if (!err && resp.statusCode === 200){
          res.set("Content-Type", "image/jpeg");
          res.send(resp.body);
          console.log("done")
        }
      });
      
      

    })

  

})



//Configure server Listener
app.listen(port, () => {
  console.log('Server started on: ' + "http://localhost:" + port);
});


// Test server
// https://dashboard.render.com/
// https://email-countdown-test.onrender.com/
//