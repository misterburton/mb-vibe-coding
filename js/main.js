import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js';
import { vertexShader } from './shaders/vertexShader.js';
import { fragmentShader } from './shaders/fragmentShader.js';

class ThreeJSHeader {
    constructor() {
        this.container = document.getElementById('header-canvas-container');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.time = 0;
        
        // FPS monitoring
        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fpsUpdateInterval = 1000; // Update FPS every second

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
                uPerformance: { value: 1.0 } // 1.0 = high quality, 0.0 = low quality
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
        
        // Animate the header elements with staggered entrance
        tl.fromTo('.vibe-coding', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 1.2 }
        )
        .fromTo('.hackathon', 
            { opacity: 0, scale: 0.95, rotation: -6 }, 
            { opacity: 1, scale: 1, rotation: -5, duration: 0.75, ease: "Expo.out(1, 0.3)" }, 
            "-=0.7"
        )
        .fromTo('p', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 1, delay: 0.5 }, 
            "-=1"
        );
    }

    setupEventListeners() {
        // Use ResizeObserver for more efficient resize handling
        this.resizeObserver = new ResizeObserver(entries => {
            // Only proceed if we have entries and our container is being observed
            if (entries && entries[0] && entries[0].target === this.container) {
                this.onResize();
            }
        });
        
        // Start observing the container
        this.resizeObserver.observe(this.container);
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

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Calculate FPS
        this.frameCount++;
        const now = performance.now();
        const elapsed = now - this.lastTime;
        
        // Update FPS every second
        if (elapsed >= this.fpsUpdateInterval) {
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.frameCount = 0;
            this.lastTime = now;
            
            // Adjust quality based on FPS
            let performanceValue = 1.0; // Default high quality
            
            if (this.fps < 30) {
                performanceValue = 0.3; // Low performance
            } else if (this.fps < 45) {
                performanceValue = 0.6; // Medium performance
            }
            
            // Update performance uniform
            this.material.uniforms.uPerformance.value = performanceValue;
        }
        
        // Update time uniform for shader animation
        this.time += 0.01;
        this.material.uniforms.uTime.value = this.time;
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    // Clean up resources when instance is destroyed
    destroy() {
        // Disconnect the ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        // Dispose of Three.js resources
        this.geometry.dispose();
        this.material.dispose();
        this.renderer.dispose();
    }
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new ThreeJSHeader();
}); 

// Clean up resources before page unload
window.addEventListener('beforeunload', () => {
    if (headerInstance) {
        headerInstance.destroy();
        headerInstance = null;
    }
});