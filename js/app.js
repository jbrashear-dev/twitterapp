const express = require('express');
const moment = require('moment');
const Twit = require('twit')
const config = require('./config.js');
const T = new Twit(config)
const app = express();
let screenName;
let avitar;
let name;
let tweetText;
let tweetTime;
let reTweet;
let favTweet;
let friendCount;
let friends = [];
let messageTime;
let messageDate;
let messages = []

app.use('/static', express.static('../public'));
app.set('views', '../views');
app.set('view engine', 'pug');
//get username and tweets from user object defined in config.js
T.get('statuses/user_timeline', {count: 5}, (err, data, res)=>{
  data.forEach((tweet) => {
    screenName = tweet.user.screen_name;
    name = tweet.user.name;
    tweetText = tweet.text;
    let time = tweet.created_at;
    tweetTime = moment(time, 'ddd MMM DD HH:mm:ss Z YYYY').format('ddd MMM DD YYYY HH:mm');
    reTweet = tweet.retweet_count;
    favTweet = tweet.favorite_count;
    friendCount = tweet.user.friends_count;
    avitar = tweet.user.profile_image_url;
  })
});
//get friends list
T.get('friends/list', {count: 5}, (err, data, res) => {
  data.users.forEach((friend) => {
    let followed = {};
    followed.name = friend.name;
    followed.screenName = friend.screen_name;
    followed.image = friend.profile_image_url;
    friends.push(followed);
  })
})
//get direct_messages ..... will need to be changed in the future to activity api
T.get('direct_messages/events/list', {count: 5}, (err, data, res) => {
  data.events.forEach((message) => {
    let dm ={};
    dm.messageText = message.message_create.message_data.text;
    time = parseInt(message.created_timestamp);
    dm.messageTime = moment(time).fromNow();
    dm.messageDate = moment(time).format('ddd MMM DD YYYY');
    messages.push(dm);
  });
})

app.get('/', (req,res) => {
   res.render('index.pug', {screenName, name, avitar, tweetText, tweetTime, reTweet
                            , favTweet, friendCount, friends, messages});
 })

 app.use((req, res, next) =>{
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.error = err;
  res.status(err.status);
  res.render('error');
});

app.listen(3030, () => {
  console.log('TwitterBot running on 3030... ')
});
