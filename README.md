# WebTension

An interactive web-based simulation for visualizing and calculating tensions in a two-cable system with an applied force.

## Overview

WebTension is a physics simulation that allows users to explore how forces and tensions interact in a simple mechanical system. The simulation consists of three points: two anchor points (P1 and P2) connected to a central point (P3) by tensioned cables. Users can apply a force to P3 and observe how the tensions in the cables respond to changes in geometry and applied force.

## Features

- Interactive drag-and-drop interface for positioning points
- Real-time calculation and display of:
  - Point coordinates (x, y)
  - Cable tensions (T1, T2)
  - Applied force magnitude and direction
- Adjustable force parameters:
  - Magnitude (0-100 N)
  - Direction (0-360 degrees)
- Visual representation of:
  - Connection points and cables
  - Force vector with direction arrow
  - Point labels and coordinates

## Usage

1. Open `index.html` in a web browser
2. Interact with the simulation:
   - Click and drag any point (P1, P2, or P3) to reposition it
   - Use the "Force Magnitude" slider to adjust the force strength
   - Use the "Force Direction" slider to change the force angle
3. Observe the real-time updates of tensions and coordinates

## Technical Details

The simulation uses HTML5 Canvas for rendering and JavaScript for calculations. Tension values are computed by solving the force equilibrium equations at P3, taking into account the applied force and the directions of the cables.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 