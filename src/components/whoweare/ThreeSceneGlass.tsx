import React, { useEffect, useRef, useState } from 'react';
import { WhoWeAreMemberData } from '../../pages/WhoWeArePage';

interface ThreeSceneGlassProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

const ThreeSceneGlass: React.FC<ThreeSceneGlassProps> = ({ 
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
        scene.fog = new THREE.Fog(0x000000, 10, 50);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(0, 5, 15);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
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
        controls.minDistance = 5;
        controls.maxDistance = 30;
        controls.maxPolarAngle = Math.PI * 0.495;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(0, 15, 0);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.1;
        spotLight.decay = 2;
        spotLight.distance = 30;
        spotLight.castShadow = true;
        scene.add(spotLight);

        // Floor
        const floorGeometry = new THREE.PlaneGeometry(30, 30);
        const floorMaterial = new THREE.MeshPhongMaterial({
          color: 0x1a1a1a,
          emissive: 0x0a0a0a
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Grid
        const gridHelper = new THREE.GridHelper(30, 30, 0x333333, 0x222222);
        gridHelper.position.y = -1.99;
        scene.add(gridHelper);

        // Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 30;
          positions[i + 1] = Math.random() * 15 - 2;
          positions[i + 2] = (Math.random() - 0.5) * 30;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
          color: 0xC3E88D,
          size: 0.05,
          transparent: true,
          opacity: 0.6
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        // Member objects with glass material
        const memberObjects: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Create gradient texture for spheres
        const createGradientTexture = (color1: string, color2: string) => {
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 256;
          const context = canvas.getContext('2d');
          
          if (context) {
            const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(0.5, color2);
            gradient.addColorStop(1, color1);
            context.fillStyle = gradient;
            context.fillRect(0, 0, 256, 256);
          }
          
          return new THREE.CanvasTexture(canvas);
        };

        members.forEach((member) => {
          const group = new THREE.Group();
          group.userData = member;
          
          // Platform
          const platformGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 32);
          const platformMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a2a2a,
            emissive: new THREE.Color(member.color),
            emissiveIntensity: 0.1
          });
          const platform = new THREE.Mesh(platformGeometry, platformMaterial);
          platform.castShadow = true;
          platform.receiveShadow = true;
          group.add(platform);
          
          // Glass sphere with gradient texture
          const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
          const sphereMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(member.color),
            metalness: 0.0,
            roughness: 0.0,
            transmission: 0.9,
            thickness: 0.5,
            envMapIntensity: 0.4,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            opacity: 0.8,
            transparent: true,
            ior: 1.5,
            emissive: new THREE.Color(member.color),
            emissiveIntensity: 0.1,
            emissiveMap: createGradientTexture(member.color, member.darkColor),
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.position.y = 1.5;
          sphere.castShadow = true;
          group.add(sphere);
          
          // Inner core (small glowing center)
          const coreGeometry = new THREE.SphereGeometry(0.1, 16, 16);
          const coreMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color)
          });
          const core = new THREE.Mesh(coreGeometry, coreMaterial);
          core.position.y = 1.5;
          group.add(core);
          
          // Soft glow
          const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          glow.position.y = 1.5;
          group.add(glow);
          
          // Text sprite with subtle change
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = 256;
          canvas.height = 256;
          
          if (context) {
            // Subtle gradient background
            const bgGradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
            bgGradient.addColorStop(0, 'rgba(0,0,0,0.6)');
            bgGradient.addColorStop(1, 'rgba(0,0,0,0.8)');
            context.fillStyle = bgGradient;
            context.fillRect(0, 0, 256, 256);
            
            context.font = 'bold 120px Arial';
            context.fillStyle = '#ffffff';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(member.initials, 128, 128);
          }
          
          const texture = new THREE.CanvasTexture(canvas);
          const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
          });
          const sprite = new THREE.Sprite(spriteMaterial);
          sprite.scale.set(1.5, 1.5, 1);
          sprite.position.y = 1.5;
          group.add(sprite);
          
          // Position
          group.position.set(member.position.x, 0, member.position.z);
          group.userData.floatOffset = Math.random() * Math.PI * 2;
          group.userData.core = core;
          
          // Point light
          const light = new THREE.PointLight(new THREE.Color(member.color), 0.5, 5);
          light.position.copy(group.position);
          light.position.y = 3;
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
            const glow = obj.children.find((child: any) => child.material?.side === THREE.BackSide);
            if (glow) {
              (glow as any).material.opacity = 0.1;
            }
          });
          
          if (intersects.length > 0) {
            const hoveredObject = intersects[0].object.parent;
            if (hoveredObject) {
              hoveredObject.scale.set(1.1, 1.1, 1.1);
              const glow = hoveredObject.children.find((child: any) => child.material?.side === THREE.BackSide);
              if (glow) {
                (glow as any).material.opacity = 0.2;
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

        // Mouse controls
        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;
        
        const handleMouseControl = (event: MouseEvent) => {
          mouseX = (event.clientX - window.innerWidth / 2) / 100;
          mouseY = (event.clientY - window.innerHeight / 2) / 100;
        };
        document.addEventListener('mousemove', handleMouseControl);

        // Animation loop
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          
          // Camera movement
          targetX += (mouseX - targetX) * 0.05;
          targetY += (mouseY - targetY) * 0.05;
          
          camera.position.x = Math.sin(targetX * 0.5) * 15;
          camera.position.z = Math.cos(targetX * 0.5) * 15;
          camera.position.y = 5 + targetY;
          camera.lookAt(0, 0, 0);
          
          // Animate members
          memberObjects.forEach((obj) => {
            const time = Date.now() * 0.001;
            obj.position.y = Math.sin(time + obj.userData.floatOffset) * 0.3;
            obj.rotation.y += 0.005;
            
            // Pulse inner core
            if (obj.userData.core) {
              const scale = 1 + Math.sin(time * 3 + obj.userData.floatOffset) * 0.3;
              obj.userData.core.scale.setScalar(scale);
            }
          });
          
          // Rotate particles
          particles.rotation.y += 0.0001;
          
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
          document.removeEventListener('mousemove', handleMouseControl);
          
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

export default ThreeSceneGlass;