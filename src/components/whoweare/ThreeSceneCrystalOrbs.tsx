import React, { useEffect, useRef, useState } from 'react';
import { WhoWeAreMemberData } from '../../pages/WhoWeArePage';

interface ThreeSceneCrystalOrbsProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

const ThreeSceneCrystalOrbs: React.FC<ThreeSceneCrystalOrbsProps> = ({ 
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
        
        if (!mounted || !mountRef.current) return;

        setIsThreeLoaded(true);

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.Fog(0x000000, 10, 80);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(0, 0, 20);

        // Renderer setup
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

        // Controls setup
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 10;
        controls.maxDistance = 40;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        // Directional light for glass effects
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        // Particles (stars)
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 500;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 100;
          positions[i + 1] = (Math.random() - 0.5) * 100;
          positions[i + 2] = (Math.random() - 0.5) * 100;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.1,
          transparent: true,
          opacity: 0.8
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        // Member orbs
        const memberObjects: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        members.forEach((member, index) => {
          const group = new THREE.Group();
          group.userData = member;
          
          // Crystal orb - main sphere
          const orbGeometry = new THREE.SphereGeometry(1.5, 64, 64);
          const orbMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(member.color),
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.8,
            thickness: 0.5,
            envMapIntensity: 0.4,
            clearcoat: 1,
            clearcoatRoughness: 0,
            transparent: true,
            opacity: 0.5,
            reflectivity: 0.3,
            ior: 1.2,
          });
          const orb = new THREE.Mesh(orbGeometry, orbMaterial);
          orb.castShadow = true;
          orb.receiveShadow = true;
          group.add(orb);
          
          // Inner glow sphere (slightly smaller)
          const innerGlowGeometry = new THREE.SphereGeometry(1.48, 32, 32);
          const innerGlowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
          });
          const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
          group.add(innerGlow);
          
          // Profile plane inside the orb
          const profileSize = 1.2;
          const profileGeometry = new THREE.PlaneGeometry(profileSize, profileSize);
          
          if (member.profileImage) {
            // Load profile image
            console.log('Loading profile image:', member.profileImage);
            const loader = new THREE.TextureLoader();
            loader.load(
              member.profileImage,
              (texture) => {
                console.log('Profile image loaded successfully');
                // Create circular mask for the image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 256;
                canvas.height = 256;
                
                if (ctx) {
                  const img = texture.image;
                  
                  // Draw circular mask
                  ctx.beginPath();
                  ctx.arc(128, 128, 128, 0, Math.PI * 2);
                  ctx.closePath();
                  ctx.clip();
                  
                  // Draw image
                  ctx.drawImage(img, 0, 0, 256, 256);
                  
                  // Add subtle glow around edges
                  ctx.globalCompositeOperation = 'source-atop';
                  const gradient = ctx.createRadialGradient(128, 128, 100, 128, 128, 128);
                  gradient.addColorStop(0, 'rgba(0,0,0,0)');
                  gradient.addColorStop(1, `${member.color}40`);
                  ctx.fillStyle = gradient;
                  ctx.fillRect(0, 0, 256, 256);
                }
                
                const maskedTexture = new THREE.CanvasTexture(canvas);
                const profileMaterial = new THREE.MeshBasicMaterial({
                  map: maskedTexture,
                  transparent: true,
                  side: THREE.DoubleSide,
                  opacity: 1,
                });
                const profilePlane = new THREE.Mesh(profileGeometry, profileMaterial);
                profilePlane.position.z = 0.5; // Move profile forward
                group.add(profilePlane);
                group.userData.profilePlane = profilePlane;
              },
              undefined,
              (error) => {
                // Fallback on error
                console.error('Failed to load profile image:', error);
                createFallbackProfile();
              }
            );
          } else {
            console.log('No profile image, using fallback');
            createFallbackProfile();
          }
          
          function createFallbackProfile() {
            console.log('Creating fallback profile for:', member.name);
            const profileCanvas = document.createElement('canvas');
            const profileContext = profileCanvas.getContext('2d');
            profileCanvas.width = 256;
            profileCanvas.height = 256;
            
            if (profileContext) {
              // Create circular mask
              profileContext.beginPath();
              profileContext.arc(128, 128, 128, 0, Math.PI * 2);
              profileContext.closePath();
              profileContext.clip();
              
              // Create gradient background
              const gradient = profileContext.createRadialGradient(128, 128, 0, 128, 128, 128);
              gradient.addColorStop(0, member.color);
              gradient.addColorStop(0.7, member.darkColor || member.color);
              gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
              profileContext.fillStyle = gradient;
              profileContext.fillRect(0, 0, 256, 256);
              
              // Add initials with glow
              profileContext.shadowColor = '#ffffff';
              profileContext.shadowBlur = 10;
              profileContext.font = 'bold 100px Arial';
              profileContext.fillStyle = '#ffffff';
              profileContext.textAlign = 'center';
              profileContext.textBaseline = 'middle';
              profileContext.fillText(member.initials, 128, 128);
            }
            
            const profileTexture = new THREE.CanvasTexture(profileCanvas);
            const profileMaterial = new THREE.MeshBasicMaterial({
              map: profileTexture,
              transparent: true,
              side: THREE.DoubleSide,
            });
            const profilePlane = new THREE.Mesh(profileGeometry, profileMaterial);
            profilePlane.position.z = 0.5; // Move profile forward
            group.add(profilePlane);
            group.userData.profilePlane = profilePlane;
          }
          
          // Floating light particles inside the orb
          const particleGroup = new THREE.Group();
          const innerParticleCount = 30;
          for (let i = 0; i < innerParticleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.015, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
              color: new THREE.Color(member.color),
              transparent: true,
              opacity: 0.6
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Random position inside sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 0.7 + Math.random() * 0.6;
            
            particle.position.set(
              r * Math.sin(phi) * Math.cos(theta),
              r * Math.sin(phi) * Math.sin(theta),
              r * Math.cos(phi)
            );
            
            particle.userData.velocity = new THREE.Vector3(
              (Math.random() - 0.5) * 0.01,
              (Math.random() - 0.5) * 0.01,
              (Math.random() - 0.5) * 0.01
            );
            
            particleGroup.add(particle);
          }
          group.add(particleGroup);
          
          // Position
          const angle = (index / members.length) * Math.PI * 2;
          const radius = 8 + Math.random() * 4;
          const heightVariation = (Math.random() - 0.5) * 4;
          
          group.position.set(
            Math.cos(angle) * radius + (Math.random() - 0.5) * 2,
            heightVariation,
            Math.sin(angle) * radius + (Math.random() - 0.5) * 2
          );
          
          // Store animation parameters
          group.userData.floatOffset = Math.random() * Math.PI * 2;
          group.userData.floatSpeed = 0.5 + Math.random() * 0.5;
          group.userData.rotationSpeed = 0.001 + Math.random() * 0.002;
          group.userData.originalY = group.position.y;
          group.userData.particleGroup = particleGroup;
          
          // Soft point light for each orb
          const light = new THREE.PointLight(new THREE.Color(member.color), 0.5, 8);
          light.position.copy(group.position);
          scene.add(light);
          
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
            obj.scale.set(1, 1, 1);
            // Reset glass material
            const orb = obj.children[0] as any;
            if (orb && orb.material) {
              orb.material.opacity = 0.5;
            }
          });
          
          if (intersects.length > 0) {
            const hoveredObject = intersects[0].object.parent;
            if (hoveredObject) {
              hoveredObject.scale.set(1.2, 1.2, 1.2);
              // Make glass more visible on hover
              const orb = hoveredObject.children[0] as any;
              if (orb && orb.material) {
                orb.material.opacity = 0.7;
              }
            }
            document.body.style.cursor = 'pointer';
          } else {
            document.body.style.cursor = 'default';
          }
        };

        const handleClick = () => {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(memberObjects, true);
          
          if (intersects.length > 0 && intersects[0].object.parent) {
            const clickedMember = intersects[0].object.parent.userData as WhoWeAreMemberData;
            onMemberSelect(clickedMember);
          }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleClick);

        // Window resize
        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          const time = Date.now() * 0.001;
          
          // Animate member orbs
          memberObjects.forEach((obj) => {
            // Gentle floating motion
            const floatY = Math.sin(time * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.3;
            obj.position.y = obj.userData.originalY + floatY;
            
            // Gentle rotation of the whole group
            obj.rotation.y += obj.userData.rotationSpeed;
            
            // Keep profile facing camera
            if (obj.userData.profilePlane) {
              obj.userData.profilePlane.lookAt(camera.position);
            }
            
            // Animate particles inside orb
            if (obj.userData.particleGroup) {
              obj.userData.particleGroup.children.forEach((particle: any) => {
                // Move particles
                particle.position.add(particle.userData.velocity);
                
                // Keep particles inside sphere
                const dist = particle.position.length();
                if (dist > 1.4) {
                  particle.position.multiplyScalar(0.5 / dist);
                  particle.userData.velocity.multiplyScalar(-0.5);
                }
              });
            }
          });
          
          // Very subtle star field rotation
          particles.rotation.y += 0.00001;
          
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

export default ThreeSceneCrystalOrbs;