import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js';
import { vertexShader } from './shaders/vertexShader.js';
import { fragmentShader } from './shaders/fragmentShader.js';

class ThreeJSHeader {
    constructor() {
        this.container = document.getElementById('header-canvas-container');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();

        // Create camera - use orthographic camera for full viewport coverage
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.camera.position.z = 1;

        // Create renderer with proper sizing
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: false // No transparency
        });
        
        // Set renderer size to match container
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Create shader material
        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(this.width, this.height) },
                uMouse: { value: new THREE.Vector2(0, 0) }
            }
        });

        // Create plane geometry that covers the entire screen
        this.geometry = new THREE.PlaneGeometry(2, 2);
        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.plane);

        // GSAP animation for intro
        this.setupIntroAnimation();
    }

    setupIntroAnimation() {
        // Create a timeline for intro animation
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        
        // Animate the header elements
        tl.fromTo('.hero h1', 
            { opacity: 0, y: 50 }, 
            { opacity: 1, y: 0, duration: 1.5 }
        )
        .fromTo('.hero p', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 1.2 }, 
            "-=1"
        );
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', this.onResize.bind(this));
        
        // Track mouse movement for shader effects
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    onResize() {
        // Update dimensions
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Update renderer size to match window exactly
        this.renderer.setSize(this.width, this.height);
        
        // Update resolution uniform
        this.material.uniforms.uResolution.value.set(this.width, this.height);
    }

    onMouseMove(event) {
        // Normalize mouse coordinates
        this.mouseX = (event.clientX / this.width) * 2 - 1;
        this.mouseY = -(event.clientY / this.height) * 2 + 1;
        
        // Update shader uniform
        this.material.uniforms.uMouse.value.set(this.mouseX, this.mouseY);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Update time uniform for shader animation
        this.time += 0.01;
        this.material.uniforms.uTime.value = this.time;
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new ThreeJSHeader();
}); 