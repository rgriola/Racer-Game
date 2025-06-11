export class Driver {
    constructor(car) {
        this.car = car;
        this.scene = car.scene;
        this.rayLength = 120;
        this.avoidDistance = 60;
        this.turnStrength = 2.5; // 2.5 original 
        this.rayAngles = [-90, -60, -30, 0, 30, 60, 90];
        this.debugEnabled = false;
        this.debugGraphics = null;

        // Speed/acceleration logic (match Player)
        this.velocityIncrement = 0.5;
        this.velocityMax = 150; // px/sec, adjust for AI
        this.plusAccel = 5;
        this.minusDecel = 4;
        this.currentSpeed = 0;

    }

update(dt) {
    if (!this.car.body) return;
    // 1. Context-based steering: sample directions
    const { x, y, rotation } = this.car;

    const numSamples = 9;
    const maxSteerAngle = Phaser.Math.DegToRad(60); // +/- 60 degrees
    const steerAngles = [];
    for (let i = 0; i < numSamples; i++) {
        steerAngles.push(-maxSteerAngle + (i * (2 * maxSteerAngle) / (numSamples - 1)));
    }

    // 2. Score each direction
    let bestScore = -Infinity;
    let bestAngle = 0;
    const waypoint = this.scene.trackWaypoints[this.car.currentWaypoint];
    for (const steerAngle of steerAngles) {
        // Project a point ahead in this direction
        const testAngle = rotation + steerAngle;
        const testX = x + Math.cos(testAngle) * 60;
        const testY = y + Math.sin(testAngle) * 60;

        // Score: negative if close to obstacle
        let minObstacleDist = this.rayLength;
        for (const obs of this.detectObstacles()) {
            if (Math.abs(Phaser.Math.Angle.Wrap(Phaser.Math.DegToRad(obs.angle) - steerAngle)) < Phaser.Math.DegToRad(20)) {
                minObstacleDist = Math.min(minObstacleDist, obs.distance);
            }
        }
        // Score: prefer directions toward the waypoint
        const toWaypoint = Phaser.Math.Angle.Wrap(Math.atan2(waypoint.y - y, waypoint.x - x) - testAngle);
        const goalScore = 1 - Math.abs(toWaypoint) / Math.PI; // 1 if aligned, 0 if opposite

        // Combine: avoid obstacles, seek goal
        const score = (minObstacleDist / this.rayLength) * 2 + goalScore * 3;

        if (score > bestScore) {
            bestScore = score;
            bestAngle = steerAngle;
        }
    }

    // 3. Apply chosen steering
    // Speed-based turning (as before)
    const maxTurnAtZero = this.turnStrength;
    const minTurnAtMaxSpeed = 0.3;
    const stepsPerSecond = 60;
    const velocityMaxPerStep = this.velocityMax / stepsPerSecond;
    const speedRatio = Math.min(this.currentSpeed / velocityMaxPerStep, 1);
    const effectiveTurnStrength = Phaser.Math.Linear(maxTurnAtZero, minTurnAtMaxSpeed, speedRatio);

    this.car.setAngularVelocity(bestAngle * effectiveTurnStrength * dt);

    // 4. Thrust logic (as before)
    const acceleration = (this.velocityIncrement * this.plusAccel) / stepsPerSecond;
    const deceleration = (this.velocityIncrement * this.minusDecel) / stepsPerSecond;

    // Slow for sharp turns
    let shouldAccelerate = true;
    if (Math.abs(bestAngle) > Phaser.Math.DegToRad(30) && this.currentSpeed > (velocityMaxPerStep / 2)) {
        shouldAccelerate = false;
        this.currentSpeed = Math.max(this.currentSpeed - deceleration * 2, 0.5);
    }

    if (shouldAccelerate) {
        this.currentSpeed = Math.min(this.currentSpeed + acceleration, velocityMaxPerStep);
    } else {
        this.currentSpeed = Math.max(this.currentSpeed - deceleration, 0.5);
    }

    // Set velocity in the chosen direction
    const moveAngle = rotation + bestAngle;
    this.car.setVelocity(
        Math.cos(moveAngle) * this.currentSpeed,
        Math.sin(moveAngle) * this.currentSpeed
    );

    // Waypoint logic (as before)
    const distToWaypoint = Phaser.Math.Distance.Between(this.car.x, this.car.y, waypoint.x, waypoint.y);
    if (distToWaypoint < 50) {
        this.car.currentWaypoint = (this.car.currentWaypoint + 1) % this.scene.trackWaypoints.length;
    }

    // Debug rays
    if (this.debugEnabled) this.drawDebugRays(this.detectObstacles());
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
        const { x, y, rotation } = this.car;
        for (const angleDeg of this.rayAngles) {
            const angle = rotation + Phaser.Math.DegToRad(angleDeg);
            const dx = Math.cos(angle) * this.rayLength;
            const dy = Math.sin(angle) * this.rayLength;
            this.debugGraphics.lineStyle(1, 0xffff00, 0.5);
            this.debugGraphics.strokeLineShape(new Phaser.Geom.Line(x, y, x + dx, y + dy));
        }
        for (const obs of obstacles) {
            const angle = rotation + Phaser.Math.DegToRad(obs.angle);
            const dx = Math.cos(angle) * obs.distance;
            const dy = Math.sin(angle) * obs.distance;
            this.debugGraphics.fillStyle(0xff0000, 1);
            this.debugGraphics.fillCircle(x + dx, y + dy, 4);
        }
    }
}