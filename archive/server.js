var express = require('express'),
    app = express(),
    port = process.env.PORT || 4000;
 
const fs = require('fs');

const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');

//Allow images to be viewed
app.use(express.static('public'));

// Home page request
app.get('/', (req, res) => {
  res.send('Welcome<br> - <a href="/generate-gif">View Generated Image</a><br> - <a href="/dynamic-gif">View Dynamic Image</a>');
});

//Generate images
app.get('/generate-gif', (req, res) => {

  const width = 400;
  const height = 400;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  //Configure Gif Image
  const encoder = new GIFEncoder(width, height);
  encoder.createReadStream().pipe(fs.createWriteStream('./public/result.gif'));
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(1000);
  encoder.setQuality(10);

  //Generate an animated gif from a list of static images
  const imgList = fs.readdirSync('./images/');
  imgList.forEach(async (f, i) => {
    const image = await loadImage(`./images/${f}`);
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
    encoder.addFrame(ctx);
    if (i === imgList.length - 1) {
      encoder.finish();
      //res.send({ message: 'GIF Generated!' });
      res.send('Image Generated<br> <img src="/result.gif">');
    }
  });


});

//Generate images
app.get('/dynamic-gif', (req, res) => {

  const width = 500;
  const height = 100;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  //Configure Gif Image
  const encoder = new GIFEncoder(width, height);
  encoder.createReadStream().pipe(fs.createWriteStream('./public/dynamic.gif'));
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(1000);
  encoder.setQuality(10);

  // Countdown date to
  let countDownDate = new Date("Jan 27, 2024 11:20:00").getTime();

  //about 40 time zones
  console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Today's date and time
  let dateNow = new Date().getTime();
  let d = new Date();
  console.log(d.toString())

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

    const imageP =  loadImage(`./images/email-countdown-timer.gif`);
    imageP.then(image => {
      
      for (let i = 60; i >= 0; i--) {
        
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

        ctx.font = '45px Impact'
        ctx.fillStyle = "#FFFFFF";

        let seconds = i
        if(seconds < 10){
          seconds = "0" + seconds
        }

        ctx.fillText( days + "  :   " + hours + "   :   " + minutes + "   :   " + seconds, 15, 50);
        encoder.addFrame(ctx);

      }

      encoder.finish();
      res.send('Dynamic Image <br> <img src="/dynamic.gif">');

    })

  
  

})



//Configure server Listener
app.listen(port, () => {
  console.log('Server started on: ' + "http://localhost:" + port);
});