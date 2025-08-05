import React, { useEffect, useRef, useState } from 'react';
import { WhoWeAreMemberData } from '../../pages/WhoWeArePage';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

interface ThreeSceneJourneyProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
  scrollProgress: number; // 0 to 1
}

const ThreeSceneJourney: React.FC<ThreeSceneJourneyProps> = ({ 
  members, 
  onMemberSelect, 
  onLoadComplete, 
  onLoadError,
  scrollProgress
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const cameraRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isThreeLoaded, setIsThreeLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initThree = async () => {
      try {
        // Preload profile images
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
        
        if (!mounted || !mountRef.current) return;

        setIsThreeLoaded(true);

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.FogExp2(0x000000, 0.02);
        sceneRef.current = scene;

        // Camera setup - will be animated by scroll
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(0, 0, 50); // Start far away
        cameraRef.current = camera;

        // WebGL Renderer
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true 
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // CSS2D Renderer
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.style.pointerEvents = 'none';
        mountRef.current.appendChild(labelRenderer.domElement);
        labelRendererRef.current = labelRenderer;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        scene.add(ambientLight);

        // Create story element helper
        const createStoryElement = (title: string, content: string): HTMLDivElement => {
          const div = document.createElement('div');
          div.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(195, 232, 141, 0.3);
            border-radius: 16px;
            padding: 30px;
            width: 300px;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 0 50px rgba(195, 232, 141, 0.2);
            transition: opacity 0.8s ease;
            text-align: center;
          `;
          
          if (title) {
            const h3 = document.createElement('h3');
            h3.style.cssText = `
              color: #C3E88D;
              font-size: 1.8rem;
              margin: 0 0 15px 0;
              font-weight: 700;
            `;
            h3.textContent = title;
            div.appendChild(h3);
          }
          
          const p = document.createElement('p');
          p.style.cssText = `
            color: rgba(255, 255, 255, 0.9);
            font-size: 1.1rem;
            line-height: 1.6;
            margin: 0;
            white-space: pre-line;
          `;
          p.textContent = content;
          div.appendChild(p);
          
          return div;
        };

        // Camera path waypoints
        const cameraPath = [
          { pos: [0, 0, 50], look: [0, 0, 0] },      // Start - far view
          { pos: [20, 10, 30], look: [0, 0, 0] },   // Move to side
          { pos: [0, 20, 20], look: [0, 0, 0] },    // Above view
          { pos: [-20, 5, 15], look: [0, 0, 0] },   // Another angle
          { pos: [0, 0, 25], look: [0, 0, 0] },     // Center approach
          { pos: [0, 5, 15], look: [0, 0, 0] }      // Final position
        ];

        // Story markers along the journey
        const storyMarkers = [
          {
            progress: 0.1,
            element: createStoryElement('AsyncSite', '각자의 궤도를 도는 개발자들이\n서로의 중력이 되어주는 곳'),
            position: new THREE.Vector3(5, 5, 35)
          },
          {
            progress: 0.3,
            element: createStoryElement('시작', '우리는 \'점\'으로 흩어진\n지식의 시대에 지쳤어요'),
            position: new THREE.Vector3(-10, 8, 20)
          },
          {
            progress: 0.5,
            element: createStoryElement('가치', '큰 그림을 그리고\n느슨하지만 끈끈하게\n지속가능함을 추구해요'),
            position: new THREE.Vector3(10, 0, 10)
          },
          {
            progress: 0.7,
            element: createStoryElement('질문', '"어떻게 하면, 이 외로운 여정을\n함께 걸어갈 수 있을까?"'),
            position: new THREE.Vector3(0, 10, 5)
          }
        ];

        // Add story markers to scene
        storyMarkers.forEach(marker => {
          const labelObject = new CSS2DObject(marker.element);
          labelObject.position.copy(marker.position);
          scene.add(labelObject);
          marker.element.style.opacity = '0';
        });

        // Background stars that move with scroll
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const starPositions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
          starPositions[i] = (Math.random() - 0.5) * 200;
          starPositions[i + 1] = (Math.random() - 0.5) * 200;
          starPositions[i + 2] = (Math.random() - 0.5) * 200 - 50;
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.1,
          transparent: true,
          opacity: 0.8
        });
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Member spheres positioned along the journey
        const memberObjects: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        members.forEach((member, index) => {
          const group = new THREE.Group();
          group.userData = member;
          
          // Glass sphere
          const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
          const sphereMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(member.color),
            metalness: 0.1,
            roughness: 0.1,
            transparent: true,
            opacity: 0.3,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            side: THREE.DoubleSide
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          group.add(sphere);
          
          // Inner glow
          const glowGeometry = new THREE.SphereGeometry(1.45, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
          });
          const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
          group.add(glowSphere);
          
          // Profile card
          const profileGroup = new THREE.Group();
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 256;
          canvas.height = 320;
          
          if (ctx) {
            // Glassmorphism background
            const gradient = ctx.createLinearGradient(0, 0, 0, 320);
            gradient.addColorStop(0, `rgba(255, 255, 255, 0.1)`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, 0.05)`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0.1)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 320);
            
            const centerX = 128;
            const photoY = 75;
            
            if (member.profileImage && imageMap.has(member.id)) {
              const img = imageMap.get(member.id)!;
              ctx.save();
              ctx.beginPath();
              ctx.arc(centerX, photoY, 40, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              ctx.drawImage(img, centerX - 40, photoY - 40, 80, 80);
              ctx.restore();
            } else {
              const circleGradient = ctx.createRadialGradient(centerX, photoY, 0, centerX, photoY, 40);
              circleGradient.addColorStop(0, member.color);
              circleGradient.addColorStop(1, `${member.color}88`);
              ctx.fillStyle = circleGradient;
              ctx.beginPath();
              ctx.arc(centerX, photoY, 40, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 30px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(member.initials, centerX, photoY);
            }
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(member.name, centerX, 150);
            
            ctx.fillStyle = member.color;
            ctx.font = '14px Arial';
            ctx.fillText(member.role, centerX, 175);
          }
          
          const profileTexture = new THREE.CanvasTexture(canvas);
          const profileMaterial = new THREE.MeshBasicMaterial({
            map: profileTexture,
            transparent: true,
            side: THREE.DoubleSide
          });
          const profilePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1.25),
            profileMaterial
          );
          profilePlane.position.z = 0.05;
          profileGroup.add(profilePlane);
          
          group.add(profileGroup);
          group.userData.profileGroup = profileGroup;
          
          // Position along the journey path
          const t = index / members.length;
          const journeyZ = 40 - t * 35; // From far to near
          const angle = t * Math.PI * 2;
          const radius = 8 + Math.sin(t * Math.PI * 3) * 5;
          
          group.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle * 2) * 3,
            journeyZ
          );
          
          // Store initial position for scroll animation
          group.userData.initialPosition = group.position.clone();
          group.userData.appearProgress = 0.1 + t * 0.8; // Appear at different scroll points
          
          // Initially hidden
          sphere.material.opacity = 0;
          glowMaterial.opacity = 0;
          profileMaterial.opacity = 0;
          
          // Point light
          const light = new THREE.PointLight(new THREE.Color(member.color), 0, 8);
          light.position.copy(group.position);
          scene.add(light);
          group.userData.light = light;
          
          scene.add(group);
          memberObjects.push(group);
        });

        // Mouse events
        const handleMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(memberObjects, true);
          
          memberObjects.forEach(obj => {
            if (obj.userData.isVisible) {
              obj.scale.set(1, 1, 1);
              const sphere = obj.children[0] as any;
              if (sphere && sphere.material) {
                sphere.material.opacity = 0.3;
              }
            }
          });
          
          if (intersects.length > 0) {
            const hoveredObject = intersects[0].object.parent;
            if (hoveredObject && hoveredObject.userData.isVisible) {
              hoveredObject.scale.set(1.2, 1.2, 1.2);
              const sphere = hoveredObject.children[0] as any;
              if (sphere && sphere.material) {
                sphere.material.opacity = 0.5;
              }
              document.body.style.cursor = 'pointer';
            }
          } else {
            document.body.style.cursor = 'default';
          }
        };

        const handleClick = () => {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(memberObjects, true);
          
          if (intersects.length > 0 && intersects[0].object.parent) {
            const clickedObject = intersects[0].object.parent;
            if (clickedObject.userData.isVisible) {
              const clickedMember = clickedObject.userData as WhoWeAreMemberData;
              onMemberSelect(clickedMember);
            }
          }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleClick);

        // Window resize
        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
          labelRenderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          const time = Date.now() * 0.001;
          
          // Update camera position based on scroll
          const pathIndex = Math.min(Math.floor(scrollProgress * (cameraPath.length - 1)), cameraPath.length - 2);
          const pathT = (scrollProgress * (cameraPath.length - 1)) % 1;
          
          const from = cameraPath[pathIndex];
          const to = cameraPath[pathIndex + 1];
          
          // Interpolate camera position
          camera.position.x = THREE.MathUtils.lerp(from.pos[0], to.pos[0], pathT);
          camera.position.y = THREE.MathUtils.lerp(from.pos[1], to.pos[1], pathT);
          camera.position.z = THREE.MathUtils.lerp(from.pos[2], to.pos[2], pathT);
          
          // Look at interpolated position
          const lookX = THREE.MathUtils.lerp(from.look[0], to.look[0], pathT);
          const lookY = THREE.MathUtils.lerp(from.look[1], to.look[1], pathT);
          const lookZ = THREE.MathUtils.lerp(from.look[2], to.look[2], pathT);
          camera.lookAt(lookX, lookY, lookZ);
          
          // Update story markers visibility
          storyMarkers.forEach(marker => {
            const distance = Math.abs(scrollProgress - marker.progress);
            const opacity = distance < 0.1 ? 1 - distance * 10 : 0;
            marker.element.style.opacity = opacity.toString();
          });
          
          // Update member spheres visibility and animation
          memberObjects.forEach((obj) => {
            const appearThreshold = obj.userData.appearProgress;
            if (scrollProgress > appearThreshold) {
              obj.userData.isVisible = true;
              const fadeProgress = Math.min((scrollProgress - appearThreshold) / 0.1, 1);
              
              const sphere = obj.children[0] as any;
              const glow = obj.children[1] as any;
              const profile = obj.children[2]?.children[0] as any;
              
              if (sphere && sphere.material) {
                sphere.material.opacity = 0.3 * fadeProgress;
              }
              if (glow && glow.material) {
                glow.material.opacity = 0.1 * fadeProgress;
              }
              if (profile && profile.material) {
                profile.material.opacity = fadeProgress;
              }
              if (obj.userData.light) {
                obj.userData.light.intensity = 0.5 * fadeProgress;
              }
              
              // Floating animation
              const floatY = Math.sin(time * 0.5 + appearThreshold * 10) * 0.3;
              obj.position.y = obj.userData.initialPosition.y + floatY;
              
              // Rotation
              obj.rotation.y += 0.005;
              if (obj.userData.profileGroup) {
                obj.userData.profileGroup.rotation.y = -obj.rotation.y;
              }
            } else {
              obj.userData.isVisible = false;
            }
          });
          
          // Parallax star movement
          stars.position.z = scrollProgress * 30;
          stars.rotation.y = scrollProgress * 0.5;
          
          renderer.render(scene, camera);
          labelRenderer.render(scene, camera);
        };

        animate();
        onLoadComplete();

        // Cleanup
        return () => {
          mounted = false;
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('click', handleClick);
          window.removeEventListener('resize', handleResize);
          
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
          }
          
          if (rendererRef.current && mountRef.current) {
            mountRef.current.removeChild(rendererRef.current.domElement);
            rendererRef.current.dispose();
          }
          
          if (labelRendererRef.current && mountRef.current) {
            mountRef.current.removeChild(labelRendererRef.current.domElement);
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
  }, [members, onMemberSelect, onLoadComplete, onLoadError, scrollProgress]);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh', position: 'fixed' }} />;
};

export default ThreeSceneJourney;