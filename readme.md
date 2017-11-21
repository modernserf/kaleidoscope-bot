starter twitter bot!
=====================

This is a bot that, when complete, tweets something every five minutes - using [uptime robot](https://uptimerobot.com) monitoring :)

## A quick tutorial

1. create a twitter account at [twitter.com](http://twitter.com) (or log into an existing one)
2. create a twitter app at [apps.twitter.com](http://apps.twitter.com) to retrieve your app and client keys (botwiki [has made a great tutorial among others for this](https://botwiki.org/tutorials/how-to-create-a-twitter-app/)).
3. update the `.env` file with the client and app key and secrets you retrieved in the previous step
4. make sure that what you want your bot to do is programmed in `server.js`
5. log in or sign up for a free ([Uptime Robot](https://uptimerobot.com/) account and add a monitor to check `https://YOUR-PROJECT-NAME.glitch.me/it-has-been-5-minutes` as the URL and check every 5 minutes.
6. hope your bot works!!

Your Project
------------

On the back-end,
- your app starts at `server.js`
- add frameworks and packages in `package.json`
- safely store app secrets in `.env` (nobody can see this but you and people you invite)


Made by [Jenn](https://glitch.com/@jennschiffer) at [Fog Creek](https://fogcreek.com/)
-------------------

\ ゜o゜)ノ
