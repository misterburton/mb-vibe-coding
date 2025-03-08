// Add scanline effect
float flickerFreq = mix(300.0, 700.0, uPerformance);  // Reduced from 700.0-1400.0 to 300.0-700.0
float flickerSpeed = mix(5.0, 15.0, uPerformance);    // Reduced from 15.0-30.0 to 5.0-15.0
float flickerIntensity = mix(0.05, 0.1, uPerformance);
float scanline = smoothstep(1.0 - 0.2 / flickerFreq, 1.0, sin(time * flickerSpeed * 0.1 + uv.y * 4.0));
finalColor *= scanline * 0.2 + 1.0; 