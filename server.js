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
  res.send('Dynamic Image - March 20, 2023 00:00:00 <br> <img src="/countdown">');
})


//Generate countdown animated gif
app.get('/countdown', (req, res) => {

  //Current time zone from machine
  //console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)

  process.env.TZ = 'UTC'

  //Set Time Zone per guest
  let setTimeZone = 'UTC'
  if( req.query.tz != undefined){
    setTimeZone = req.query.tz
  }
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
  let futureDate = "2023-03-20T00:00:00"
  if( req.query.fd != undefined){
    futureDate = req.query.fd
  }
  console.log('Future Date:', futureDate)
  let countDownDate = new Date(futureDate).getTime();
  console.log(countDownDate)
  
  // Today's date and time per time zone
  let getDateNow = new Date().toLocaleString('en-US', { timeZone: setTimeZone });
  console.log('Current Date:', getDateNow)
  let dateNow = new Date(getDateNow)


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
  console.log("hours:", hours)
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

