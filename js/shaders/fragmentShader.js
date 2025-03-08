export const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    varying vec2 vUv;

    // Constants for grid and terrain
    #define iters 70
    #define minDst 0.001
    #define lineWidth 0.2
    #define lineCountX 35.0
    #define lineCountY 16.67 // 50.0/3.0
    #define speed 8.0
    #define gridColor vec3(0.2, 0.05, 1.0)

    // Noise function for terrain generation
    float noise(vec2 seed) {
        return fract(sin(dot(seed, vec2(12.9898, 4.1414))) * 43758.5453);
    }

    // Get height at a specific point for terrain
    float getHeight(vec2 uv) {
        float time = uTime;
        uv += 0.5;
        uv.y -= time * speed * 0.1; // Slowed down for smoother animation
        float y1 = floor(uv.y);
        float y2 = floor(uv.y + 1.0);
        float x1 = floor(uv.x);
        float x2 = floor(uv.x + 1.0);
        float iX1 = mix(noise(vec2(x1, y1)), noise(vec2(x2, y1)), fract(uv.x));
        float iX2 = mix(noise(vec2(x1, y2)), noise(vec2(x2, y2)), fract(uv.x));
        return mix(iX1, iX2, fract(uv.y));
    }

    // Get distance for ray marching
    float getDistance(vec3 p) {
        return p.z - (1.0 - cos(p.x * 15.0)) * 0.03 * getHeight(vec2(p.x * lineCountX, p.y * lineCountY));
    }

    // Get grid color using ray marching
    float getGridColor(vec2 uv) {
        float time = uTime;
        float zoom = 1.0;
        float col = 0.0;
        
        // Apply aspect ratio correction to match the sun's correction
        float aspect = uResolution.x / uResolution.y;
        uv.x /= aspect;
        
        // Camera setup
        vec3 cam = vec3(0.0, 1.0, 0.1),
            lookat = vec3(0.0),
            fwd = normalize(lookat - cam),
            u = normalize(cross(fwd, vec3(1.0, 0.0, 0.0))),
            r = cross(u, fwd),
            c = cam + fwd * zoom,
            i = c + r * uv.x + u * uv.y,
            ray = normalize(i - cam);
        
        float distSur, distOrigin = 0.0;
        
        // Ray marching loop
        vec3 p = cam;
        for (int i = 0; i < iters; i++) {
            distSur = getDistance(p);
            if (distOrigin > 2.0) break;
            if (distSur < minDst) {
                float lineW = lineWidth * distOrigin;
                float xLines = smoothstep(lineW, 0.0, abs(fract(p.x * lineCountX) - 0.5));
                float yLines = smoothstep(lineW * 2.0, 0.0, abs(fract(p.y * lineCountY - time * speed * 0.1) - 0.5));
                col += max(xLines, yLines);
                break;
            }
            p += ray * distSur;
            distOrigin += distSur;
        }
        
        return max(0.0, col - (distOrigin * 0.8));
    }

    void main() {
        // Normalized coordinates
        vec2 uv = vUv;
        vec2 R = uResolution.xy;
        
        // Adjust UV for aspect ratio
        float aspect = R.x / R.y;
        vec2 adjustedUv = vec2((uv.x - 0.5) * aspect + 0.5, uv.y);
        
        // Sun parameters
        float time = uTime;
        float sunHeight = sin(time * 0.1) * 0.1 + 0.1;
        
        // Adjust UV for sun position
        vec2 sunUv = adjustedUv;
        sunUv.y -= sunHeight;
        
        // Create sun
        float dist = 2.5 * length(sunUv - vec2(0.5, 0.5));
        float divisions = 50.0;
        
        // Sun pattern with horizontal lines
        float pattern = (sin(sunUv.y * divisions * 10.0 - time * 2.0) * 1.2 + sunUv.y * 8.3) * sunUv.y - 1.5 +
                        sin(sunUv.x * 20.0 + time * 5.0) * 0.01;
        float sunOutline = smoothstep(0.0, -0.0315, max(dist - 0.315, -pattern));
        
        // Sun color gradient
        vec3 sunColor = sunOutline * mix(vec3(4.0, 0.0, 0.2), vec3(1.0, 1.1, 0.0), sunUv.y);
        
        // Sun glow
        float glow = max(0.0, 1.0 - dist * 1.25);
        glow = min(glow * glow * glow, 0.325);
        sunColor += glow * vec3(1.5, 0.3, 0.2 + 1.0) * 1.1;
        
        // Background gradient
        vec3 topColor = vec3(0.05, 0.0, 0.15);     // Deep purple at top
        vec3 horizonColor = vec3(0.8, 0.0, 0.4);   // Pink at horizon
        float gradientFactor = pow(uv.y, 0.4);
        vec3 backgroundColor = mix(horizonColor, topColor, gradientFactor);
        
        // Reset UV for grid
        vec2 gridUv = adjustedUv - 0.5;
        gridUv.y += sunHeight + 0.18;
        
        // Final color
        vec3 finalColor = backgroundColor;
        
        // Add sun
        finalColor += sunColor;
        
        // Add grid only below horizon
        if (gridUv.y < 0.1) {
            finalColor += getGridColor(gridUv) * 4.0 * gridColor;
        }
        
        // Add scanline effect
        float flickerFreq = 1400.0;
        float flickerSpeed = 30.0;
        float flickerIntensity = 0.1;
        float scanline = smoothstep(1.0 - 0.2 / flickerFreq, 1.0, sin(time * flickerSpeed * 0.1 + uv.y * 4.0));
        finalColor *= scanline * 0.2 + 1.0;
        
        // Add flicker effect
        finalColor *= 1.0 * (1.3 + sin(time * flickerSpeed + uv.y * flickerFreq) * flickerIntensity);
        
        // Output final color
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;