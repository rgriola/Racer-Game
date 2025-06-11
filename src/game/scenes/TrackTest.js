import Track from '../gameObjects/Track.js';

export class TrackTest extends Phaser.Scene {
    constructor() {
        super('TrackTest');
    }


    create() {
        this.track = new Track(this);
        this.trackWaypoints = this.track.trackWaypoints;
        this.lapline = this.track.lapline;

        this.racingFont = 'Orbitron, Share Tech Mono, Courier, monospace';
        this.myTextStyle = {
            fontFamily: this.racingFont,
            fontSize: 50,
            color: '#ffe600',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'left',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#222',
                blur: 2,
                fill: true }
        }
        
        // SHOWS POINTER POINT
        this.pointerDebugText = this.add.text(this.scale.width / 2 - 100, 25, 'Pointer: (0, 0)',
            this.myTextStyle )
            .setDepth(100);

    }

    update(){
         // Pointer debug
        const pointer = this.input.activePointer;
        this.pointerDebugText.setText(
            `Pointer: (${pointer.worldX.toFixed(0)}, ${pointer.worldY.toFixed(0)})`);
    }
}
