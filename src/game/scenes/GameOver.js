import { Scene } from 'phaser';

export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        this.background1 = this.add.image(0, 0, 'bg').setOrigin(0);

        this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

    }
}
