import React, { useEffect, useRef, useState } from 'react';
import { WhoWeAreMemberData } from '../../data/whoweareTeamMembers';

interface ThreeSceneProfilePlanetsProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

const ThreeSceneProfilePlanets: React.FC<ThreeSceneProfilePlanetsProps> = ({ 
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
        // Dynamic import of Three.js
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
        const { CSS2DRenderer, CSS2DObject } = await import('three/examples/jsm/renderers/CSS2DRenderer');
        
        if (!mounted || !mountRef.current) return;

        setIsThreeLoaded(true);

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(0, 8, 25);

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

        // CSS2D Renderer for HTML labels
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0';
        labelRenderer.domElement.style.pointerEvents = 'none';
        mountRef.current.appendChild(labelRenderer.domElement);

        // Controls setup
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 10;
        controls.maxDistance = 40;
        controls.maxPolarAngle = Math.PI * 0.495;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Ground with subtle grid
        const groundGeometry = new THREE.PlaneGeometry(60, 60);
        const groundMaterial = new THREE.MeshPhongMaterial({
          color: 0x1a1a1a,
          emissive: 0x0a0a0a
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -3;
        ground.receiveShadow = true;
        scene.add(ground);

        // Grid
        const gridHelper = new THREE.GridHelper(60, 30, 0x2a2a2a, 0x1a1a1a);
        gridHelper.position.y = -2.99;
        scene.add(gridHelper);

        // Central AsyncSite Logo/Core
        const coreGroup = new THREE.Group();
        
        // Core base
        const coreGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 8);
        const coreMaterial = new THREE.MeshPhongMaterial({
          color: 0x6366f1,
          emissive: 0x6366f1,
          emissiveIntensity: 0.2
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        coreGroup.add(core);

        // AsyncSite text
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 512;
        textCanvas.height = 128;
        const ctx = textCanvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#6366f1';
          ctx.fillRect(0, 0, 512, 128);
          ctx.font = 'bold 48px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('ASYNCSITE', 256, 64);
        }
        
        const textTexture = new THREE.CanvasTexture(textCanvas);
        const textMaterial = new THREE.SpriteMaterial({
          map: textTexture,
          transparent: true
        });
        const textSprite = new THREE.Sprite(textMaterial);
        textSprite.scale.set(4, 1, 1);
        textSprite.position.y = 1.5;
        coreGroup.add(textSprite);

        scene.add(coreGroup);

        // Floating particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 300;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
          const radius = 5 + Math.random() * 25;
          const theta = Math.random() * Math.PI * 2;
          const y = (Math.random() - 0.5) * 10;
          
          positions[i] = Math.cos(theta) * radius;
          positions[i + 1] = y;
          positions[i + 2] = Math.sin(theta) * radius;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
          color: 0x6366f1,
          size: 0.1,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        // Member profile planets
        const planetObjects: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Create profile texture with GitHub image
        const createProfileTexture = (member: WhoWeAreMemberData) => {
          return new Promise<any>((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const context = canvas.getContext('2d');
            
            if (context) {
              // Start with dark background
              context.fillStyle = '#0a0a0a';
              context.fillRect(0, 0, 512, 512);
              
              // Load GitHub profile image directly with img tag
              const img = new Image();
              
              // Use GitHub username from member data
              const githubUsername = member.github || member.id;
              
              img.onload = () => {
                console.log('Image loaded for:', member.name, githubUsername);
                // 구체 전체를 이미지로 채우기
                context.drawImage(img, 0, 0, 512, 512);
                
                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;
                resolve(texture);
              };
              
              img.onerror = () => {
                console.log('Image failed to load, using fallback for:', member.name);
                // Fallback to colored background with initials
                const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
                gradient.addColorStop(0, member.color);
                gradient.addColorStop(1, member.darkColor);
                context.fillStyle = gradient;
                context.fillRect(0, 0, 512, 512);
                
                context.font = 'bold 200px Arial';
                context.fillStyle = '#ffffff';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(member.initials, 256, 256);
                
                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;
                resolve(texture);
              };
              
              // Try both URLs - first avatars API, then fallback to github.com
              const tryLoadImage = (url: string, fallbackUrl?: string) => {
                img.crossOrigin = 'anonymous';
                img.src = url;
                
                if (fallbackUrl) {
                  img.onerror = () => {
                    console.log('First URL failed, trying fallback:', fallbackUrl);
                    img.crossOrigin = '';  // Remove crossOrigin for github.com
                    img.src = fallbackUrl;
                    
                    // If both fail, use the texture fallback
                    img.onerror = () => {
                      console.log('Both URLs failed, using fallback for:', member.name);
                      // Fallback to colored background with initials
                      const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
                      gradient.addColorStop(0, member.color);
                      gradient.addColorStop(1, member.darkColor);
                      context.fillStyle = gradient;
                      context.fillRect(0, 0, 512, 512);
                      
                      context.font = 'bold 200px Arial';
                      context.fillStyle = '#ffffff';
                      context.textAlign = 'center';
                      context.textBaseline = 'middle';
                      context.fillText(member.initials, 256, 256);
                      
                      const texture = new THREE.CanvasTexture(canvas);
                      texture.needsUpdate = true;
                      resolve(texture);
                    };
                  };
                }
              };
              
              // Try avatars API first, then github.com as fallback
              tryLoadImage(
                `https://avatars.githubusercontent.com/${githubUsername}?size=120`,
                `https://github.com/${githubUsername}.png?size=120`
              );
            } else {
              // Return empty texture if context fails
              const texture = new THREE.CanvasTexture(canvas);
              resolve(texture);
            }
          });
        };

        // Position members in orbit pattern
        const orbitRadius = 15;
        members.forEach(async (member, index) => {
          const angle = (index / members.length) * Math.PI * 2;
          const x = Math.cos(angle) * orbitRadius;
          const z = Math.sin(angle) * orbitRadius;
          
          const planetGroup = new THREE.Group();
          planetGroup.userData = member;
          
          // Planet base (profile card style)
          const planetGeometry = new THREE.SphereGeometry(2.5, 32, 32);
          
          // Load texture asynchronously
          const texture = await createProfileTexture(member);
          
          const planetMaterial = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 10,
            emissive: new THREE.Color(member.color),
            emissiveIntensity: 0.02
          });
          const planet = new THREE.Mesh(planetGeometry, planetMaterial);
          planet.castShadow = true;
          planet.receiveShadow = true;
          planetGroup.add(planet);
          
          // Glow effect
          const glowGeometry = new THREE.SphereGeometry(2.8, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          planetGroup.add(glow);
          
          // HTML Label (like tecoteco hover)
          const labelDiv = document.createElement('div');
          labelDiv.className = 'whoweare-planet-label';
          labelDiv.style.cssText = `
            padding: 8px 12px;
            background: rgba(26, 26, 26, 0.95);
            border: 1px solid ${member.color};
            border-radius: 8px;
            color: #ffffff;
            font-size: 12px;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          `;
          labelDiv.innerHTML = `
            <div style="font-weight: bold; color: ${member.color};">${member.name}</div>
            <div style="font-size: 11px; color: #ccc; margin-top: 2px;">${member.role}</div>
            <div style="font-size: 10px; color: #999; margin-top: 4px;">Click for details</div>
          `;
          
          const label = new CSS2DObject(labelDiv);
          label.position.set(0, 3.5, 0);
          planetGroup.add(label);
          
          // Orbital ring
          const ringGeometry = new THREE.TorusGeometry(3, 0.05, 16, 100);
          const ringMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.2
          });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.rotation.x = Math.PI / 2;
          planetGroup.add(ring);
          
          // Connection line to center
          const lineGeometry = new THREE.BufferGeometry();
          const linePoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(x, 0, z)
          ];
          lineGeometry.setFromPoints(linePoints);
          
          const lineMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.1
          });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          scene.add(line);
          
          planetGroup.position.set(x, 0, z);
          planetGroup.userData.baseY = 0;
          planetGroup.userData.floatOffset = Math.random() * Math.PI * 2;
          planetGroup.userData.rotationSpeed = 0.001 + Math.random() * 0.002;
          planetGroup.userData.glow = glow;
          planetGroup.userData.label = labelDiv;
          planetGroup.userData.ring = ring;
          planetGroup.userData.line = line;
          
          scene.add(planetGroup);
          planetObjects.push(planetGroup);
        });

        // Mouse events
        const handleMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(planetObjects, true);
          
          // Reset all planets
          planetObjects.forEach(obj => {
            obj.scale.setScalar(1);
            if (obj.userData.glow) {
              obj.userData.glow.material.opacity = 0.1;
            }
            if (obj.userData.label) {
              obj.userData.label.style.opacity = '0';
            }
            if (obj.userData.ring) {
              obj.userData.ring.material.opacity = 0.2;
            }
            if (obj.userData.line) {
              obj.userData.line.material.opacity = 0.1;
            }
          });
          
          if (intersects.length > 0) {
            const hoveredGroup = intersects[0].object.parent;
            if (hoveredGroup && hoveredGroup.userData.id) {
              hoveredGroup.scale.setScalar(1.1);
              if (hoveredGroup.userData.glow) {
                hoveredGroup.userData.glow.material.opacity = 0.3;
              }
              if (hoveredGroup.userData.label) {
                hoveredGroup.userData.label.style.opacity = '1';
              }
              if (hoveredGroup.userData.ring) {
                hoveredGroup.userData.ring.material.opacity = 0.5;
              }
              if (hoveredGroup.userData.line) {
                hoveredGroup.userData.line.material.opacity = 0.3;
              }
              document.body.style.cursor = 'pointer';
            }
          } else {
            document.body.style.cursor = 'default';
          }
        };

        const handleClick = () => {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(planetObjects, true);
          
          if (intersects.length > 0) {
            const clickedGroup = intersects[0].object.parent;
            if (clickedGroup && clickedGroup.userData.id) {
              onMemberSelect(clickedGroup.userData as WhoWeAreMemberData);
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
        const clock = new THREE.Clock();
        
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          
          const elapsedTime = clock.getElapsedTime();
          
          // Rotate core
          coreGroup.rotation.y = elapsedTime * 0.1;
          
          // Animate planets
          planetObjects.forEach((planetGroup, index) => {
            // Gentle floating
            planetGroup.position.y = planetGroup.userData.baseY + 
              Math.sin(elapsedTime * 0.5 + planetGroup.userData.floatOffset) * 0.5;
            
            // Self rotation
            planetGroup.rotation.y += planetGroup.userData.rotationSpeed;
            
            // Ring rotation
            if (planetGroup.userData.ring) {
              planetGroup.userData.ring.rotation.z = elapsedTime * 0.3;
            }
            
            // Orbital motion (subtle)
            const orbitSpeed = 0.05;
            const angle = (index / members.length) * Math.PI * 2 + elapsedTime * orbitSpeed;
            planetGroup.position.x = Math.cos(angle) * orbitRadius;
            planetGroup.position.z = Math.sin(angle) * orbitRadius;
            
            // Update connection line
            if (planetGroup.userData.line) {
              const linePositions = planetGroup.userData.line.geometry.attributes.position.array;
              linePositions[3] = planetGroup.position.x;
              linePositions[4] = planetGroup.position.y;
              linePositions[5] = planetGroup.position.z;
              planetGroup.userData.line.geometry.attributes.position.needsUpdate = true;
            }
          });
          
          // Animate particles
          particles.rotation.y += 0.0002;
          
          controls.update();
          renderer.render(scene, camera);
          labelRenderer.render(scene, camera);
        };

        animate();
        onLoadComplete();

        // Cleanup function
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
            mountRef.current.removeChild(labelRenderer.domElement);
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

export default ThreeSceneProfilePlanets;