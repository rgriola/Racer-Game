export default class Track {
    constructor(scene) {
        this.scene = scene;
        this.walls = [];
        this.bumpers = [];
        this.lapline = null;
        this.trackWaypoints = [];
    }

    create(){

    // line
        this.bumpers = layoutImages(this.scene, {
        cx: 275,
        cy: 325,
        count: 20,
        textures: ['wall_poly_green', 'wall_poly_orange'],
        scale: 1,
        arc: false,
        lineLength: 950,
        overlap: 10
    });

    // arc
    this.bumpers = layoutImages(this.scene, {
        cx: 600,
        cy: 300,
        radius: 200,
        startAngle: 0,
        endAngle: 180,
        count: 20,
        textures: ['wall_poly_green', 'wall_poly_orange'],
        scale: 1,
        arc: true,
        overlap: 10 // positive for less, negative for more overlap
    });
    }

    createTrack() {
        
        // WAYPOINTS
        this.trackWaypoints = [
            { x: 250, y: 250 }, // 1
            { x: 190, y: 322 },  // 2 
            { x: 234, y: 400 },
            { x: 900, y: 450 }, // mid 
            { x: 1280, y: 423 }, 
            { x: 1310, y: 325 },
            { x: 1280, y: 150 }, 
            { x: 600, y: 90 },
        ];

        if(window.DEBUG){
            const wpGraphics = this.scene.add.graphics();
            wpGraphics.fillStyle(0x00ff00, 1);
            this.trackWaypoints.forEach(wp => {
                wpGraphics.fillCircle(wp.x, wp.y, 5);
            });
        }
        
        // Background
        this.scene.add.image(400, 300, 'bg_track')
        .setDepth(-100);

        
        // Lapline
        this.lapline = this.scene.matter.add.image(600, 87, 'finishline', null, {
            isSensor: true,
            isStatic: true,
            label: 'lapLine'
        }).setDepth(-100)
          .setScale(.5);
        
        this.bumpers = this.layoutImages(this.scene, {
                    cx: 600,
                    cy: 145,
                    count: 20,
                    textures: ['wall_poly_green', 'wall_poly_orange'],
                    scale: .5,
                    arc: false,
                    lineLength: 500,
                    overlap: 0. // this will move the row left and right
                });

        // Place 15 images in an arc from (300, 400) to (700, 400), bending 120px "up"
        this.arcBumpers = this.layoutImagesArc(this.scene, {
                x1: 1100,
                y1: 145,
                x2: 1250,
                y2: 320,
                arcHeight: 120, // positive bends left/up, negative bends right/down
                count: 15,
                textures: ['wall_poly_green', 'wall_poly_orange'],
                scale: 0.5,
                overlap: 0
            });

        // Middle divider
        let x = 275, y = 325;
        for (let i = 0; i < 20; i++) {
            const texture = (i % 2 === 0) ? 'wall_poly_green' : 'wall_poly_orange';
            const bumper = this.scene.matter.add.image(x, y, texture, null).setStatic(true)
                    bumper.setBounce(1);         // Walls can have some bounce too
                    bumper.setFriction(1);
             this.bumpers.push(bumper);
            x += 50;
        }

        // Top wall
        let x2 = 0;
        for (let i = 0; i < 15; i++) {
            const texture = (i % 2 === 0) ? 'wall_red_100' : 'wall_white_100';
            const wall = this.scene.matter.add.image(x2 + 50, 25, texture, null).setStatic(true);
            this.walls.push(wall);
            x2 += 100;
        }

        // Bottom wall
        let x1 = 0;
        for (let i = 0; i < 15; i++) {
            const texture = (i % 2 === 0) ? 'wall_red_100' : 'wall_white_100';
            const wall = this.scene.matter.add.image(x1 + 50, 625, texture, null).setStatic(true);
            this.walls.push(wall);
            x1 += 100;
        }

        // Left wall
        let y1 = 0;
        for (let i = 0; i < 15; i++) {
            const texture = (i % 2 === 0) ? 'wall_red_100_vert' : 'wall_white_100_vert';
            const wall = this.scene.matter.add.image(25, y1 + 50, texture, null).setStatic(true);
            this.walls.push(wall);
            y1 += 100;
        }

        // Right wall
        let y2 = 0;
        for (let i = 0; i < 15; i++) {
            const texture = (i % 2 === 0) ? 'wall_red_100_vert' : 'wall_white_100_vert';
            const wall = this.scene.matter.add.image(1475, y2 + 50, texture, null).setStatic(true);
            this.walls.push(wall);
            y2 += 100;
        }
    }

    /**
 * Lay out images in an arc or straight line.
 * @param {Phaser.Scene} scene - The Phaser scene.
 * @param {Object} options - Layout options.
 * @param {number} options.cx - Center X of the arc/line.
 * @param {number} options.cy - Center Y of the arc/line.
 * @param {number} options.radius - Radius for arc (ignored for straight line).
 * @param {number} options.startAngle - Start angle in degrees (for arc).
 * @param {number} options.endAngle - End angle in degrees (for arc).
 * @param {number} options.count - Number of images to place.
 * @param {string[]} options.textures - Array of texture keys (cycled through).
 * @param {number} options.scale - Scale factor for images.
 * @param {boolean} options.arc - If true, lay out in arc; if false, lay out in line.
 * @param {number} options.overlap - Overlap in pixels (negative for more overlap).
 * @param {number} [options.lineLength] - Length of the line (if arc=false).
 * @returns {Phaser.Physics.Matter.Image[]} Array of created images.
 */
    layoutImages(scene, {
        cx, cy,
        radius = 200,
        startAngle = 0,
        endAngle = 180,
        count = 10,
        textures = [],
        scale = 1,
        arc = true,
        overlap = 0,
        lineLength = 400
    }) {
        const images = [];
        if (arc) {
            // Arc layout, cx/cy is now the START point
            const startRad = Phaser.Math.DegToRad(startAngle);
            const endRad = Phaser.Math.DegToRad(endAngle);

            // Calculate arc center so that the first image is at (cx, cy)
            // Center is at (cx - cos(startRad) * radius, cy - sin(startRad) * radius)
            const centerX = cx - Math.cos(startRad) * radius;
            const centerY = cy - Math.sin(startRad) * radius;

            for (let i = 0; i < count; i++) {
                const t = count === 1 ? 0.5 : i / (count - 1);
                const angle = Phaser.Math.Linear(startRad, endRad, t);
                // Calculate position on arc
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                const texture = textures[i % textures.length];
                const img = scene.matter.add.image(x, y, texture, null).setStatic(true);
                img.setScale(scale);
                img.setAngle(Phaser.Math.RadToDeg(angle) + 90); // Rotate to follow arc
                images.push(img);
                // Overlap: move slightly toward previous image
                if (i > 0 && overlap !== 0) {
                    const prev = images[i - 1];
                    const dx = prev.x - img.x;
                    const dy = prev.y - img.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const ox = (dx / dist) * overlap;
                    const oy = (dy / dist) * overlap;
                    img.x += ox;
                    img.y += oy;
                }
            }
        } else {
            // Straight line layout (unchanged)
            const dx = lineLength / (count - 1);
            for (let i = 0; i < count; i++) {
                const x = cx + i * dx;
                const y = cy;
                const texture = textures[i % textures.length];
                const img = scene.matter.add.image(x, y, texture, null).setStatic(true);
                img.setScale(scale);
                images.push(img);
                // Overlap: move slightly toward previous image
                if (i > 0 && overlap !== 0) {
                    img.x -= overlap * i;
                }
            }
        }
        return images;
    }

    layoutImagesArc(scene, {
    x1, y1, x2, y2,
    arcHeight = 100,
    count = 10,
    textures = [],
    scale = 1,
    overlap = 0
}) {
    const images = [];
    // Chord midpoint
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    // Chord vector
    const dx = x2 - x1;
    const dy = y2 - y1;
    const chordLen = Math.sqrt(dx * dx + dy * dy);
    // Perpendicular vector (normalized)
    const perpX = -dy / chordLen;
    const perpY = dx / chordLen;
    // Arc center (offset from midpoint by arcHeight)
    const cx = mx + perpX * arcHeight;
    const cy = my + perpY * arcHeight;

    // Angles from center to start/end
    const angle1 = Math.atan2(y1 - cy, x1 - cx);
    const angle2 = Math.atan2(y2 - cy, x2 - cx);

    // Ensure shortest arc direction
    let delta = angle2 - angle1;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;

    for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const angle = angle1 + delta * t;
        const radius = Math.sqrt((x1 - cx) ** 2 + (y1 - cy) ** 2);
        let x = cx + Math.cos(angle) * radius;
        let y = cy + Math.sin(angle) * radius;
        const texture = textures[i % textures.length];
        const img = scene.matter.add.image(x, y, texture, null).setStatic(true);
        img.setScale(scale);
        img.setAngle(Phaser.Math.RadToDeg(angle) + 90);
        images.push(img);
        // Overlap: move slightly toward previous image
        if (i > 0 && overlap !== 0) {
            const prev = images[i - 1];
            const ddx = prev.x - img.x;
            const ddy = prev.y - img.y;
            const dist = Math.sqrt(ddx * ddx + ddy * ddy);
            const ox = (ddx / dist) * overlap;
            const oy = (ddy / dist) * overlap;
            img.x += ox;
            img.y += oy;
        }
    }
    return images;
}
}