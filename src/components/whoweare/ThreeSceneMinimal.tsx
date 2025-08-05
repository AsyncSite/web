import React, { useEffect, useRef, useState } from 'react';
import { WhoWeAreMemberData } from '../../data/whoweareTeamMembers';

interface ThreeSceneMinimalProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

const ThreeSceneMinimal: React.FC<ThreeSceneMinimalProps> = ({ 
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
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls setup
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 30;
        controls.maxPolarAngle = Math.PI * 0.495;

        // Lighting - softer and more atmospheric
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);

        // Central soft light
        const centerLight = new THREE.PointLight(0xffffff, 0.5, 100);
        centerLight.position.set(0, 10, 0);
        scene.add(centerLight);

        // Rim lights for depth
        const rimLight1 = new THREE.PointLight(0x6366f1, 0.3, 50);
        rimLight1.position.set(15, 5, 15);
        scene.add(rimLight1);

        const rimLight2 = new THREE.PointLight(0xC3E88D, 0.3, 50);
        rimLight2.position.set(-15, 5, -15);
        scene.add(rimLight2);

        // Floor - subtle and minimal
        const floorGeometry = new THREE.CircleGeometry(50, 64);
        const floorMaterial = new THREE.MeshStandardMaterial({
          color: 0x0a0a0a,
          metalness: 0.8,
          roughness: 0.2,
          transparent: true,
          opacity: 0.5
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Grid - very subtle
        const gridHelper = new THREE.GridHelper(30, 30, 0x222222, 0x111111);
        gridHelper.position.y = -1.99;
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Particles - refined
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 40;
          positions[i + 1] = Math.random() * 20 - 2;
          positions[i + 2] = (Math.random() - 0.5) * 40;
          
          // Soft color variation
          const intensity = Math.random() * 0.5 + 0.5;
          colors[i] = intensity;
          colors[i + 1] = intensity * 0.9;
          colors[i + 2] = intensity * 0.8;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
          size: 0.05,
          transparent: true,
          opacity: 0.6,
          vertexColors: true,
          blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        // Member objects - refined human-like forms
        const memberObjects: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        members.forEach((member) => {
          const group = new THREE.Group();
          group.userData = member;
          
          // Platform - more subtle
          const platformGeometry = new THREE.CylinderGeometry(1.2, 1.5, 0.2, 32);
          const platformMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.1,
            clearcoat: 1,
            clearcoatRoughness: 0,
            transparent: true,
            opacity: 0.8
          });
          const platform = new THREE.Mesh(platformGeometry, platformMaterial);
          platform.castShadow = true;
          platform.receiveShadow = true;
          group.add(platform);
          
          // Create abstract human form
          const humanGroup = new THREE.Group();
          
          // Core body - elongated capsule shape
          const bodyGeometry = new THREE.CapsuleGeometry(0.6, 1.8, 16, 32);
          const bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(member.color),
            emissive: new THREE.Color(member.color),
            emissiveIntensity: 0.2,
            metalness: 0.5,
            roughness: 0.3,
            transparent: true,
            opacity: 0.9,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
            transmission: 0.1,
            thickness: 0.5,
            ior: 1.5
          });
          const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
          body.position.y = 1.5;
          body.castShadow = true;
          humanGroup.add(body);
          
          // Inner glow - subtle energy core
          const coreGeometry = new THREE.IcosahedronGeometry(0.3, 2);
          const coreMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
          });
          const core = new THREE.Mesh(coreGeometry, coreMaterial);
          core.position.y = 1.8;
          humanGroup.add(core);
          
          // Outer aura - very subtle
          const auraGeometry = new THREE.SphereGeometry(1.2, 32, 32);
          const auraMaterial = new THREE.ShaderMaterial({
            uniforms: {
              color: { value: new THREE.Color(member.color) },
              time: { value: 0 }
            },
            vertexShader: `
              varying vec3 vNormal;
              varying vec3 vPosition;
              uniform float time;
              
              void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                
                vec3 pos = position;
                float noise = sin(pos.x * 10.0 + time) * 0.02;
                pos += normal * noise;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              }
            `,
            fragmentShader: `
              varying vec3 vNormal;
              varying vec3 vPosition;
              uniform vec3 color;
              
              void main() {
                float intensity = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(color, intensity * 0.2);
              }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
          });
          const aura = new THREE.Mesh(auraGeometry, auraMaterial);
          aura.position.y = 1.5;
          aura.scale.set(1.5, 2, 1.5);
          humanGroup.add(aura);
          
          // Small orbiting light points
          const orbitGroup = new THREE.Group();
          for (let i = 0; i < 3; i++) {
            const orbitGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const orbitMaterial = new THREE.MeshBasicMaterial({
              color: new THREE.Color(member.color),
              transparent: true,
              opacity: 0.8
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            const angle = (i / 3) * Math.PI * 2;
            orbit.position.set(
              Math.cos(angle) * 0.8,
              0,
              Math.sin(angle) * 0.8
            );
            orbit.userData = { angle, radius: 0.8, speed: 1 + i * 0.3 };
            orbitGroup.add(orbit);
          }
          orbitGroup.position.y = 1.5;
          humanGroup.add(orbitGroup);
          
          group.add(humanGroup);
          
          // Store refs for animation
          group.userData.humanGroup = humanGroup;
          group.userData.core = core;
          group.userData.aura = aura;
          group.userData.orbitGroup = orbitGroup;
          group.userData.auraMaterial = auraMaterial;
          
          // Position
          group.position.set(member.position.x, 0, member.position.z);
          group.userData.floatOffset = Math.random() * Math.PI * 2;
          group.userData.baseY = 0;
          
          // Subtle personal light
          const personalLight = new THREE.PointLight(new THREE.Color(member.color), 0.3, 5);
          personalLight.position.set(member.position.x, 3, member.position.z);
          scene.add(personalLight);
          
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
            const scale = obj.scale.x;
            const targetScale = 1;
            obj.scale.setScalar(scale + (targetScale - scale) * 0.1);
          });
          
          if (intersects.length > 0) {
            const hoveredObject = intersects[0].object.parent?.parent;
            if (hoveredObject && hoveredObject.userData.id) {
              hoveredObject.scale.setScalar(1.1);
              document.body.style.cursor = 'pointer';
            }
          } else {
            document.body.style.cursor = 'default';
          }
        };

        const handleClick = () => {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(memberObjects, true);
          
          if (intersects.length > 0 && intersects[0].object.parent?.parent) {
            const clickedMember = intersects[0].object.parent.parent.userData as WhoWeAreMemberData;
            if (clickedMember.id) {
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
        };
        window.addEventListener('resize', handleResize);

        // Mouse controls for camera movement
        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;
        
        const handleMouseControl = (event: MouseEvent) => {
          mouseX = (event.clientX - window.innerWidth / 2) / 100;
          mouseY = (event.clientY - window.innerHeight / 2) / 100;
        };
        document.addEventListener('mousemove', handleMouseControl);

        // Animation loop
        const clock = new THREE.Clock();
        
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          
          const elapsedTime = clock.getElapsedTime();
          
          // Camera movement - subtle
          targetX += (mouseX - targetX) * 0.02;
          targetY += (mouseY - targetY) * 0.02;
          
          camera.position.x = Math.sin(targetX * 0.5) * 15;
          camera.position.z = Math.cos(targetX * 0.5) * 15;
          camera.position.y = 5 + targetY;
          camera.lookAt(0, 0, 0);
          
          // Animate members
          memberObjects.forEach((obj) => {
            // Floating animation
            obj.position.y = obj.userData.baseY + Math.sin(elapsedTime + obj.userData.floatOffset) * 0.2;
            
            // Rotate human form slowly
            if (obj.userData.humanGroup) {
              obj.userData.humanGroup.rotation.y = elapsedTime * 0.1;
            }
            
            // Pulse core
            if (obj.userData.core) {
              const scale = 1 + Math.sin(elapsedTime * 2 + obj.userData.floatOffset) * 0.1;
              obj.userData.core.scale.setScalar(scale);
            }
            
            // Update aura shader
            if (obj.userData.auraMaterial) {
              obj.userData.auraMaterial.uniforms.time.value = elapsedTime;
            }
            
            // Orbit small lights
            if (obj.userData.orbitGroup) {
              obj.userData.orbitGroup.children.forEach((orbit: any) => {
                const angle = orbit.userData.angle + elapsedTime * orbit.userData.speed;
                orbit.position.x = Math.cos(angle) * orbit.userData.radius;
                orbit.position.z = Math.sin(angle) * orbit.userData.radius;
                orbit.position.y = Math.sin(elapsedTime * 2 + angle) * 0.2;
              });
            }
          });
          
          // Rotate particles slowly
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

export default ThreeSceneMinimal;