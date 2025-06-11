# Phaser Webpack Template

This is a Phaser 3 project template that uses webpack for bundling. It supports hot-reloading for quick development workflow and includes scripts to generate production-ready builds.

**[This Template is also available as a TypeScript version.](https://github.com/phaserjs/template-webpack-ts)**

### Versions

 "scripts": {
        "build": "webpack --config webpack/config.js",
        "copy:docs": "cp -R dist/* docs/",
        "dev:both": "npm run dev && npm run copy:docs"
        }


This template has been updated for:

- [Phaser 3.90.0](https://github.com/phaserjs/phaser)
- [Webpack 5.99.6](https://github.com/webpack/webpack)

![screenshot](screenshot.png)

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run dev-nolog` | Launch a development web server without sending anonymous data (see "About log.js" below) |
| `npm run build-nolog` | Create a production build in the `dist` folder without sending anonymous data (see "About log.js" below) |

## Writing Code

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm run dev`.

The local development server runs on `http://localhost:8080` by default. Please see the webpack documentation if you wish to change this, or add SSL support.

Once the server is running you can edit any of the files in the `src` folder. Webpack will automatically recompile your code and then reload the browser.

## Template Project Structure

We have provided a default project structure to get you started. This is as follows:

| Path                         | Description                                                |
|------------------------------|------------------------------------------------------------|
| `public/index.html`          | A basic HTML page to contain the game.                     |
| `public/assets`              | Game sprites, audio, etc. Served directly at runtime.      |
| `public/style.css`           | Global layout styles.                                      |
| `src/main.js`                | Application bootstrap.                                     |
| `src/game`                   | Folder containing the game code.                           |
| `src/game/main.js`           | Game entry point: configures and starts the game.          |
| `src/game/scenes`            | Folder with all Phaser game scenes.                        |


## Handling Assets

Webpack supports loading assets via JavaScript module `import` statements.

This template provides support for both embedding assets and also loading them from a static folder. To embed an asset, you can import it at the top of the JavaScript file you are using it in:

```js
import logoImg from './assets/logo.png'
```

To load static files such as audio files, videos, etc place them into the `public/assets` folder. Then you can use this path in the Loader calls within Phaser:

```js
preload ()
{
    //  This is an example of an imported bundled image.
    //  Remember to import it at the top of this file
    this.load.image('logo', logoImg);

    //  This is an example of loading a static image
    //  from the public/assets folder:
    this.load.image('background', 'assets/bg.png');
}
```

When you issue the `npm run build` command, all static assets are automatically copied to the `dist/assets` folder.

## Deploying to Production

After you run the `npm run build` command, your code will be built into a single bundle and saved to the `dist` folder, along with any other assets your project imported, or stored in the public assets folder.

In order to deploy your game, you will need to upload *all* of the contents of the `dist` folder to a public facing web server.

## Customizing the Template

### Babel

You can write modern ES6+ JavaScript and Babel will transpile it to a version of JavaScript that you want your project to support. The targeted browsers are set in the `.babelrc` file and the default currently targets all browsers with total usage over "0.25%" but excludes IE11 and Opera Mini.

 ```
"browsers": [
  ">0.25%",
  "not ie 11",
  "not op_mini all"
]
 ```

### Webpack

If you want to customize your build, such as adding a new webpack loader or plugin (i.e. for loading CSS or fonts), you can modify the `webpack/config.js` file for cross-project changes, or you can modify and/or create new configuration files and target them in specific npm tasks inside of `package.json`. Please see the [Webpack documentation](https://webpack.js.org/) for more information.

## About log.js

If you inspect our node scripts you will see there is a file called `log.js`. This file makes a single silent API call to a domain called `gryzor.co`. This domain is owned by Phaser Studio Inc. The domain name is a homage to one of our favorite retro games.

We send the following 3 pieces of data to this API: The name of the template being used (vue, react, etc). If the build was 'dev' or 'prod' and finally the version of Phaser being used.

At no point is any personal data collected or sent. We don't know about your project files, device, browser or anything else. Feel free to inspect the `log.js` file to confirm this.

Why do we do this? Because being open source means we have no visible metrics about which of our templates are being used. We work hard to maintain a large and diverse set of templates for Phaser developers and this is our small anonymous way to determine if that work is actually paying off, or not. In short, it helps us ensure we're building the tools for you.

However, if you don't want to send any data, you can use these commands instead:

Dev:

```bash
npm run dev-nolog
```

Build:

```bash
npm run build-nolog
```

Or, to disable the log entirely, simply delete the file `log.js` and remove the call to it in the `scripts` section of `package.json`:

Before:

```json
"scripts": {
    "dev": "node log.js dev & dev-template-script",
    "build": "node log.js build & build-template-script"
},
```

After:

```json
"scripts": {
    "dev": "dev-template-script",
    "build": "build-template-script"
},
```

Either of these will stop `log.js` from running. If you do decide to do this, please could you at least join our Discord and tell us which template you're using! Or send us a quick email. Either will be super-helpful, thank you.

## Join the Phaser Community!

We love to see what developers like you create with Phaser! It really motivates us to keep improving. So please join our community and show-off your work 😄

**Visit:** The [Phaser website](https://phaser.io) and follow on [Phaser Twitter](https://twitter.com/phaser_)<br />
**Play:** Some of the amazing games [#madewithphaser](https://twitter.com/search?q=%23madewithphaser&src=typed_query&f=live)<br />
**Learn:** [API Docs](https://newdocs.phaser.io), [Support Forum](https://phaser.discourse.group/) and [StackOverflow](https://stackoverflow.com/questions/tagged/phaser-framework)<br />
**Discord:** Join us on [Discord](https://discord.gg/phaser)<br />
**Code:** 2000+ [Examples](https://labs.phaser.io)<br />
**Read:** The [Phaser World](https://phaser.io/community/newsletter) Newsletter<br />

Created by [Phaser Studio](mailto:support@phaser.io). Powered by coffee, anime, pixels and love.

The Phaser logo and characters are &copy; 2011 - 2025 Phaser Studio Inc.

All rights reserved.

# RACER-GAME TODO

# Follow these coding guidelines:

# USE Phaser 3.87.0 API Documentation Whenever possible.
# URL: https://docs.phaser.io/api-documentation/api-documentation
# Phaser.js is the source code for the Phaser API you have permission to check it before creating code.

# Always try and use Phaser for as a guide for creating code.
# Always try to use established code first before making new functions or classes.
# When making suggestions for code always include the filename at the top. 

######
# Features to add
# User login and log off
# Splash page (Boot.js)
# MainMenu interface - game choice BOTS OR MULTIPLAYER
# LOBBY for Multiplayer set up. 10 players
# HUMAN Car Controls - For Mobile and Computer
# Multiple Track Choices -
# Preview of all Cars and Driver (player names)
# NUMBERS to top of cars
# Camera System - World Turns around charecter
# -- mini map idk if its needed
# POWER UP Obstacles, Speed Up, Slowdowns
# SPECIAL Car abilities - dump oil, super slam
# Point system for damage, hits, special objects
# history database, login, car info
# car customization and powers 
# multiple car types with specific parameters
# persistant game where multi players can drop in. 
# reward system for engagement.

#. Ways to Make Bots Learn or Optimize Their Route
1. Dynamic Waypoint Selection (Simple Improvement)
Instead of always going to the next waypoint, let the bot pick the nearest or most "reachable" waypoint if it misses one.
You can also allow bots to skip waypoints if they're closer to a later one (useful for shortcuts).
2. Multiple Paths / Branches
Design your track with alternate waypoint routes (like real racing lines).
Bots can randomly or strategically choose between them, or pick the one with less traffic.
3. Racing Line Optimization (Intermediate)
Precompute an "optimal racing line" (the smoothest, fastest path through the waypoints).
Bots follow this line, adjusting for obstacles and other cars.
4. Machine Learning (Advanced)
Use reinforcement learning (RL) to let bots "learn" the fastest way around the track by trial and error.
This is complex and requires a training phase, but can produce very human-like racing behavior.
Example: DeepRacer or OpenAI Gym CarRacing-v0.
5. Record and Replay (Practical)
Record a fast lap by a human or a "ghost" bot, then have AI bots follow that path as their racing line.

# README RACER-GAME


## Features


## Installation

- [Describe key features of your game, e.g. single/multiplayer, different tracks, customizable vehicles, etc.]
- [List technologies or frameworks used]
# player controled race car competes against AI controlled race cars.
# player controls the car by mouse/trackpad/touch screen input with the direction of the car shown with a small white dot at the front of the car. 
# all car png images are oriented to the right, 0 degrees, this is the front of the car. The rear of the car is at 270, to the left. s
# Each race is on a different track, 3 laps per race.
# The car field starts in 2 rows with 3 columns.
# A lap is recorded when a car completes the entire track from the starting line through the track to the starting line, this is 1 lap. This is also where the game finishes, when all cars complete 3 laps.
# in post race, after all cars finish the race - all the cars continue at a preset lower speed while the game summary is shown on the game screen.  
# the player can start the next track by space bar input. 


# I need to create three tracks for my racing game. These tracks should use the same cars and start file, each track could be considered a level or progression to a championship.   I need a simple AI driver for the AI cars- these AI will avoid the walls of the track and other cars, although sometimes cars will hit each other.   There needs to be a player input for the car direction using player controls the car by mouse/trackpad/touch screen input with the direction of the car shown with a small white dot at the front of the car.  # racer-game-new

