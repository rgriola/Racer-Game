//import Phaser from 'phaser';

import { Scene } from 'phaser';
import { Driver } from '../gameObjects/Driver.js';

export class ContextSteeringDemo extends Phaser.Scene {
    constructor() {
        super({ key: 'ContextSteeringDemo' });
    }

    preload() {}

    create() {
        // --- Racing line as a Path2D ---
        this.racingLine = new Phaser.Curves.Path(100, 300);
        this.racingLine.lineTo(700, 300);
        this.racingLine.ellipseTo(100, 100, 0, 180, false, 0); // simple curve
        this.racingLine.lineTo(100, 300);

        // Draw the racing line for reference
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(2, 0x00ff00, 0.7);
        this.racingLine.draw(this.graphics);

        // --- Car (triangle) ---
        const carShape = [
            { x: 0, y: -20 },
            { x: 15, y: 15 },
            { x: -15, y: 15 }
        ];
        this.car = this.matter.add.fromVertices(120, 300, carShape,  {
                    angle: Math.PI,        // initial rotation in radians
                    friction: 0.1,
                    restitution: 0.2,
                    mass: 30
                });

        // --- Obstacles ---
        this.obstacles = [];
        for (let i = 0; i < 2; i++) {
            const rect = this.add.rectangle(300 + i * 200, 250, 60, 40, 0xff0000, 0.7)
                .setInteractive({ draggable: true });
            this.matter.add.gameObject(rect, { isStatic: true });
            rect.body.label = 'obstacle';
            this.obstacles.push(rect);

            rect.on('pointerdown', pointer => rect.setData('dragging', true));
            rect.on('pointerup', pointer => rect.setData('dragging', false));
            rect.on('pointermove', pointer => {
                if (rect.getData('dragging')) {
                    rect.x = pointer.worldX;
                    rect.y = pointer.worldY;
                    this.matter.body.setPosition(rect.body, { x: rect.x, y: rect.y });
                }
            });
        }

        // --- Driver AI ---
        this.driver = new Driver(this.car);
        this.driver.debugEnabled = true;
        this.driver.debugGraphics = this.add.graphics();

        // Provide a getPathDirection method for Driver
        this.getPathDirection = (x, y) => {
            // Find closest point on the racing line
            const t = this.racingLine.getTFromDistance(this.racingLine.getDistanceFrom(x, y));
            const tangent = this.racingLine.getTangent(t);
            return new Phaser.Math.Vector2(tangent.x, tangent.y).normalize();
        };

        // Attach to scene for Driver
        this.car.scene = this;
        this.driver.scene = this;
    }

    update(time, delta) {
        this.driver.update(delta / 1000);
    }
}