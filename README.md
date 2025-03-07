# Vibe Coding Hackathon

A responsive web application for the Vibe Coding Hackathon event featuring a WebGL-powered header with interactive shaders.

## Features

- Full-bleed Three.js header with custom WebGL shaders
- Interactive animations using GSAP
- Responsive design that works across all devices
- Modern, modular JavaScript architecture

## Technologies Used

- Three.js (v0.159.0) - For 3D rendering and WebGL
- GSAP (v3.12.4) - For smooth animations
- Custom WebGL Shaders - For creating unique visual effects
- Vanilla JavaScript - Modern ES6+ features

## Project Structure

```
├── index.html              # Main HTML file
├── css/
│   └── style.css           # Main stylesheet
├── js/
│   ├── main.js             # Main JavaScript file
│   └── shaders/
│       ├── vertexShader.js # Vertex shader code
│       └── fragmentShader.js # Fragment shader code
└── README.md               # This file
```

## Getting Started

1. Clone this repository
2. Run a local server (e.g., using live-server)
3. Open the site in your browser

```bash
# If you have live-server installed
live-server
```

## Development

The WebGL header is implemented using Three.js with custom shaders. The main components are:

- A full-screen plane geometry
- Custom vertex and fragment shaders
- Interactive effects that respond to mouse movement
- GSAP animations for content elements

## Browser Support

This project uses modern JavaScript features and WebGL, which are supported in all modern browsers. For the best experience, use the latest versions of Chrome, Firefox, Safari, or Edge. 