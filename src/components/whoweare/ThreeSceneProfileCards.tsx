import React, { useEffect, useRef, useState } from 'react';
import { WhoWeAreMemberData } from '../../data/whoweareTeamMembers';

interface ThreeSceneProfileCardsProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

const ThreeSceneProfileCards: React.FC<ThreeSceneProfileCardsProps> = ({ 
  members, 
  onMemberSelect, 
  onLoadComplete, 
  onLoadError 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isThreeLoaded, setIsThreeLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initThree = async () => {
      try {
        // Preload all profile images
        const imagePromises = members
          .filter(member => member.profileImage)
          .map(member => {
            return new Promise<{ id: string; image: HTMLImageElement }>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve({ id: member.id, image: img });
              img.onerror = () => reject(new Error(`Failed to load image for ${member.id}`));
              img.src = member.profileImage!;
            });
          });

        const loadedImages = await Promise.allSettled(imagePromises);
        const imageMap = new Map<string, HTMLImageElement>();
        
        loadedImages.forEach(result => {
          if (result.status === 'fulfilled') {
            imageMap.set(result.value.id, result.value.image);
          }
        });

        // Dynamic import of Three.js
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
        
        if (!mounted || !mountRef.current) return;

        setIsThreeLoaded(true);

        // Scene setup - Apple-inspired dark environment
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a); // Refined dark gray
        scene.fog = new THREE.FogExp2(0x0a0a0a, 0.015); // Softer exponential fog
        sceneRef.current = scene;

        // Camera setup - cinematic perspective
        const camera = new THREE.PerspectiveCamera(
          60, // Slightly narrower FOV for more natural perspective
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(0, 2, 25);

        // Renderer setup - high quality rendering
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for retina
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls setup - smooth and restricted
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08; // Smoother damping
        controls.minDistance = 12;
        controls.maxDistance = 35;
        controls.maxPolarAngle = Math.PI * 0.85; // Prevent going too low
        controls.enablePan = false; // Cleaner interaction

        // Lighting - sophisticated multi-light setup
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);

        // Key light - main directional light
        const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
        keyLight.position.set(5, 10, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        scene.add(keyLight);
        
        // Fill light - softer opposing light
        const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
        fillLight.position.set(-5, 5, -5);
        scene.add(fillLight);
        
        // Rim light - accent from behind
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
        rimLight.position.set(0, 5, -10);
        scene.add(rimLight);

        // Particles (stars) - subtle and elegant
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 300;
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          // More natural distribution
          const radius = 15 + Math.random() * 35;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          
          positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i3 + 2] = radius * Math.cos(phi);
          
          // Varied star sizes for depth
          sizes[i] = Math.random() * 0.08 + 0.02;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particlesMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.05,
          transparent: true,
          opacity: 0.3,
          sizeAttenuation: true,
          blending: THREE.AdditiveBlending,
          vertexColors: true
        });
        
        // Add subtle color variation to stars
        const colors = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          const brightness = 0.5 + Math.random() * 0.5;
          colors[i3] = brightness;
          colors[i3 + 1] = brightness;
          colors[i3 + 2] = brightness * (0.8 + Math.random() * 0.4); // Slight blue tint
        }
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        // Canvas roundRect polyfill for older browsers
        if (!(CanvasRenderingContext2D.prototype as any).roundRect) {
          (CanvasRenderingContext2D.prototype as any).roundRect = function(x: number, y: number, width: number, height: number, radius: number) {
            this.beginPath();
            this.moveTo(x + radius, y);
            this.lineTo(x + width - radius, y);
            this.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.lineTo(x + width, y + height - radius);
            this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.lineTo(x + radius, y + height);
            this.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.lineTo(x, y + radius);
            this.quadraticCurveTo(x, y, x + radius, y);
            this.closePath();
          };
        }

        // Text wrap utility function
        const wrapText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
          const words = text.split(' ');
          let line = '';
          
          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
              context.fillText(line, x, y);
              line = words[n] + ' ';
              y += lineHeight;
            } else {
              line = testLine;
            }
          }
          context.fillText(line, x, y);
        };

        // Member spheres
        const memberObjects: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        members.forEach((member, index) => {
          const group = new THREE.Group();
          group.userData = member;
          
          // 1. Premium glass sphere with advanced materials
          const sphereGeometry = new THREE.SphereGeometry(1.8, 64, 64);
          const sphereMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(member.color),
            metalness: 0.0,
            roughness: 0.0,
            transmission: 0.9,  // Glass-like transparency
            transparent: true,
            opacity: 0.3,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            ior: 1.5,  // Index of refraction for glass
            thickness: 0.5,  // Glass thickness
            envMapIntensity: 0.3,
            side: THREE.DoubleSide
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.castShadow = true;
          sphere.receiveShadow = true;
          group.add(sphere);
          
          // 2. Subtle inner glow
          const glowGeometry = new THREE.SphereGeometry(1.75, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color).multiplyScalar(1.2),
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
          });
          const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
          group.add(glowSphere);
          
          // 3. Vertical profile card
          const profileGroup = new THREE.Group();
          
          // Create profile card with canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 256;
          canvas.height = 320;
          
          if (ctx) {
            // Premium glassmorphism card
            // Background with subtle gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, 320);
            gradient.addColorStop(0, `rgba(255, 255, 255, 0.12)`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, 0.06)`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0.1)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(8, 8, 240, 304);
            
            // Rounded corners effect
            ctx.globalCompositeOperation = 'destination-in';
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.roundRect(8, 8, 240, 304, 20);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            
            // Subtle border with glow
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            ctx.shadowBlur = 20;
            ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(8, 8, 240, 304, 20);
            ctx.stroke();
            ctx.shadowBlur = 0;
            
            // Profile photo circle area
            const centerX = 128;
            const photoY = 75;
            
            if (member.profileImage && imageMap.has(member.id)) {
              // Use preloaded image
              const img = imageMap.get(member.id)!;
              
              // Draw circular clipped image immediately
              ctx.save();
              ctx.beginPath();
              ctx.arc(centerX, photoY, 40, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              ctx.drawImage(img, centerX - 40, photoY - 40, 80, 80);
              ctx.restore();
              
              // Circle border with glow
              ctx.shadowColor = member.color;
              ctx.shadowBlur = 10;
              ctx.strokeStyle = member.color;
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(centerX, photoY, 40, 0, Math.PI * 2);
              ctx.stroke();
              ctx.shadowBlur = 0;
            } else {
              // Background circle with gradient
              const circleGradient = ctx.createRadialGradient(centerX, photoY, 0, centerX, photoY, 40);
              circleGradient.addColorStop(0, member.color);
              circleGradient.addColorStop(0.7, member.darkColor || member.color);
              circleGradient.addColorStop(1, `${member.color}88`);
              ctx.fillStyle = circleGradient;
              ctx.beginPath();
              ctx.arc(centerX, photoY, 40, 0, Math.PI * 2);
              ctx.fill();
              
              // Inner glow
              ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
              ctx.lineWidth = 2;
              ctx.stroke();
              
              // Initials with shadow
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 30px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
              ctx.shadowBlur = 4;
              ctx.fillText(member.initials, centerX, photoY);
              ctx.shadowBlur = 0;
            }
            
            // Name with better contrast
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetY = 1;
            ctx.fillText(member.name, centerX, 150);
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            
            // Role
            ctx.fillStyle = member.color;
            ctx.font = '14px Arial';
            ctx.fillText(member.role, centerX, 175);
            
            // Divider line with gradient
            const lineGradient = ctx.createLinearGradient(78, 0, 178, 0);
            lineGradient.addColorStop(0, 'transparent');
            lineGradient.addColorStop(0.5, member.color);
            lineGradient.addColorStop(1, 'transparent');
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(78, 195);
            ctx.lineTo(178, 195);
            ctx.stroke();
            
            // Quote (multi-line) with better readability
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'italic 11px Arial';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 2;
            wrapText(ctx, member.quote, centerX, 220, 160, 18);
            ctx.shadowBlur = 0;
          }
          
          // Apply texture
          const profileTexture = new THREE.CanvasTexture(canvas);
          const profileMaterial = new THREE.MeshBasicMaterial({
            map: profileTexture,
            transparent: true,
            side: THREE.DoubleSide
          });
          const profilePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(1.2, 1.5),
            profileMaterial
          );
          profilePlane.position.z = 0.05;
          profileGroup.add(profilePlane);
          
          // Add profile group to main group
          group.add(profileGroup);
          group.userData.profileGroup = profileGroup;
          
          // Random size variation
          const scale = 0.8 + Math.random() * 0.6; // 0.8 ~ 1.4
          group.scale.set(scale, scale, scale);
          
          // More random position
          const angle = (index / members.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
          const radius = 6 + Math.random() * 8; // 6 ~ 14
          const heightVariation = 2 + (Math.random() - 0.5) * 6; // -1 ~ 5 (shifted up)
          
          group.position.set(
            Math.cos(angle) * radius + (Math.random() - 0.5) * 4,
            heightVariation,
            Math.sin(angle) * radius + (Math.random() - 0.5) * 4
          );
          
          // Store animation parameters
          group.userData.floatOffset = Math.random() * Math.PI * 2;
          group.userData.floatSpeed = 0.5 + Math.random() * 0.5;
          group.userData.rotationSpeed = 0.001 + Math.random() * 0.002;
          group.userData.originalY = group.position.y;
          
          // Subtle point light for ambiance
          const light = new THREE.PointLight(new THREE.Color(member.color), 0.3, 10);
          light.position.copy(group.position);
          light.castShadow = true;
          scene.add(light);
          group.userData.light = light;
          
          // Soft inner illumination
          const innerLight = new THREE.PointLight(0xffffff, 0.2, 4);
          innerLight.position.set(0, 0, 0.5);
          group.add(innerLight);
          
          scene.add(group);
          memberObjects.push(group);
        });

        // Mouse events
        const handleMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(memberObjects, true);
          
          // Smooth hover transitions
          memberObjects.forEach(obj => {
            const targetScale = obj.userData.hoverScale || 1;
            obj.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
            
            // Smooth material transitions
            const sphere = obj.children[0] as any;
            if (sphere && sphere.material) {
              const targetOpacity = obj.userData.isHovered ? 0.5 : 0.3;
              sphere.material.opacity += (targetOpacity - sphere.material.opacity) * 0.1;
              
              // Subtle emission on hover
              if (obj.userData.isHovered) {
                sphere.material.emissive = new THREE.Color(obj.userData.color);
                sphere.material.emissiveIntensity = 0.1;
              } else {
                sphere.material.emissiveIntensity *= 0.95;
              }
            }
            obj.userData.isHovered = false;
          });
          
          if (intersects.length > 0) {
            const hoveredObject = intersects[0].object.parent;
            if (hoveredObject) {
              hoveredObject.userData.hoverScale = 1.15; // Subtle scale
              hoveredObject.userData.isHovered = true;
              document.body.style.cursor = 'pointer';
            }
          } else {
            memberObjects.forEach(obj => obj.userData.hoverScale = 1);
            document.body.style.cursor = 'default';
          }
        };

        // Zoom animation state
        let isZooming = false;
        let zoomTarget: any = null;
        let zoomStartTime = 0;
        const zoomDuration = 800; // ms

        const handleClick = () => {
          if (isZooming) return;
          
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(memberObjects, true);
          
          if (intersects.length > 0 && intersects[0].object.parent) {
            const clickedObject = intersects[0].object.parent;
            const clickedMember = clickedObject.userData as WhoWeAreMemberData;
            
            // Start zoom animation
            isZooming = true;
            zoomTarget = clickedObject;
            zoomStartTime = Date.now();
            
            // Disable controls during zoom
            controls.enabled = false;
            
            // Select member after zoom completes
            setTimeout(() => {
              onMemberSelect(clickedMember);
              
              // Reset after showing card
              setTimeout(() => {
                isZooming = false;
                controls.enabled = true;
              }, 300);
            }, zoomDuration);
          }
        };

        // Camera reset handler
        const handleCameraReset = () => {
          if (!isZooming) return;
          
          isZooming = false;
          zoomStartTime = Date.now();
          
          // Animate back
          const resetDuration = 600;
          const resetAnimation = () => {
            const elapsed = Date.now() - zoomStartTime;
            const progress = Math.min(elapsed / resetDuration, 1);
            const eased = easeInOutCubic(progress);
            
            // Reset camera position
            camera.position.lerpVectors(camera.position.clone(), initialCameraPos, eased);
            camera.lookAt(initialCameraTarget);
            
            // Reset sphere scales and opacity
            memberObjects.forEach(obj => {
              obj.scale.lerp(new THREE.Vector3(1, 1, 1), eased);
              const sphere = obj.children[0] as any;
              if (sphere && sphere.material) {
                sphere.material.opacity = 0.4;
              }
            });
            
            if (progress < 1) {
              requestAnimationFrame(resetAnimation);
            } else {
              controls.enabled = true;
              zoomTarget = null;
            }
          };
          
          resetAnimation();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleClick);
        window.addEventListener('resetCamera', handleCameraReset);

        // Window resize
        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Store initial camera position
        const initialCameraPos = camera.position.clone();
        const initialCameraTarget = new THREE.Vector3(0, 0, 0);

        // Easing function
        const easeInOutCubic = (t: number): number => {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        // Animation loop
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          const time = Date.now() * 0.001;
          
          // Handle zoom animation
          if (isZooming && zoomTarget) {
            const elapsed = Date.now() - zoomStartTime;
            const progress = Math.min(elapsed / zoomDuration, 1);
            const eased = easeInOutCubic(progress);
            
            // Calculate target position (closer to the sphere)
            const targetPos = zoomTarget.position.clone();
            const cameraOffset = new THREE.Vector3(0, 0, 8); // Distance from sphere
            const zoomCameraPos = targetPos.clone().add(cameraOffset);
            
            // Smooth camera interpolation
            camera.position.lerpVectors(initialCameraPos, zoomCameraPos, eased);
            
            // Smooth camera look-at transition
            const lookTarget = targetPos.clone();
            lookTarget.y += 0.2; // Slight upward offset for better composition
            const smoothLookAt = new THREE.Vector3().lerpVectors(initialCameraTarget, lookTarget, eased);
            camera.lookAt(smoothLookAt);
            
            // Scale up the target sphere slightly
            const targetScale = 1 + eased * 0.5;
            zoomTarget.scale.set(targetScale, targetScale, targetScale);
            
            // Fade out other spheres
            memberObjects.forEach(obj => {
              if (obj !== zoomTarget) {
                const sphere = obj.children[0] as any;
                if (sphere && sphere.material) {
                  sphere.material.opacity = 0.4 * (1 - eased * 0.7);
                }
              }
            });
          }
          
          // Elegant sphere animations
          memberObjects.forEach((obj) => {
            // Smooth breathing motion
            const breathe = Math.sin(time * obj.userData.floatSpeed + obj.userData.floatOffset);
            const floatY = breathe * 0.3;
            const scaleBreath = 1 + breathe * 0.02; // Subtle scale pulsing
            
            obj.position.y = obj.userData.originalY + floatY;
            
            // Apply base scale with breathing
            const baseScale = obj.userData.hoverScale || 1;
            obj.scale.setScalar(baseScale * scaleBreath);
            
            // Very slow rotation
            obj.rotation.y += obj.userData.rotationSpeed;
            
            // Keep profile card facing camera
            if (obj.userData.profileGroup) {
              obj.userData.profileGroup.rotation.y = -obj.rotation.y;
            }
            
            // Update light position to follow sphere
            if (obj.userData.light) {
              obj.userData.light.position.copy(obj.position);
              obj.userData.light.intensity = 0.3 + breathe * 0.05;
            }
          });
          
          // Ambient star field drift
          particles.rotation.y += 0.00005;
          particles.rotation.x = Math.sin(time * 0.1) * 0.02;
          
          controls.update();
          renderer.render(scene, camera);
        };

        animate();
        onLoadComplete();

        // Cleanup function
        return () => {
          mounted = false;
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('click', handleClick);
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('resetCamera', handleCameraReset);
          
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
          }
          
          if (rendererRef.current && mountRef.current) {
            mountRef.current.removeChild(rendererRef.current.domElement);
            rendererRef.current.dispose();
          }
          
          if (sceneRef.current) {
            sceneRef.current.traverse((object: any) => {
              if (object.geometry) object.geometry.dispose();
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach((material: any) => material.dispose());
                } else {
                  object.material.dispose();
                }
              }
            });
          }
        };
      } catch (error) {
        console.error('Three.js initialization error:', error);
        onLoadError('WebGL 초기화 중 오류가 발생했습니다.');
      }
    };

    initThree();

    return () => {
      mounted = false;
    };
  }, [members, onMemberSelect, onLoadComplete, onLoadError]);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ThreeSceneProfileCards;