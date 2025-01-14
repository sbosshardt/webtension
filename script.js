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
        this.forceDirection = 0;
        
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

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connecting arms from P0 to P1 and P2
        this.ctx.strokeStyle = '#666';
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.p0.x, this.p0.y);
        this.ctx.lineTo(this.p1.x, this.p1.y);
        this.ctx.moveTo(this.p0.x, this.p0.y);
        this.ctx.lineTo(this.p2.x, this.p2.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw cables
        this.ctx.strokeStyle = '#000';
        this.ctx.beginPath();
        this.ctx.moveTo(this.p1.x, this.p1.y);
        this.ctx.lineTo(this.p3.x, this.p3.y);
        this.ctx.lineTo(this.p2.x, this.p2.y);
        this.ctx.stroke();

        // Draw force arrow
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

        // Draw points
        const points = [
            { point: this.p0, label: "P0" },
            { point: this.p1, label: "P1" },
            { point: this.p2, label: "P2" },
            { point: this.p3, label: "P3" }
        ];

        points.forEach(({ point, label }) => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, this.pointRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = point === this.selectedPoint ? '#ff4444' : '#4444ff';
            this.ctx.fill();
            
            // Draw label
            this.ctx.fillStyle = '#000';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(label, point.x + 10, point.y - 10);
        });
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