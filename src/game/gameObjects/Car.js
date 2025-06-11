import CAR_CONFIG from '../carConfig.js';

export default class Car extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, carKey, options = {}) {
        // carKey is like 'car_01', 'car_02', etc.
        super(scene.matter.world, x, y, carKey);

        scene.add.existing(this);

        // Set up physics and car properties
        this.setScale(options.scale || 0.1)
            .setBounce(options.bounce || 1)
            .setFriction(options.friction || 0.1)
            .setFrictionAir(options.frictionAir || 0.05)
            .setMass(options.mass || 1500);

        this.setRotation(options.rotation ?? Math.PI);

        // Game logic properties
        this.lapCount = 0;
        this.hasStarted = false;
        this.currentWaypoint = 0;
        this.prevX = this.x;
        this.key = carKey;
        this.lastLapCrossTime = 0;

        // For AI/Driver
        this.isAI = !!options.isAI;
    }
}