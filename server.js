/* set up express */
const express = require('express')
const app = express()
app.use(express.static('public'))

/* twit setup */
const Twit = require('twit')
const config = {
  twitter: {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
  }
}
const twitInstance = new Twit(config.twitter)


/* helper function to get the time */
function generateStatus(){
  // put all your code inside here
  return 'cool status soooooooooon!'
}

// using uptimerobot to hit this endpoint every 5 minutes to tweet!
app.all('/it-has-been-5-minutes', (request, response) => {

  // get the time
  twitInstance.post('statuses/update', { status: generateStatus() }, (err, data, response) => {
    if (err){
      console.log('error: ', err);
    }
  })

  response.sendStatus(200)
})

const listener = app.listen(process.env.PORT, function () {
  console.log('Your bot is running on port ' + listener.address().port);
});
