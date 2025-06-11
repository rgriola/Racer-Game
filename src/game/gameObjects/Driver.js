export class Driver {
    constructor(car) {
        this.car = car;
        this.scene = car.scene;
        // Match player per-step max speed
        this.maxSpeed = 450; // ≈ 3.616 px/step
        this.steerForce = 0.08;
        this.lookAhead = 150;
        this.missDistance = 50; 
        this.rayLength = this.lookAhead;
        this.numRays = 16;

        // Context arrays
        this.rayDirections = [];
        this.interest = new Array(this.numRays).fill(0);
        this.danger = new Array(this.numRays).fill(0);

        // Precompute ray directions (unit vectors)
        for (let i = 0; i < this.numRays; i++) {
            const angle = i * 2 * Math.PI / this.numRays;
            this.rayDirections[i] = new Phaser.Math.Vector2(1, 0).rotate(angle);
        }
        this.rayAngles = this.rayDirections;

        //POINTS THE CHOOSEN DIRECTION
        this.chosenDir = new Phaser.Math.Vector2(-1, 0);
        this.velocity = new Phaser.Math.Vector2(-1, 0);

        // Daw initial rays before the race starts
        if(window.DEBUG){
            const obstacles = this.detectObstacles();
            this.drawDebugRays(obstacles);
        }

    }

    update(dt) {
        this.setInterest();
        this.setDanger();
        this.chooseDirection();

        let desiredVelocity = this.chosenDir.clone().scale(this.maxSpeed);
            if (this._shouldSlowDown) {
                desiredVelocity = desiredVelocity.scale(0.2); // Slow to 20% speed if blocked
            }
        this.velocity.lerp(desiredVelocity, this.steerForce);

        // Set car angle to match velocity direction (optional, for triangle drawing)
        if (this.velocity.length() > 1) {
            // Set the Matter body angle directly
            Phaser.Physics.Matter.Matter.Body.setAngle(this.car.body, this.velocity.angle());
        }

        // Set velocity in Matter.js (scaled by dt for smoothness)
        this.car.setVelocity(this.velocity.x * dt, this.velocity.y * dt);

        /// Advance to next waypoint if close
        if (this.scene.trackWaypoints && typeof this.car.currentWaypoint === 'number') {
            const wp = this.scene.trackWaypoints[this.car.currentWaypoint];
            const dist = Phaser.Math.Distance.Between(this.car.x, this.car.y, wp.x, wp.y);
            if (dist < this.missDistance ) { // 40 pixels threshold
                this.car.currentWaypoint = (this.car.currentWaypoint + 1) % this.scene.trackWaypoints.length;
            }
        }

        // DEBUG RAYS
        if (window.DEBUG) {
            this.drawDebugRays(this.detectObstacles());
        } else if (this.debugGraphics) {
            this.debugGraphics.clear();
            this.debugGraphics.destroy();
            this.debugGraphics = null;
            }
    }

    updateMph(){
        const stepsPerSecond = 60;
        const metersPerPixel = 0.206;
        const speedPps = Math.sqrt(car.obj.body.velocity.x ** 2 + car.obj.body.velocity.y ** 2) * stepsPerSecond;
        const speedMps = speedPps * metersPerPixel;
        const speedMph = speedMps * 2.23694;

        
    }

    setInterest() {
        let interestDirection = null;
            if (this.scene.trackWaypoints && typeof this.car.currentWaypoint === 'number') {
                const wp = this.scene.trackWaypoints[this.car.currentWaypoint];
                interestDirection = new Phaser.Math.Vector2(wp.x - this.car.x, wp.y - this.car.y);
            }
            // Fallback if no waypoints
            if (!interestDirection || interestDirection.length() < 0.01) {
                interestDirection = new Phaser.Math.Vector2(-1, 0);
            }
            interestDirection = interestDirection.normalize();
            this._interestDirection = interestDirection;

            for (let i = 0; i < this.numRays; i++) {
                let d = this.rayDirections[i].dot(interestDirection);
                this.interest[i] = Math.max(0, d) ** 2;
            }
       // console.log('In Dir: ', interestDirection);
    }

    setDanger() {
        for (let i = 0; i < this.numRays; i++) {
            const dir = this.rayDirections[i];
            const start = new Phaser.Math.Vector2(this.car.x, this.car.y);
            const end = start.clone().add(dir.clone().scale(this.lookAhead));
            const hits = Phaser.Physics.Matter.Matter.Query.ray(
                this.scene.matter.world.localWorld.bodies,
                start,
                end
            );

            let dangerValue = 0;
            for (const hit of hits) {
                if (hit.body === this.car.body) continue;
                if (hit.body.label === 'lapLine') continue; // Ignore lapline

                // Calculate distance to hit
                const pt = hit.point || end;
                const dist = Phaser.Math.Distance.Between(this.car.x, this.car.y, pt.x, pt.y);

                // Other cars: high danger
                if (hit.body.gameObject && hit.body.gameObject !== this.car) {
                    dangerValue = Math.max(dangerValue, 1.0); // Highest danger
                }
                else if (hit.body.isStatic) {
                    // Danger increases as you get closer to the wall
                    const wallDanger = Math.max(0, 1 - (dist / this.rayLength)); // 1.0 at contact, 0.0 at max range
                    dangerValue = Math.max(dangerValue, 0.1 + 0.4 * wallDanger); // Range: 0.1 to 0.5
                }
            }
            this.danger[i] = dangerValue;
        }
    }

    chooseDirection() {
    // Eliminate interest in slots with danger
    for (let i = 0; i < this.numRays; i++) {
        if (this.danger[i] > 0.0) {
            this.interest[i] = 0.0;
        }
    }
    
    // Choose direction based on remaining interest
    this.chosenDir.set(0, 0);
        for (let i = 0; i < this.numRays; i++) {
            this.chosenDir.add(this.rayDirections[i].clone().scale(this.interest[i]));
        }
        if (this.chosenDir.length() > 0.01) {
            this.chosenDir.normalize();
        }
    }

    detectObstacles() {
        const results = [];
        const { x, y, rotation } = this.car;
        for (const angleDeg of this.rayAngles) {
            const angle = rotation + Phaser.Math.DegToRad(angleDeg);
            const dx = Math.cos(angle) * this.rayLength;
            const dy = Math.sin(angle) * this.rayLength;
            const rayEnd = { x: x + dx, y: y + dy };

            const hits = Phaser.Physics.Matter.Matter.Query.ray(
                this.scene.matter.world.localWorld.bodies,
                { x, y },
                rayEnd
            );
            let minDist = this.rayLength;
            let urgent = false;
            for (const hit of hits) {
                if (hit.body === this.car.body) continue;
                const pt = hit.point || rayEnd;
                const dist = Phaser.Math.Distance.Between(x, y, pt.x, pt.y);

                // Check if the hit is another car and if it's slow or stopped
                if (hit.body.gameObject && hit.body.gameObject !== this.car) {
                    const otherCar = hit.body.gameObject;
                    if (typeof otherCar.lapCount !== "undefined") {
                        const v = otherCar.body.velocity;
                        const speed = Math.sqrt(v.x ** 2 + v.y ** 2);
                        if (speed < 0.5) { // Threshold for "slow/stopped"
                            urgent = true;
                            minDist = Math.min(minDist, dist);
                            }
                        }
                } else if (dist < minDist) {
                    minDist = dist;
                    }
            }
            if (minDist < this.rayLength) {
                results.push({ angle: angleDeg, distance: minDist, urgent });
            }
        }
        return results;
    }

    drawDebugRays(obstacles) {
    if (!this.debugGraphics) {
        this.debugGraphics = this.scene.add.graphics();
    }
    this.debugGraphics.clear();
    const { x, y } = this.car;
    for (let i = 0; i < this.numRays; i++) {
        const dir = this.rayDirections[i];
        const end = new Phaser.Math.Vector2(x, y).add(dir.clone().scale(this.rayLength));
        const color = this.danger[i] > 0 ? 0xff0000 : 0x00ff00;
        this.debugGraphics.lineStyle(2, color, 0.7);
        this.debugGraphics.strokeLineShape(new Phaser.Geom.Line(x, y, end.x, end.y));
    }
    if (obstacles && Array.isArray(obstacles)) {
        for (const obs of obstacles) {
            // If obs.angle is an index, use the direction vector
            let dx = 0, dy = 0;
            if (typeof obs.angle === "number" && this.rayDirections[obs.angle]) {
                dx = this.rayDirections[obs.angle].x * obs.distance;
                dy = this.rayDirections[obs.angle].y * obs.distance;
            }
            this.debugGraphics.fillStyle(0xff0000, 1);
            this.debugGraphics.fillCircle(x + dx, y + dy, 4);
        }
    }
       // Draw chosen direction as a white line
    if (this.chosenDir && this.chosenDir.length() > 0.01) {
        const chosenEnd = new Phaser.Math.Vector2(x, y).add(this.chosenDir.clone().scale(this.rayLength));
        this.debugGraphics.lineStyle(3, 0xffffff, 1);
        this.debugGraphics.strokeLineShape(new Phaser.Geom.Line(x, y, chosenEnd.x, chosenEnd.y));
    }

    if (this._interestDirection && this._interestDirection.length() > 0.01) {
        const interestEnd = new Phaser.Math.Vector2(x, y).add(this._interestDirection.clone().scale(this.rayLength));
        this.debugGraphics.lineStyle(2, 0x0000ff, 1);
        this.debugGraphics.strokeLineShape(new Phaser.Geom.Line(x, y, interestEnd.x, interestEnd.y));
    }
}
}