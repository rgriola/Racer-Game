import CAR_CONFIG from '../carConfig.js';

export default class Player extends Phaser.Physics.Matter.Image {
    // THE PLAYER SPEED IS DISPLAYED TO THE SCENE 
    // FROM THIS CLASS

    velocityIncrement = .5;
    velocityMax = 3.5; // 69.1 mph
    drag = 10;
    health = 1;
    bodyVelocityText = null;
    currentSpeed = 0;
    plusAccel = 5 ///0.7;
    minusDecel = 4;
    
    constructor(scene, x, y, shipId) {
    // Get car image info
    
    const carNumber = '18';
    const carKey = CAR_CONFIG.image.car_07.key;
    const frame = scene.textures.get(carKey).getSourceImage();
    const width = frame.width;
    const height = frame.height;

    // Create a RenderTexture
    const rtKey = `car_with_number_${carNumber}_${Phaser.Math.RND.uuid()}`;
    const rt = scene.add.renderTexture(0, 0, width, height);

    // Draw the car image
    rt.draw(carKey, 0, 0);

    // Create the number text (centered)
    const numberText = scene.add.text(width / 2 - 10, height / 2, carNumber, {
        fontFamily: 'Arial Black',
        fontSize: 65,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
    }).setOrigin(0.5);

    // Draw the number text onto the RenderTexture
    rt.draw(numberText, numberText.x, numberText.y);

    // Remove the temporary text object
    numberText.destroy();

    // Save the RenderTexture as a texture in the Texture Manager
    rt.saveTexture(rtKey);

    // Now you can destroy the RenderTexture object (the texture is saved)
    rt.destroy();
    
        super(scene.matter.world, x, y, rt.texture.key);
            // Remove the RenderTexture from the display list (optional, keeps scene clean)

            scene.add.existing(this);
            //scene.physics.add.existing(this);
            this.setOrigin(.5);
            this.setFrictionAir(0.05);
            this.setFixedRotation(false);

            this.prevX = this.x;
            this.scene = scene;

            // this controls the dot in front of the car. 
            this.directionDot = scene.add.graphics();
            this.directionDot.fillStyle(0xffffff, 1);
            this.directionDot.fillCircle(0, 0, 2); // 2px radius, adjust as needed
            this.directionDot.setDepth(101);

        // Define max turn angle for joystick steering
        this.maxTurnAngle = Phaser.Math.DegToRad(2.5);

        //SPACE BAR IS ACCELERATOR
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //OUT PUT FOR SPEED
        this.bodyVelocityText = scene.add.text(55, 100, 'MPH: 0', {
            fontFamily: 'Orbitron, Share Tech Mono, Courier, monospace',
            fontSize: 22,
            color: '#ffe600',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'left',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#222',
                blur: 2,
                fill: true
            }
        }).setDepth(101);

        console.log('Player Constructor');
    }

    update(dt, input = {}) {
        // Pass dt in seconds to checkInput
        this.checkInput(dt, input);
        //this.updatePixelsPerSecond();
        this.updateMph();
        this.prevX = this.x; // checks movement

        // Place dot 25px in front of the car
        const offset = 25; // distance in front of car
        const angle = this.rotation;
        const dotX = this.x + Math.cos(angle) * offset;
        const dotY = this.y + Math.sin(angle) * offset;
        this.directionDot.setPosition(dotX, dotY);
    }
        checkInput(dt, input = {} ) {
        // Acceleration logic
        const acceleration = this.velocityIncrement * this.plusAccel;
        const deceleration = this.velocityIncrement * this.minusDecel;

        const accelerating = (this.spaceKey && this.spaceKey.isDown) || input.accelerate;
            
        if (accelerating) {
            this.currentSpeed = Math.min(this.currentSpeed + acceleration * dt, this.velocityMax);
        } else {
            this.currentSpeed = Math.max(this.currentSpeed - deceleration * dt, 0);
        }
        console.log(`Current Speed: ${this.currentSpeed}`, this.body.velocity.x,`,`, this.body.velocity.y);

        // Steering logic (use input.steer if present)
        let steerAngular = 0;
        if (input.steer && input.steer.active && input.steer.force > 0.2) {
            const desiredAngle = input.steer.angle;
            const carAngle = this.rotation;
            let angleDiff = Phaser.Math.Angle.Wrap(desiredAngle - carAngle);
            const steerStrength = 0.12 * input.steer.force;
            if (angleDiff > 0.1) {
                steerAngular = steerStrength;
            } else if (angleDiff < -0.1) {
                steerAngular = -steerStrength;
            }
        }
        this.setAngularVelocity(steerAngular);

        // Apply velocity in the direction of the car's nose (pixels per second)
        const angle = this.rotation;
        this.setVelocity(
            Math.cos(angle) * this.currentSpeed,
            Math.sin(angle) * this.currentSpeed
        );
}

    updateMph() {
        const velocity = this.body.velocity;
        const stepsPerSecond = 60; // Phaser Matter default

        // Your scale: 1 pixel = 0.206 meters
        const metersPerPixel = 0.206;

        // 1. Get speed in pixels per second
        const speedPps = Math.sqrt(velocity.x ** 2 + velocity.y ** 2) * stepsPerSecond;

        // 2. Convert to meters per second
        const speedMps = speedPps * metersPerPixel;

        // 3. Convert to MPH
        const speedMph = speedMps * 2.23694;

        this.bodyVelocityText.setText(`MPH: ${speedMph.toFixed(1)}`);
        }

    updatePixelsPerSecond() {
        const velocity = this.body.velocity;
        const stepsPerSecond = 60; // Default for Phaser Matter
        const speedPps = Math.sqrt(velocity.x ** 2 + velocity.y ** 2) * stepsPerSecond;
        this.bodyVelocityText.setText(`Speed: ${speedPps.toFixed(1)} px/s`);
    }

    die() {
        this.scene.addExplosion(this.x, this.y);
        this.destroy(); // destroy sprite so it is no longer updated
    }
}