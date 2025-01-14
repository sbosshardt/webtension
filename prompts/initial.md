# Prompts used to create the project

Using Cursor Composer (Agent mode, claude-3.5-sonnet), I used the following prompts to write code for the project.

## Initial prompt

I'd like your assistance with creating an interactive 2D graphical simulation of tension that runs in the web browser. This project's name is "webtension".

Using a mouse cursor, the user should be able to arrange three points. The first two (P1 and P2) serve as anchors that are used to connect taught cables to P3.

For Point 3, there should also be a way for the user to adjust the magnitude and direction of the force that is being applied to this point.

The intent of the simulation is to be able to calculate the tension in the cables (T1 and T2), as well as the x and y components of the forces felt at P1 and P2.

The UI should indicate the x and y coordinates of each of the points.

## Follow-up prompt

Before we do any adjustments, I'd like to make an initial commit for Github. Can you prepare a README.md? Also, a file for MIT license.