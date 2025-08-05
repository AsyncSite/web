# Unresolved Issues - WhoWeAreProfileCardsFloatingPage

## 1. WebGL Context Exhaustion (White Screen Issue)

### Problem Description
- After 5-6 interactions (zoom in/out), the screen turns completely white
- Browser console shows: "WARNING: Too many active WebGL contexts. Oldest context will be lost."
- The Three.js scene becomes unresponsive and requires a page refresh

### Root Cause
- Browser limits WebGL contexts to approximately 16 active contexts
- Component re-renders or improper cleanup leads to context accumulation
- Three.js renderer disposal doesn't fully release WebGL resources

### Attempted Solutions
1. **Global Renderer Singleton Pattern**
   - Created a single global renderer instance
   - Result: Prevented white screen but broke zoom functionality

2. **Aggressive Context Cleanup**
   - Implemented WebGL context counter and tracking
   - Force cleanup when limit reached (tried limits of 2, 5 contexts)
   - Added `WEBGL_lose_context` extension usage
   - Result: Still experienced white screen after 2 interactions

3. **Component Optimization**
   - Added React.memo to prevent re-renders
   - Added stable key prop to component
   - Checked for existing renderer before initialization
   - Result: No significant improvement

### Recommended Future Approaches
1. Investigate using a single persistent Three.js scene across the entire application
2. Consider using OffscreenCanvas for better resource management
3. Implement a WebGL context pool manager
4. Review React component lifecycle and prevent unnecessary mounts/unmounts
5. Consider using React Three Fiber which handles resource management better

## 2. Zoom-out Animation Issues

### Problem Description
- Zoom-out animation appears jerky and unnatural
- Camera movement doesn't follow a smooth circular path as intended
- Animation sometimes stutters or appears to jump positions

### Root Cause
- Complex angle calculations causing inconsistent movement
- Interpolation between current and target positions not smooth
- Possible performance issues with requestAnimationFrame timing

### Attempted Solutions
1. **Continuous Rotation Path**
   - Stored zoom direction during zoom-in
   - Calculated 180-degree continuation path
   - Result: Movement still appeared unnatural

2. **Simplified Circular Path**
   - Reduced rotation to 90 degrees
   - Simplified angle calculations
   - Changed easing function to easeInOutCubic
   - Result: Still experiencing stuttering

### Recommended Future Approaches
1. Use a bezier curve or spline for smoother camera paths
2. Implement fixed waypoints for predictable movement
3. Consider using GSAP or another animation library for better control
4. Profile performance to identify bottlenecks
5. Test with different easing functions and durations

## Additional Notes

### Pixel Effect Enhancement (Lower Priority)
- Current implementation shows square pixels moving across the scene
- User requested these to look more like shooting stars
- Location: Particles system in ThreeSceneFloatingStory.tsx (lines 171-192)
- Recommendation: Add tail effect, elongated geometry, and varied speeds/sizes

### Performance Considerations
- The scene contains many transparent objects which impact performance
- Consider implementing LOD (Level of Detail) more aggressively
- Reduce texture sizes and geometry complexity where possible
- Monitor frame rate and adjust quality settings dynamically

## Testing Recommendations
1. Test on different browsers (Chrome, Firefox, Safari)
2. Monitor WebGL context count in DevTools
3. Use Chrome Performance profiler to identify bottlenecks
4. Test on various hardware configurations
5. Implement error boundaries to gracefully handle WebGL failures