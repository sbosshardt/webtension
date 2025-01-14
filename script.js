class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class TensionSimulation {
    constructor() {
        this.canvas = document.getElementById('tensionCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        // Initialize points
        this.p0 = new Point(250, 50);  // Pivot point
        this.p1 = new Point(100, 100);
        this.p2 = new Point(400, 100);
        this.p3 = new Point(250, 250);
        
        this.selectedPoint = null;
        this.pointRadius = 8;
        
        // Force properties
        this.forceMagnitude = 50;
        this.forceDirection = 90;
        
        this.setupEventListeners();
        this.animate();
    }

    setupCanvas() {
        // Set the canvas resolution to match CSS size
        this.canvas.width = 500;
        this.canvas.height = 400;
        this.ctx.lineWidth = 2;
        
        // Store the canvas scale factors
        this.scaleX = this.canvas.width / this.canvas.offsetWidth;
        this.scaleY = this.canvas.height / this.canvas.offsetHeight;
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * this.scaleX,
            y: (e.clientY - rect.top) * this.scaleY
        };
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', () => this.selectedPoint = null);
        this.canvas.addEventListener('mouseleave', () => this.selectedPoint = null);

        document.getElementById('forceMagnitude').addEventListener('input', (e) => {
            this.forceMagnitude = parseFloat(e.target.value);
        });

        document.getElementById('forceDirection').addEventListener('input', (e) => {
            this.forceDirection = parseFloat(e.target.value);
        });

        // Update scale factors when window is resized
        window.addEventListener('resize', () => {
            this.scaleX = this.canvas.width / this.canvas.offsetWidth;
            this.scaleY = this.canvas.height / this.canvas.offsetHeight;
        });
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);

        // Check if clicked near any point
        const points = [this.p0, this.p1, this.p2, this.p3];
        for (let point of points) {
            if (Math.hypot(pos.x - point.x, pos.y - point.y) < this.pointRadius) {
                this.selectedPoint = point;
                break;
            }
        }
    }

    handleMouseMove(e) {
        if (!this.selectedPoint) return;

        const pos = this.getMousePos(e);
        this.selectedPoint.x = pos.x;
        this.selectedPoint.y = pos.y;
    }

    calculateTensions() {
        // Convert force direction to radians
        const forceAngle = (this.forceDirection * Math.PI) / 180;
        const forceX = this.forceMagnitude * Math.cos(forceAngle);
        const forceY = this.forceMagnitude * Math.sin(forceAngle);

        // Calculate angles and distances
        const dx1 = this.p1.x - this.p3.x;
        const dy1 = this.p1.y - this.p3.y;
        const dx2 = this.p2.x - this.p3.x;
        const dy2 = this.p2.y - this.p3.y;

        const length1 = Math.hypot(dx1, dy1);
        const length2 = Math.hypot(dx2, dy2);

        // Unit vectors for each cable
        const ux1 = dx1 / length1;
        const uy1 = dy1 / length1;
        const ux2 = dx2 / length2;
        const uy2 = dy2 / length2;

        // Solve system of equations for tensions
        const det = ux1 * uy2 - ux2 * uy1;
        if (Math.abs(det) < 1e-6) return { 
            t1: 0, t2: 0,
            f1x: 0, f1y: 0,
            f2x: 0, f2y: 0,
            torque1: 0,
            torque2: 0
        }; // Avoid division by zero

        const t1 = (-forceX * uy2 + forceY * ux2) / det;
        const t2 = (forceX * uy1 - forceY * ux1) / det;

        // Calculate force components at P1 and P2
        // Note: The force on the anchor points is in the opposite direction of the cable
        const f1x = -t1 * ux1;
        const f1y = -t1 * uy1;
        const f2x = -t2 * ux2;
        const f2y = -t2 * uy2;

        // Calculate torques about P0
        // Torque = r × F = rx*Fy - ry*Fx
        const r1x = this.p1.x - this.p0.x;
        const r1y = this.p1.y - this.p0.y;
        const r2x = this.p2.x - this.p0.x;
        const r2y = this.p2.y - this.p0.y;

        const torque1 = r1x * f1y - r1y * f1x;
        const torque2 = r2x * f2y - r2y * f2x;

        return { t1, t2, f1x, f1y, f2x, f2y, torque1, torque2 };
    }

    updateDisplay() {
        // Update coordinates display
        document.getElementById('p0-coords').textContent = `(${this.p0.x.toFixed(0)}, ${this.p0.y.toFixed(0)})`;
        document.getElementById('p1-coords').textContent = `(${this.p1.x.toFixed(0)}, ${this.p1.y.toFixed(0)})`;
        document.getElementById('p2-coords').textContent = `(${this.p2.x.toFixed(0)}, ${this.p2.y.toFixed(0)})`;
        document.getElementById('p3-coords').textContent = `(${this.p3.x.toFixed(0)}, ${this.p3.y.toFixed(0)})`;

        // Calculate and update tensions, forces, and torques
        const { t1, t2, f1x, f1y, f2x, f2y, torque1, torque2 } = this.calculateTensions();
        
        document.getElementById('tension1').textContent = `${Math.abs(t1).toFixed(1)} N`;
        document.getElementById('tension2').textContent = `${Math.abs(t2).toFixed(1)} N`;
        document.getElementById('force3').textContent = 
            `${this.forceMagnitude.toFixed(1)} N at ${this.forceDirection}°`;
        
        // Update force components at points
        document.getElementById('p1-force').textContent = 
            `(${f1x.toFixed(1)}i, ${f1y.toFixed(1)}j) N`;
        document.getElementById('p2-force').textContent = 
            `(${f2x.toFixed(1)}i, ${f2y.toFixed(1)}j) N`;

        // Update torques
        document.getElementById('torque1').textContent = `${torque1.toFixed(1)} N⋅m`;
        document.getElementById('torque2').textContent = `${torque2.toFixed(1)} N⋅m`;
        document.getElementById('net-torque').textContent = `${(torque1 + torque2).toFixed(1)} N⋅m`;
    }

    calculateLabelPosition(point, label) {
        const padding = 2;
        const distance = 25; // Increased distance from point
        
        // Generate 8 possible positions around the point
        const positions = [
            { x: point.x + distance, y: point.y }, // right
            { x: point.x + distance * 0.7, y: point.y - distance * 0.7 }, // top-right
            { x: point.x, y: point.y - distance }, // top
            { x: point.x - distance * 0.7, y: point.y - distance * 0.7 }, // top-left
            { x: point.x - distance, y: point.y }, // left
            { x: point.x - distance * 0.7, y: point.y + distance * 0.7 }, // bottom-left
            { x: point.x, y: point.y + distance }, // bottom
            { x: point.x + distance * 0.7, y: point.y + distance * 0.7 }  // bottom-right
        ];

        // Get angles to other points and force arrow
        const angles = [];
        
        // Add angles to other points and include line segments
        const points = [this.p0, this.p1, this.p2, this.p3];
        points.forEach(p => {
            if (p !== point) {
                const angle = Math.atan2(p.y - point.y, p.x - point.x);
                // Add multiple angles for the line thickness
                angles.push(angle - 0.1, angle, angle + 0.1);
            }
        });

        // Add force arrow angles if this is P3
        if (point === this.p3) {
            const forceAngle = (this.forceDirection * Math.PI) / 180;
            angles.push(forceAngle - 0.1, forceAngle, forceAngle + 0.1);
        }

        // Convert angles to sectors to avoid (each line takes up 60° sector for better avoidance)
        const badSectors = angles.map(angle => {
            const sector = Math.floor((angle + Math.PI) * 8 / (2 * Math.PI));
            return sector % 8;
        });

        // Score each position
        const scores = positions.map((pos, index) => {
            // Start with base score from angle consideration
            let score = badSectors.reduce((min, badSector) => {
                const dist = Math.min(
                    Math.abs(index - badSector),
                    8 - Math.abs(index - badSector)
                );
                return Math.min(min, dist);
            }, 8);

            // Penalize positions that would put the label outside canvas bounds
            const margin = 5;
            const estimatedWidth = 20;  // Approximate width of label
            const estimatedHeight = 14; // Approximate height of label
            
            if (pos.x - estimatedWidth < margin || 
                pos.x + estimatedWidth > this.canvas.width - margin ||
                pos.y - estimatedHeight < margin || 
                pos.y + estimatedHeight > this.canvas.height - margin) {
                score -= 2;
            }

            return score;
        });

        // Choose the position with the highest score
        const bestIndex = scores.indexOf(Math.max(...scores));
        const pos = positions[bestIndex];

        // Adjust text alignment based on position
        let align = 'center';
        let baseline = 'middle';
        
        // Fine-tune alignment based on octant
        switch (bestIndex) {
            case 0: // right
                align = 'left'; break;
            case 1: // top-right
                align = 'left'; baseline = 'bottom'; break;
            case 2: // top
                baseline = 'bottom'; break;
            case 3: // top-left
                align = 'right'; baseline = 'bottom'; break;
            case 4: // left
                align = 'right'; break;
            case 5: // bottom-left
                align = 'right'; baseline = 'top'; break;
            case 6: // bottom
                baseline = 'top'; break;
            case 7: // bottom-right
                align = 'left'; baseline = 'top'; break;
        }

        return { pos, align, baseline };
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connecting arms from P0 to P1 and P2 (thick black lines)
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 4;  // Thicker lines for the arms
        this.ctx.beginPath();
        this.ctx.moveTo(this.p0.x, this.p0.y);
        this.ctx.lineTo(this.p1.x, this.p1.y);
        this.ctx.moveTo(this.p0.x, this.p0.y);
        this.ctx.lineTo(this.p2.x, this.p2.y);
        this.ctx.stroke();

        // Draw cables (reddish brown lines)
        this.ctx.strokeStyle = '#A52A2A';  // Reddish brown color
        this.ctx.lineWidth = 2;  // Reset to original thickness
        this.ctx.beginPath();
        this.ctx.moveTo(this.p1.x, this.p1.y);
        this.ctx.lineTo(this.p3.x, this.p3.y);
        this.ctx.lineTo(this.p2.x, this.p2.y);
        this.ctx.stroke();

        // Draw force arrow
        this.ctx.strokeStyle = '#000';  // Black color for the force arrow
        const forceAngle = (this.forceDirection * Math.PI) / 180;
        const arrowLength = this.forceMagnitude;
        const endX = this.p3.x + Math.cos(forceAngle) * arrowLength;
        const endY = this.p3.y + Math.sin(forceAngle) * arrowLength;

        this.ctx.beginPath();
        this.ctx.moveTo(this.p3.x, this.p3.y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        // Draw arrow head
        const headLength = 10;
        const angle = Math.atan2(endY - this.p3.y, endX - this.p3.x);
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - headLength * Math.cos(angle - Math.PI / 6),
            endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - headLength * Math.cos(angle + Math.PI / 6),
            endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.stroke();

        // Draw points and labels
        const points = [
            { point: this.p0, label: "P0" },
            { point: this.p1, label: "P1" },
            { point: this.p2, label: "P2" },
            { point: this.p3, label: "P3" }
        ];

        points.forEach(({ point, label }) => {
            // Draw point
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, this.pointRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = point === this.selectedPoint ? '#ff4444' : '#4444ff';
            this.ctx.fill();
            
            // Calculate best label position
            const { pos, align, baseline } = this.calculateLabelPosition(point, label);
            
            // Draw label background
            this.ctx.font = '14px Arial';
            const textMetrics = this.ctx.measureText(label);
            const padding = 2;
            const textHeight = 14; // Approximate height of the font
            
            let bgX = pos.x;
            if (align === 'right') bgX -= textMetrics.width;
            
            let bgY = pos.y;
            if (baseline === 'middle') bgY -= textHeight / 2;
            if (baseline === 'bottom') bgY -= textHeight;
            
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(
                bgX - padding,
                bgY - padding,
                textMetrics.width + padding * 2,
                textHeight + padding * 2
            );
            
            // Draw label text
            this.ctx.fillStyle = '#000';
            this.ctx.textAlign = align;
            this.ctx.textBaseline = baseline;
            this.ctx.fillText(label, pos.x, pos.y);
        });
        
        // Reset text alignment for future drawings
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
    }

    animate() {
        this.draw();
        this.updateDisplay();
        requestAnimationFrame(this.animate.bind(this));
    }
}

// Initialize the simulation when the page loads
window.addEventListener('load', () => {
    new TensionSimulation();
}); 