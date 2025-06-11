import { Scene } from 'phaser';

import { Driver } from '../gameObjects/Driver.js';
import Player from '../gameObjects/Player.js';
import Track from '../gameObjects/Track.js';
import Car from '../gameObjects/Car.js'; // <-- New Car class

export class Game extends Scene {
    constructor() {
        super('Game');

        // Game state variables
        this.score = 0;
        this.scoreText = null;
        this.lastLapTime = 0;
        this.lapStartTime = 0;
        this.raceStartTime = 0;

        this.raceStarted = false;
        this.countdown = 5;
        this.countdownActive = false;

        this.globalLap = 1; // Global race lap counter, starts at 1
        this.leaderBoard = []; // Array of car keys in finish order
        this.leaderBoardText = null; // Phaser text object for leaderboard

        this.totalLaps = 3;
        this.finishedCars = 0;
    }

       create() {
        // TRACK SETUP
        this.track = new Track(this);
        this.track.createTrack();
        this.trackWaypoints = this.track.trackWaypoints;
        this.lapline = this.track.lapline;


        // Car configs for AI cars
        const poleX = 630;
        const insideY = 95;
        const outside = 70;

        // Player car (uses your Player class)
        this.player = new Player(this, poleX , insideY, 0);
        this.player.setScale(.1)
            .setBounce(1)
            .setMass(1500);
        this.player.setRotation(Math.PI);
        this.player.lapCount = 0;
        this.player.hasStarted = false;
        this.player.currentWaypoint = 0;

        // AI cars using the new Car class
        this.cars = [this.player]; // Array of all cars (player first)
        this.drivers = [];         // Array of all AI drivers

        this.aiCarConfigs = [
            { x: poleX, y: outside, carKey: 'car_02', isAI: true, label: 'car1' }, // row 1 
            { x: poleX + 40, y: insideY, carKey: 'car_03', isAI: true, label: 'car2' }, // row 2
            { x: poleX + 40, y: outside, carKey: 'car_04', isAI: true, label: 'car3' },
            { x: poleX + (40 * 2), y: insideY, carKey: 'car_05', isAI: true, label: 'car4' }, // row 3
            { x: poleX + (40 * 2), y: outside, carKey: 'car_11', isAI: true, label: 'car5' },
            { x: poleX + (40 * 3), y: insideY, carKey: 'car_07', isAI: true, label: 'car6' }, // row 4
            { x: poleX + (40 * 3), y: outside, carKey: 'car_08', isAI: true, label: 'car7' },
            { x: poleX + (40 * 4), y: insideY, carKey: 'car_09', isAI: true, label: 'car8' }, // row 4
            { x: poleX + (40 * 4), y: outside, carKey: 'car_11', isAI: true, label: 'car9' },
            { x: poleX + (40 * 5), y: insideY, carKey: 'car_12', isAI: true, label: 'car10' }, // row 5
            { x: poleX + (40 * 5), y: outside, carKey: 'car_13', isAI: true, label: 'car11' }
        ];

        // Create AI cars and their drivers
        this.aiCarConfigs.forEach((cfg, idx) => {
            const car = new Car(this, cfg.x, cfg.y, cfg.carKey, cfg);
            car.setRotation(Math.PI);
            car.currentWaypoint = 0;
            car.lapCount = 0;
            car.prevX = car.x;
            car.hasStarted = false;
            this.cars.push(car);

            // Attach driver for AI cars
            const driver = new Driver(car);
            this.drivers.push(driver);

            // For debug text mapping
            if (!this.carDebugTexts) this.carDebugTexts = {};
            this.carDebugTexts[cfg.label] = this.add.text(50, 120 + idx * 24, '', {
                fontFamily: 'Courier', fontSize: 14, color: '#ffcc00', backgroundColor: '#222', padding: 5
            }).setDepth(200).setVisible(false);
        });

        // WORLD BOUNDS
        this.matter.world.setBounds(0, 0, 
                                    this.sys.game.config.width, 
                                    this.sys.game.config.height,
                                    25, true, true, true, true);
        
         // Lapline and collision logic
        this.carFinished = {};
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;
                const getGameObject = (body) => body.gameObject;
                const objA = getGameObject(bodyA);
                const objB = getGameObject(bodyB);

                // Helper functions
                const isCar = obj => this.cars.includes(obj);
                const isWallOrStatic = body => body.isStatic && (!body.gameObject || body.gameObject.label !== 'lapLine');

                // Slowdown logic for collisions
                [objA, objB].forEach((obj, idx) => {
                    const other = idx === 0 ? objB : objA;
                    if (isCar(obj) && (isWallOrStatic(idx === 0 ? bodyB : bodyA) || isCar(other))) {
                        if (typeof obj.currentSpeed === "number") {
                            obj.currentSpeed *= 0.6;
                            const angle = obj.rotation;
                            if (obj.setVelocity) {
                                obj.setVelocity(
                                    Math.cos(angle) * obj.currentSpeed,
                                    Math.sin(angle) * obj.currentSpeed
                                );
                            }
                        }
                    }
                });

                // LAPLINE 
                this.cars.forEach(car => {
                    const key = car === this.player ? 'player' : this.aiCarConfigs[this.cars.indexOf(car) - 1]?.label;
                    
                    
                    if (
                        ((objA === car && objB === this.lapline) ||
                            (objB === car && objA === this.lapline))
                        && !this.carFinished[key]
                        && this.raceStarted
                    ) { // this is for left to right track
                        if (car.prevX > car.x) {
                            if (!car.hasStarted) {
                                car.hasStarted = true;
                                car.lapCount = 0;
                                console.log(`Car ${key}` , car.lapCount);
                                this.updateLeaderBoardHorizontal();
                            } else {
                                car.lapCount++;
                                if (!car.lapCrossTimes) car.lapCrossTimes = [];
                                car.lapCrossTimes[car.lapCount] = this.time.now;
                                //this.updateLeaderBoardText();
                                this.updateLeaderBoardHorizontal();
                                }
                            
                            // need to consoldate player anc AI cars, and insert player 
                            // controls .  
                            // next fold all collisions and data tracking into car class
                            // and checking of data.

                            // Update global lap
                            const maxLap = Math.max(...this.cars.map(c => c.lapCount));
                            this.globalLap = Math.max(1, Math.min(this.totalLaps, maxLap));
                            if (this.globalLapText) this.globalLapText.setText(`Race Lap: ${this.globalLap}`);

                            // Player-specific UI
                            if (key === 'player') {
                                this.lapText.setText(`Lap: ${this.player.lapCount}`);
                                this.lastLapTime = (this.time.now - this.lapStartTime) / 1000;
                                this.lapStartTime = this.time.now;
                                this.lapTimerText.setText(`Lap Time: ${this.lastLapTime.toFixed(2)}`);
                            }

                            if (car.lapCount >= this.totalLaps) {
                                this.carFinished[key] = true;
                                this.finishedCars++;
                                this.leaderBoard = this.leaderBoard.filter(k => k !== key);
                                this.leaderBoard.push(key);

                                // Stop race timer at leader finish
                                if (this.finishedCars === 1) {
                                    this.raceEndTime = this.time.now;

                                }

                                if (this.finishedCars >= this.cars.length) {
                                    
                                    this.raceStarted = false;
                                    this.gameOverText.setVisible(true);
                                    this.gameOverText.setText('Race Over!');
                                    this.raceAgainButton.setVisible(true);
                                }
                            }
                            //this.updateLeaderBoardText();
                            //this.updateLeaderBoardHorizontal();
                        }
                    }
                });
            });
        });

        // SPECIAL EFFECTS
        /*
        this.particles = this.add.particles(0, 0, 'red', {
            speed: 50,
            scale: { start: .25, end: 0 },
            blendMode: 'ADD',
            setDepth: 20
        });

        // After creating logo and particles
        const logoDepth = this.car2.depth; // Get logo's current depth
        this.particles.setDepth(logoDepth - 1); // Set particles behind logo
        this.particles.startFollow(this.car2);
        */

        // Input and UI
        this.cursors = this.input.keyboard.createCursorKeys();
        
        //INITIALIZE LEADERBOARD + POPULATE
        this.initLeaderBoard();
        //this.updateLeaderBoardText();
        this.updateLeaderBoardHorizontal();

        // UI TEXT
        this.initGameUi();
       

        // PLAYER MOBILE CONTROLS
        const accelRadius = 60;
        const accelX = 70 + accelRadius;
        const accelY = this.scale.height - 80 - accelRadius;

        // Draw translucent circle for accelerator
        this.accelButtonBg = this.add.circle(accelX, accelY, accelRadius, 0xffffff, 0.25)
            .setScrollFactor(0)
            .setDepth(200);

        // Add invisible interactive area for touch
        this.accelButton = this.add.circle(accelX, accelY, accelRadius, 0xffffff, 0.01)
            .setInteractive({ useHandCursor: false })
            .setScrollFactor(0)
            .setDepth(201);

        // Track state
        this.isAccelerating = false;

        // Touch events
        this.accelButton.on('pointerdown', () => { this.isAccelerating = true; });
        this.accelButton.on('pointerup', () => { this.isAccelerating = false; });
        this.accelButton.on('pointerout', () => { this.isAccelerating = false; });

        // Steering joystick setup
const steerRadius = 60;
const steerX = 1300 + steerRadius;
const steerY = this.scale.height - 150; // Place above accelerator

// Draw translucent circle for steering
this.steerJoyBg = this.add.circle(steerX, steerY, steerRadius, 0xffffff, 0.18)
    .setScrollFactor(0)
    .setDepth(200);

// Add invisible interactive area for touch
this.steerJoyArea = this.add.circle(steerX, steerY, steerRadius, 0xffffff, 0.01)
    .setInteractive({ useHandCursor: false })
    .setScrollFactor(0)
    .setDepth(201);

// State for joystick
this.steerInput = { active: false, angle: 0, force: 0 };

// Touch events for steering
this.steerJoyArea.on('pointerdown', pointer => {
    this.steerInput.active = true;
    this.steerInput.startX = pointer.x;
    this.steerInput.startY = pointer.y;
});
this.steerJoyArea.on('pointerup', () => {
    this.steerInput.active = false;
    this.steerInput.force = 0;
});
this.steerJoyArea.on('pointerout', () => {
    this.steerInput.active = false;
    this.steerInput.force = 0;
});
this.steerJoyArea.on('pointermove', pointer => {
    if (this.steerInput.active) {
        const dx = pointer.x - steerX;
        const dy = pointer.y - steerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.steerInput.angle = Math.atan2(dy, dx); // Radians
        this.steerInput.force = Math.min(dist / steerRadius, 1); // 0..1
    }
});

        // START BUTTON (centered, visible only before race starts)
    this.startButton = this.add.text(
        this.scale.width / 2, this.scale.height - 120,
        'START RACE',
        {
            fontFamily: 'Orbitron, Share Tech Mono, Courier, monospace',
            fontSize: 48,
            color: '#ffe600',
            backgroundColor: '#222a',
            padding: { left: 32, right: 32, top: 16, bottom: 16 },
            align: 'center',
            stroke: '#000', strokeThickness: 4
        }
    ).setOrigin(0.5)
     .setInteractive({ useHandCursor: true })
     .setDepth(300)
     .setVisible(true);

    // Touch/click event
    this.startButton.on('pointerdown', () => {
        if (!this.countdownActive && !this.raceStarted) {
            this.startButton.setVisible(false);
            this.startCountdown();
        }
    });

        // Start game timer activates key function
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.countdownActive && !this.raceStarted) {
                this.startCountdown();
            }
        });

        // Toggle debug mode with 'D' key
        this.input.keyboard.on('keydown-D', () => {
            window.DEBUG = !window.DEBUG;
            // Show/hide debug UI elements
            if (this.carDebugText) this.carDebugText.setVisible(window.DEBUG);
            if (this.pointerDebugText) this.pointerDebugText.setVisible(window.DEBUG);
            // Add any other debug UI elements here
        });

        console.log('Game Loaded');
    }

    update(time, delta) {
        if (this.raceStarted) {
            this.player.update(time, delta, { accelerate: this.isAccelerating });
            this.drivers.forEach(driver => driver.update(delta / 1000));
            
            // Update prevX for lap direction check
            this.cars.forEach(car => {
                car.prevX = car.x
                car.prevY = car.y
            });

            // RACE TIMER
            let raceElapsed;
            if (this.raceEndTime) {
                raceElapsed = (this.raceEndTime - this.raceStartTime) / 1000;
            } else {
                raceElapsed = (this.time.now - this.raceStartTime) / 1000;
                }
            this.raceTimerText.setText(`Race Time: ${raceElapsed.toFixed(2)}`);

            // PLAYER LAP TIMER
            const currentLapTime = (this.time.now - this.lapStartTime) / 1000;
            this.lapTimerText.setText(`Lap Time: ${currentLapTime.toFixed(2)}`);

            this.steering_Logic();

        }
        
    
            // DEBUG ITEMS
            this.carDebugText.setText(this.getCarDebugText(this.cars[1], 'CAR 1'));
            this.carDebugText.setVisible(window.DEBUG);
            this.pointerDebugText.setVisible(window.DEBUG);
            // Pointer debug
            const pointer = this.input.activePointer;
            this.pointerDebugText.setText(
                `Pointer: (${pointer.worldX.toFixed(0)}, ${pointer.worldY.toFixed(0)})`);
    }

    steering_Logic() {
        // Steering logic
if (this.steerInput && this.steerInput.active && this.steerInput.force > 0.2) {
    // Calculate desired angle relative to world
    const desiredAngle = this.steerInput.angle;
    // Calculate angle difference between car's nose and joystick direction
    const carAngle = this.player.rotation;
    let angleDiff = Phaser.Math.Angle.Wrap(desiredAngle - carAngle);

    // Apply steering: setAngularVelocity or setWheelAngle, depending on your car code
    // Here, we simply steer left/right based on angleDiff
    const steerStrength = 0.07 * this.steerInput.force; // Adjust as needed
    if (angleDiff > 0.1) {
        this.player.setAngularVelocity(steerStrength);
    } else if (angleDiff < -0.1) {
        this.player.setAngularVelocity(-steerStrength);
    } else {
        this.player.setAngularVelocity(0);
    }
} else {
    this.player.setAngularVelocity(0);
}
    }

    initLeaderBoard(){
        // Initial Leader Board order
        this.leaderBoard = ['player', ...this.aiCarConfigs.map(cfg => cfg.label)];

        // Calculate leaderboard height dynamically
      //  const numCars = 1 + this.aiCarConfigs.length; // 1 for player + AI cars
      //  const rowHeight = 30; // Adjust if your font size changes
      //  const titleHeight = 32; // Height for the "RACE ORDER" title
      //  const padding = 20; // Top and bottom padding

      //  const leaderboardHeight = titleHeight + (numCars * rowHeight) + padding;

        this.leaderBoardBg = this.add.graphics();
        this.leaderBoardBg.fillStyle(0x111111, 0.5); // dark, semi-transparent
        this.leaderBoardBg.fillRoundedRect(
            50, 500, 600, 100, 16
        );

        // Racing-style font (Orbitron). Make sure to load it in your HTML or as a bitmap font!
        this.racingFont = 'Orbitron, Share Tech Mono, Courier, monospace';
        this.myTextStyle = {
            fontFamily: this.racingFont,
            fontSize: 14,
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
        }
    }

    updateLeaderBoardText() {
        // Sort by lapCount DESC, then by finish order if tied
        const cars = [
            { obj: this.player, key: 'player', name: 'PLAYER' },
            ...this.cars.slice(1).map((car, idx) => ({
                obj: car,
                key: this.aiCarConfigs[idx]?.label,
                name: `CAR ${idx + 1}`
            }))
        ];
    
    cars.sort((a, b) => {
            if (b.obj.lapCount !== a.obj.lapCount) {
                return b.obj.lapCount - a.obj.lapCount;
            }
            return this.leaderBoard.indexOf(a.key) - this.leaderBoard.indexOf(b.key);
        });

        this.leaderBoard = cars.map(car => car.key);

        // Find the leader's lap and crossing time for that lap
        const leader = cars[0].obj;
        const leaderLap = leader.lapCount;
        // Use per-lap crossing times array
        const leaderLapTime = leader.lapCrossTimes?.[leaderLap] || this.time.now;

        let text = 'STACK      L    MPH   GAP\n';
        cars.forEach((car, idx) => {
            const name = car.name.padEnd(8, ' ');
            const lap = String(car.obj.lapCount).padStart(2, ' ');

            // --- Calculate speed in MPH ---
            let speedMph = 0;
            if (car.obj.body && car.obj.body.velocity) {
                const stepsPerSecond = 60;
                const metersPerPixel = 0.206;
                const v = car.obj.body.velocity;
                const speedPps = Math.sqrt(v.x ** 2 + v.y ** 2) * stepsPerSecond;
                const speedMps = speedPps * metersPerPixel;
                speedMph = speedMps * 2.23694;
            }
            const mph = speedMph.toFixed(1).padStart(5, ' ');

            // --- Calculate time gap to leader using per-lap crossing times ---
            let gap = '';
            if (idx === 0) {
                // Show leader's lap time in mm:ss.xx format
                const lapSec = (leaderLapTime - this.raceStartTime) / 1000;
                const min = Math.floor(lapSec / 60);
                const sec = (lapSec % 60).toFixed(2).padStart(5, '0');
                gap = `${min}:${sec}`;
            } else {
                // Only show gap if on same lap as leader and has crossed lapline for that lap
                const carLapTime = car.obj.lapCrossTimes?.[leaderLap];
                if (
                    car.obj.lapCount === leaderLap &&
                    typeof carLapTime === 'number'
                ) {
                    let diffMs = carLapTime - leaderLapTime;
                    if (diffMs < 0) diffMs = 0;
                    const diffSec = diffMs / 1000;
                    const min = Math.floor(diffSec / 60);
                    const sec = (diffSec % 60).toFixed(2).padStart(5, '0');
                    gap = `-${min}:${sec}`;
                } else {
                    gap = '   ---';
                }
            }

            text += `${(idx + 1)}. ${name} ${lap} ${mph} ${gap}\n`;
        });
        this.leaderBoardText.setText(text);
    }

    updateLeaderBoardHorizontal() {
    // Sort cars as in updateLeaderBoardText
    const cars = [
        { obj: this.player, key: 'player', name: 'PLAYER' },
        ...this.cars.slice(1).map((car, idx) => ({
            obj: car,
            key: this.aiCarConfigs[idx]?.label,
            name: `CAR ${idx + 1}`
        }))
    ];

    cars.sort((a, b) => {
        if (b.obj.lapCount !== a.obj.lapCount) {
            return b.obj.lapCount - a.obj.lapCount;
        }
        return this.leaderBoard.indexOf(a.key) - this.leaderBoard.indexOf(b.key);
    });

    // Only show top 5
    const top5 = cars.slice(0, 5);

    // Create text objects if not already
    if (!this.leaderBoardSlots) {
        this.leaderBoardSlots = [];
        for (let i = 0; i < 5; i++) {
            const x = 75 + i * 100; // Adjust spacing as needed
            const y = 510; // Adjust vertical position as needed
            const text = this.add.text(x, y, '', this.myTextStyle).setDepth(102);
            this.leaderBoardSlots.push(text);
        }
    }

    // Get leader's info for gap/time calculations
    const leader = top5[0].obj;
    const leaderLap = leader.lapCount;
    const leaderLapTime = leader.lapCrossTimes?.[leaderLap] || this.time.now;

    // Update each slot
    top5.forEach((car, idx) => {
        const lap = String(car.obj.lapCount).padStart(2, ' ');
        let speedMph = 0;
        if (car.obj.body && car.obj.body.velocity) {
            const stepsPerSecond = 60;
            const metersPerPixel = 0.206;
            const v = car.obj.body.velocity;
            const speedPps = Math.sqrt(v.x ** 2 + v.y ** 2) * stepsPerSecond;
            const speedMps = speedPps * metersPerPixel;
            speedMph = speedMps * 2.23694;
        }
        const mph = speedMph.toFixed(1);

        // Calculate gap or time
        let gap = '';
        if (idx === 0) {
            // Show leader's overall race time in mm:ss.xx format
            const overallMs = this.raceEndTime && this.carFinished[car.key]
                ? this.raceEndTime - this.raceStartTime
                : this.time.now - this.raceStartTime;
            const overallSec = overallMs / 1000;
            const min = Math.floor(overallSec / 60);
            const sec = (overallSec % 60).toFixed(2).padStart(5, '0');
            gap = `${min}:${sec}`;
        } else {
            const carLapTime = car.obj.lapCrossTimes?.[leaderLap];
            if (
                car.obj.lapCount === leaderLap &&
                typeof carLapTime === 'number'
            ) {
                let diffMs = carLapTime - leaderLapTime;
                if (diffMs < 0) diffMs = 0;
                const diffSec = diffMs / 1000;
                gap = `-${diffSec.toFixed(2)}s`;
            } else {
                gap = '---';
            }
        }

        this.leaderBoardSlots[idx].setText(
            `${idx + 1}. ${car.name}\nLap: ${lap}\nMPH: ${mph}\n${gap}`
        );
        this.leaderBoardSlots[idx].setVisible(true);
    });

    // Hide unused slots if fewer than 5 cars
    for (let i = top5.length; i < 5; i++) {
        this.leaderBoardSlots[i].setVisible(false);
    }
}

    startCountdown() {
        this.countdown = 5;
        this.countdownActive = true;
        this.countdownText.setVisible(true);
        this.countdownText.setText(this.countdown);

        this.countdownEvent = this.time.addEvent({
            delay: 1000,
            repeat: 4,
            callback: () => {
                this.countdown--;
                if (this.countdown > 0) {
                    this.countdownText.setText(this.countdown);
                } else {
                    this.countdownText.setText('GO!');
                    this.countdownActive = false;
                    this.raceStarted = true;
                    this.raceStartTime = this.time.now;
                    this.lapStartTime = this.time.now;
                    this.time.delayedCall(500, () => {
                        this.countdownText.setVisible(false);
                    });
                }
            },
            callbackScope: this
        });
    }

    initGameUi() {

        this.raceStatusBG = this.add.graphics();
        this.raceStatusBG.fillStyle(0x111111, 0.5); // dark, semi-transparent
        this.raceStatusBG.fillRoundedRect(
            40, 15, 430, 125, 16
        );

        this.globalLapText = this.add.text(55, 25, 'Race Lap: 1', 
            this.myTextStyle)
            .setDepth(100);

        this.lapTimerText = this.add.text(55, 50, 'Lap Time: 0.00', 
            this.myTextStyle)
            .setDepth(100);

        // SHOWS POINTER POINT
        this.pointerDebugText = this.add.text(this.scale.width / 2 - 100, 25, 'Pointer: (0, 0)',
            this.myTextStyle)
            .setDepth(100);

        // DEBUFGGER TEXT
        this.carDebugText = this.add.text(this.scale.width - 600, 50, ' Debug Car1', this.myTextStyle)
            .setDepth(100);
    
        this.lapText = this.add.text(55, 75, 'Lap: 0', this.myTextStyle)
            .setDepth(100);

        this.countdownText = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
            fontFamily: this.racingFont,
            fontSize: 80,
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center',
            backgroundColor: '#222'
        }).setOrigin(0.5).setDepth(200).setVisible(false);

        this.raceTimerText = this.add.text(250, 50, 'Race Time: 0.00', this.myTextStyle)
            .setDepth(100);

        // USED IN GAME OVER 
        this.raceAgainButton = this.add.text(this.scale.width * 0.5, this.scale.height * 0.5 + 100, 'Race Again', {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center',
            backgroundColor: '#222'
        })
            .setOrigin(0.5)
            .setDepth(101)
            .setPadding(20)
            .setInteractive({ useHandCursor: true })
            .setVisible(false);

        this.raceAgainButton.on('pointerdown', () => {
            this.scene.restart();
        });

        // NOT USED I THINK
        this.gameOverText = this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, 'Game Over', {
            fontFamily: 'Arial Black',
            fontSize: 64, color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(100)
            .setVisible(false);
    }

    

    getCarDebugText(car, label) {
        // Find the driver for this car
        let driver = null;
        // Player is not AI, so only for AI cars
        if (car !== this.player) {
            const idx = this.cars.indexOf(car) - 1;
            driver = this.drivers[idx];
        }

        let chosenDir = driver ? driver.chosenDir : { x: 0, y: 0 };
        let interest = driver ? driver.interest : [];
        let danger = driver ? driver.danger : [];

        // Format arrays for display (show first 8 values for brevity)
        const fmtArr = arr => arr.slice(0, 8).map(v => v.toFixed(2)).join(', ');

        return `${label}
            Ch Dir: (${chosenDir.x.toFixed(2)}, ${chosenDir.y.toFixed(2)})
            Interest: [${fmtArr(interest)}]
            Danger:   [${fmtArr(danger)}]
            x: ${car.x.toFixed(1)}
            y: ${car.y.toFixed(1)}
            rot: ${(car.rotation * 180 / Math.PI).toFixed(1)}
            vel: (${car.body.velocity.x.toFixed(2)}, ${car.body.velocity.y.toFixed(2)})
            speed: ${Math.sqrt(car.body.velocity.x ** 2 + car.body.velocity.y ** 2).toFixed(2)}
            lap: ${car.lapCount}
            waypoint: ${car.currentWaypoint ?? '-'}
            `;
    }

    /// OLD FUNCTIONS FOR DEBUGGING DO NOT REMOVE
    GameOver() {
        this.gameStarted = false;
        this.gameOverText.setVisible(true);
    }

    collectStar (car1, logo) {
        this.score += 10;
       // this.scoreText.setText('Score: ' + this.score);
    }

    // CHECKS PROPERTIES OF THE OBJECTS  DEBUGGING
    logSpriteProperties(spriteName, sprite) {
    // MATTER BODY PROPERIES
    const body = sprite.body;
    let matterProps = {};
    if (body) {
        matterProps = {
            position: { x: body.position.x, y: body.position.y },
            angle: body.angle,
            speed: body.speed,
            angularSpeed: body.angularSpeed,
            isStatic: body.isStatic,
            isSensor: body.isSensor,
            bounds: body.bounds,
            vertices: body.vertices,
            parts: body.parts ? body.parts.length : 1,
            label: body.label,
            mass: body.mass,
            area: body.area,
            friction: body.friction,
            frictionAir: body.frictionAir,
            restitution: body.restitution,
            density: body.density
        };
    }
    console.log(`Matter Properties for ${spriteName}:`, {
        x: sprite.x,
        y: sprite.y,
        displayWidth: sprite.displayWidth,
        displayHeight: sprite.displayHeight,
        scaleX: sprite.scaleX,
        scaleY: sprite.scaleY,
        origin: { x: sprite.originX, y: sprite.originY },
        body: matterProps
    });
    }

    showObjParams(objecYouWantToLookAt){
        //thislets me see the parameters of an object
        console.log(Object.keys(objecYouWantToLookAt));
        console.log(Object.getOwnPropertyNames(objecYouWantToLookAt));
        console.log(Object.keys(objecYouWantToLookAt));
        
        let obj = objecYouWantToLookAt;
        while (obj) {
            console.log(Object.getOwnPropertyNames(obj));
            obj = Object.getPrototypeOf(obj);
        }
    }
    
    initVariables() {
        //this.score = 0;
        this.centreX = this.scale.width * 0.5;
        this.centreY = this.scale.height * 0.5;
    }

}
