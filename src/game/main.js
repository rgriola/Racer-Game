/*import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { AUTO, Game } from 'phaser';
*/
import { AUTO, Game } from 'phaser';
import { Boot } from './scenes/Boot.js';
import { Preloader } from './scenes/Preloader.js';
import { Start } from './scenes/Start.js';
import { Game as MainGame } from './scenes/Game.js';
import { GameOver } from './scenes/GameOver.js';
import { TrackTest } from './scenes/TrackTest.js';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    title: 'Racer-Game',
    description: 'A great short racer',
    parent: 'game-container',
    dom: {
        createContainer: true
    },
    width: 1500,
    height: 650,
    backgroundColor: '#028af8',
    fps: {
        target: 60,
        forceSetTimeout: true
    },
    physics: {
        default: 'matter',
        matter: {
            //debug: true,
            gravity: { x: 0, y: 0 }
        },
    },
    scene: [
        Boot,
        Preloader,
        Start,
        //TrackTest,
        MainGame,
        GameOver
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};
window.DEBUG = false;
const StartGame = (parent) => {

    return new Game({ ...config, parent });

}

export default StartGame;

/*
/////////////////////////////////////
import { Boot } from './scenes/Boot.js';
import { Preloader } from './scenes/Preloader.js';
import { Start } from './scenes/Start.js';
import { Game } from './scenes/Game.js';
import { GameOver } from './scenes/GameOver.js';
import { TrackTest } from './scenes/TrackTest.js';

const config = {
    type: Phaser.AUTO,
    title: 'Racer-Game',
    description: 'A great short racer',
    parent: 'game-container',
    dom: {
        createContainer: true
    },
    width: 1500,
    height: 650,
    backgroundColor: '#028af8',
    fps: {
        target: 60,
        forceSetTimeout: true
    },
    physics: {
        default: 'matter',
        matter: {
            //debug: true,
            gravity: { x: 0, y: 0 }
        },
    },
    scene: [
        Boot,
        Preloader,
        //Start,
        //TrackTest,
        Game,
        GameOver
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
}
window.DEBUG = false;
new Phaser.Game(config);
*/