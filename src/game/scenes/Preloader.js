import { Scene } from 'phaser';

import CAR_CONFIG from '../carConfig.js';

export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        const centreX = this.scale.width * 0.5;
        const centreY = this.scale.height * 0.5;

        const barWidth = 468;
        const barHeight = 32;
        const barMargin = 4;
        //  We loaded this image in our Boot Scene, so we can display it here

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(centreX, centreY, barWidth, barHeight).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(centreX - (barWidth * 0.5) + barMargin, 
                                    centreY, barMargin, barHeight - barMargin, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = barMargin + ((barWidth - (barMargin * 2)) * progress);
            });
    }

    preload() {
        this.load.image('red', 'assets/red.png');

        this.load.image('bg_track', 'assets/bg_track.png');
        //src/assets/track/finishline.png
        this.load.image('finishline', 'assets/track/finishline.png');
        this.load.image('wall_orange_200', 'assets/track/wall_orange_200.png');
        this.load.image('wall_poly_green', 'assets/track/wall_poly_green.png');
        this.load.image('wall_poly_orange', 'assets/track/wall_poly_orange.png');
        this.load.image('wall_red_100_vert', 'assets/track/wall_red_100_vert.png');
        this.load.image('wall_red_100', 'assets/track/wall_red_100.png');
        this.load.image('wall_red_200', 'assets/track/wall_red_200.png');
        this.load.image('wall_white_100_vert', 'assets/track/wall_white_100_vert.png');
        this.load.image('wall_white_100', 'assets/track/wall_white_100.png');

    
    // Load the car images from carConfig.js
    for (let type in CAR_CONFIG) {
        for (let key in CAR_CONFIG[type]) {
            let args = CAR_CONFIG[type][key].args.slice();
            args.unshift(CAR_CONFIG[type][key].key);
            this.load[type].apply(this.load, args);
        }
    }
}

create(){

    //this.add.image(400, 300, 'bg'); // background
    console.log("PRELOADED");
    //this.scene.start('TrackTest');
    //this.scene.start('Start');
    this.scene.start('Game');
}

}
