import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js';
import { vertexShader } from './shaders/vertexShader.js';
import { fragmentShader } from './shaders/fragmentShader.js';

class ThreeJSHeader {
    constructor() {
        this.container = document.getElementById('header-canvas-container');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.time = 0;
        
        // FPS monitoring - IMPROVEMENT 1: More responsive performance monitoring
        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fpsUpdateInterval = 250; // Reduced from 1000ms to 250ms for faster response
        
        // IMPROVEMENT 2: Add smooth transition for performance value
        this.targetPerformanceValue = 1.0;
        this.currentPerformanceValue = 1.0;
        this.performanceTransitionSpeed = 0.05; // How quickly to transition between performance levels

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
        // Set initial visibility while maintaining opacity: 0
        gsap.set(['.title-container', '.tagline-text', '.hero p', '.mpaa-rating'], {
            visibility: 'visible',
            opacity: 0  // Explicitly set initial opacity
        });

        // Create a timeline for intro animation
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        
        // Animate the header elements with staggered entrance
        tl.to('.tagline-text', {
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        })
        .fromTo('.title-container', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 1.2 }
        )
        .fromTo('.hero p', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 1 }, 
            "-=0.7"
        )
        .fromTo('.mpaa-rating',
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.5, ease: "back.out" },
            "-=0.5"
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
        
        // Update FPS more frequently (IMPROVEMENT 1)
        if (elapsed >= this.fpsUpdateInterval) {
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.frameCount = 0;
            this.lastTime = now;
            
            // Adjust target quality based on FPS
            if (this.fps < 30) {
                this.targetPerformanceValue = 0.3; // Low performance
            } else if (this.fps < 45) {
                this.targetPerformanceValue = 0.6; // Medium performance
            } else {
                this.targetPerformanceValue = 1.0; // High performance
            }
        }
        
        // IMPROVEMENT 2: Smooth transition between performance values
        if (this.currentPerformanceValue !== this.targetPerformanceValue) {
            this.currentPerformanceValue = THREE.MathUtils.lerp(
                this.currentPerformanceValue,
                this.targetPerformanceValue,
                this.performanceTransitionSpeed
            );
            
            // Update performance uniform with smoothly transitioned value
            this.material.uniforms.uPerformance.value = this.currentPerformanceValue;
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