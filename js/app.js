const express = require('express');
const moment = require('moment');
const Twit = require('twit')
const config = require('./config.js');
const T = new Twit(config)
const app = express();
const path = require('path');
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
let tweets = [];

app.use('/static', express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
//get username and tweets from user object defined in config.js
T.get('statuses/user_timeline', {count: 5}, (err, data, res)=>{
  data.forEach((tweet) => {
    let tw = {};
    tw.screenName = tweet.user.screen_name;
    tw.name = tweet.user.name;
    tw.tweetText = tweet.text;
    let time = tweet.created_at;
    tw.tweetTime = moment(time, 'ddd MMM DD HH:mm:ss Z YYYY').format('ddd MMM DD YYYY HH:mm');
    tw.reTweet = tweet.retweet_count;
    tw.favTweet = tweet.favorite_count;
    tw.friendCount = tweet.user.friends_count;
    tw.avitar = tweet.user.profile_image_url;
    tweets.push(tw);
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
   res.render('index.pug', {tweets, friends, messages});
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
