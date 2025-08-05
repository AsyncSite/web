import React, { useEffect, useRef, useState } from 'react';
import { WhoWeAreMemberData } from '../../pages/WhoWeArePage';

interface ThreeSceneGlassOrbsProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

const ThreeSceneGlassOrbs: React.FC<ThreeSceneGlassOrbsProps> = ({ 
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
          
          // Glass orb (outer shell)
          const orbGeometry = new THREE.SphereGeometry(1.5, 64, 64);
          const orbMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(member.color),
            metalness: 0,
            roughness: 0,
            transmission: 0.95,
            thickness: 0.5,
            envMapIntensity: 0.4,
            clearcoat: 1,
            clearcoatRoughness: 0,
            transparent: true,
            opacity: 0.3,
            reflectivity: 0.5,
            ior: 1.5,
          });
          const orb = new THREE.Mesh(orbGeometry, orbMaterial);
          orb.castShadow = true;
          orb.receiveShadow = true;
          group.add(orb);
          
          // Inner glow sphere
          const innerGlowGeometry = new THREE.SphereGeometry(1.4, 32, 32);
          const innerGlowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
          });
          const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
          group.add(innerGlow);
          
          // Profile plane (the "pearl" inside)
          const profileSize = 0.8;
          const profileGeometry = new THREE.PlaneGeometry(profileSize, profileSize);
          
          if (member.profileImage) {
            // Load profile image
            const loader = new THREE.TextureLoader();
            loader.load(
              member.profileImage,
              (texture) => {
                const profileMaterial = new THREE.MeshPhongMaterial({
                  map: texture,
                  transparent: true,
                  emissive: new THREE.Color(member.color),
                  emissiveIntensity: 0.1,
                  side: THREE.DoubleSide,
                });
                const profilePlane = new THREE.Mesh(profileGeometry, profileMaterial);
                profilePlane.castShadow = true;
                group.add(profilePlane);
                group.userData.profilePlane = profilePlane;
              },
              undefined,
              () => {
                // Fallback on error
                createFallbackProfile();
              }
            );
          } else {
            createFallbackProfile();
          }
          
          function createFallbackProfile() {
            const profileCanvas = document.createElement('canvas');
            const profileContext = profileCanvas.getContext('2d');
            profileCanvas.width = 256;
            profileCanvas.height = 256;
            
            if (profileContext) {
              // Create circular mask
              profileContext.beginPath();
              profileContext.arc(128, 128, 128, 0, Math.PI * 2);
              profileContext.clip();
              
              // Create gradient background
              const gradient = profileContext.createRadialGradient(128, 128, 0, 128, 128, 128);
              gradient.addColorStop(0, member.color);
              gradient.addColorStop(0.5, member.darkColor || member.color);
              gradient.addColorStop(1, '#000000');
              profileContext.fillStyle = gradient;
              profileContext.fillRect(0, 0, 256, 256);
              
              // Add initials
              profileContext.font = 'bold 120px Arial';
              profileContext.fillStyle = '#ffffff';
              profileContext.textAlign = 'center';
              profileContext.textBaseline = 'middle';
              profileContext.fillText(member.initials, 128, 128);
            }
            
            const profileTexture = new THREE.CanvasTexture(profileCanvas);
            const profileMaterial = new THREE.MeshPhongMaterial({
              map: profileTexture,
              transparent: true,
              emissive: new THREE.Color(member.color),
              emissiveIntensity: 0.3,
              emissiveMap: profileTexture,
              side: THREE.DoubleSide,
            });
            const profilePlane = new THREE.Mesh(profileGeometry, profileMaterial);
            profilePlane.castShadow = true;
            group.add(profilePlane);
            group.userData.profilePlane = profilePlane;
          }
          
          // Floating particles around the profile
          const particleGroup = new THREE.Group();
          const particleCount = 20;
          for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
              color: new THREE.Color(member.color),
              transparent: true,
              opacity: 0.6
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 0.8 + Math.random() * 0.2;
            particle.position.set(
              Math.cos(angle) * radius,
              (Math.random() - 0.5) * 0.4,
              Math.sin(angle) * radius
            );
            particle.userData.angle = angle;
            particle.userData.radius = radius;
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
              orb.material.opacity = 0.3;
            }
          });
          
          if (intersects.length > 0) {
            const hoveredObject = intersects[0].object.parent;
            if (hoveredObject) {
              hoveredObject.scale.set(1.2, 1.2, 1.2);
              // Make glass more visible on hover
              const orb = hoveredObject.children[0] as any;
              if (orb && orb.material) {
                orb.material.opacity = 0.5;
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
            
            // Rotate profile plane to face camera
            if (obj.userData.profilePlane) {
              obj.userData.profilePlane.lookAt(camera.position);
            }
            
            // Animate particles around profile
            if (obj.userData.particleGroup) {
              obj.userData.particleGroup.rotation.y += 0.005;
              obj.userData.particleGroup.children.forEach((particle: any, i: number) => {
                const floatOffset = Math.sin(time * 2 + i) * 0.05;
                particle.position.y = (Math.random() - 0.5) * 0.4 + floatOffset;
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

export default ThreeSceneGlassOrbs;