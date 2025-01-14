# WebTension

An interactive web-based simulation for visualizing and calculating tensions in a two-cable system with an applied force.

## Overview

WebTension is a physics simulation that allows users to explore how forces and tensions interact in a simple mechanical system. The simulation consists of a pivot point (P0) with two arms extending to points P1 and P2, which are connected by tensioned cables to a central point (P3). Users can apply a force to P3 and observe how the tensions in the cables and torques about P0 respond to changes in geometry and applied force.

## Features

- Interactive drag-and-drop interface for positioning all points
- Real-time calculation and display of:
  - Point coordinates (x, y)
  - Cable tensions (T1, T2)
  - Applied force magnitude and direction
  - Force components at P1 and P2
  - Torques about pivot point P0
- Adjustable force parameters:
  - Magnitude (0-100 N)
  - Direction (0-360 degrees)
- Visual representation of:
  - Pivot point and connecting arms (dashed lines)
  - Connection points and cables
  - Force vector with direction arrow
  - Point labels and coordinates

## Usage

1. Open `index.html` in a web browser
2. Interact with the simulation:
   - Click and drag any point (P0, P1, P2, or P3) to reposition it
   - Use the "Force Magnitude" slider to adjust the force strength
   - Use the "Force Direction" slider to change the force angle
3. Observe the real-time updates of:
   - Tensions in the cables
   - Force components at each point
   - Torques about the pivot point P0

## Technical Details

The simulation uses HTML5 Canvas for rendering and JavaScript for calculations. Tension values are computed by solving the force equilibrium equations at P3, taking into account the applied force and the directions of the cables. Torques are calculated using the cross product of the position vectors (relative to P0) and the forces at P1 and P2.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 