// Add scanline effect
float flickerFreq = mix(300.0, 700.0, uPerformance);  // Reduced from 700.0-1400.0 to 300.0-700.0
float flickerSpeed = mix(5.0, 15.0, uPerformance);    // Reduced from 15.0-30.0 to 5.0-15.0
float flickerIntensity = mix(0.05, 0.1, uPerformance);
float scanlineFreq = mix(20.0, 40.0, uPerformance);
float scanlineAmount = mix(0.05, 0.1, uPerformance);
float scanline = step(0.5, fract(uv.y * scanlineFreq + time * mix(2.0, 5.0, uPerformance)));
finalColor = mix(finalColor, finalColor * (1.0 - scanlineAmount), scanline); 