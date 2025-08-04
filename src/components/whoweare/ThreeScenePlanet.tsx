import React, { useEffect, useRef, useState } from 'react';
import { WhoWeAreMemberData } from '../../pages/WhoWeArePage';

interface ThreeScenePlanetProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

const ThreeScenePlanet: React.FC<ThreeScenePlanetProps> = ({ 
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
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(0, 5, 20);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls setup
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 10;
        controls.maxDistance = 50;
        controls.maxPolarAngle = Math.PI * 0.495;

        // Lighting - space-like
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        scene.add(ambientLight);

        // Sun light (central star)
        const sunLight = new THREE.PointLight(0xffddaa, 2, 100);
        sunLight.position.set(0, 0, 0);
        scene.add(sunLight);

        // Star field background
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 2000;
        const starPositions = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount * 3; i += 3) {
          const radius = 100 + Math.random() * 300;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          
          starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
          starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
          starPositions[i + 2] = radius * Math.cos(phi);
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.5,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
        });
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Central sun/core
        const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
          color: 0xffddaa
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        
        // Sun glow
        const sunGlowGeometry = new THREE.SphereGeometry(3, 32, 32);
        const sunGlowMaterial = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0xffddaa) }
          },
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 color;
            uniform float time;
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
              float pulse = sin(time * 2.0) * 0.1 + 0.9;
              gl_FragColor = vec4(color, intensity * pulse * 0.8);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide
        });
        const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
        sun.add(sunGlow);
        scene.add(sun);

        // Member planets
        const planetObjects: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Planet textures and features
        const createPlanetTexture = (member: WhoWeAreMemberData) => {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 256;
          const context = canvas.getContext('2d');
          
          if (context) {
            // Base planet color
            const gradient = context.createLinearGradient(0, 0, 512, 256);
            gradient.addColorStop(0, member.color);
            gradient.addColorStop(0.5, member.darkColor);
            gradient.addColorStop(1, member.color);
            context.fillStyle = gradient;
            context.fillRect(0, 0, 512, 256);
            
            // Add some surface features
            context.globalAlpha = 0.3;
            for (let i = 0; i < 20; i++) {
              const x = Math.random() * 512;
              const y = Math.random() * 256;
              const radius = Math.random() * 30 + 10;
              const featureGradient = context.createRadialGradient(x, y, 0, x, y, radius);
              featureGradient.addColorStop(0, member.darkColor);
              featureGradient.addColorStop(1, 'transparent');
              context.fillStyle = featureGradient;
              context.beginPath();
              context.arc(x, y, radius, 0, Math.PI * 2);
              context.fill();
            }
          }
          
          return new THREE.CanvasTexture(canvas);
        };

        members.forEach((member, index) => {
          const group = new THREE.Group();
          group.userData = member;
          
          // Orbit path
          const orbitRadius = 8 + index * 3;
          const orbitGeometry = new THREE.BufferGeometry();
          const orbitPoints = [];
          for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            orbitPoints.push(new THREE.Vector3(
              Math.cos(angle) * orbitRadius,
              0,
              Math.sin(angle) * orbitRadius
            ));
          }
          orbitGeometry.setFromPoints(orbitPoints);
          const orbitMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(member.color).multiplyScalar(0.3),
            transparent: true,
            opacity: 0.3
          });
          const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
          scene.add(orbit);
          
          // Planet
          const planetRadius = 0.8 + Math.random() * 0.4;
          const planetGeometry = new THREE.SphereGeometry(planetRadius, 32, 32);
          const planetMaterial = new THREE.MeshPhysicalMaterial({
            map: createPlanetTexture(member),
            metalness: 0.3,
            roughness: 0.7,
            clearcoat: 0.3,
            clearcoatRoughness: 0.4,
            emissive: new THREE.Color(member.color),
            emissiveIntensity: 0.1
          });
          const planet = new THREE.Mesh(planetGeometry, planetMaterial);
          planet.castShadow = true;
          planet.receiveShadow = true;
          
          // Planet atmosphere
          const atmosphereGeometry = new THREE.SphereGeometry(planetRadius * 1.15, 32, 32);
          const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
              color: { value: new THREE.Color(member.color) }
            },
            vertexShader: `
              varying vec3 vNormal;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform vec3 color;
              varying vec3 vNormal;
              void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(color, intensity * 0.5);
              }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
          });
          const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
          planet.add(atmosphere);
          
          // Planet ring (for some planets)
          if (Math.random() > 0.5) {
            const ringGeometry = new THREE.RingGeometry(
              planetRadius * 1.5,
              planetRadius * 2,
              64
            );
            const ringMaterial = new THREE.MeshBasicMaterial({
              color: new THREE.Color(member.color),
              transparent: true,
              opacity: 0.3,
              side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
            planet.add(ring);
          }
          
          // Initials label (as moon)
          const moonCanvas = document.createElement('canvas');
          const moonContext = moonCanvas.getContext('2d');
          moonCanvas.width = 128;
          moonCanvas.height = 128;
          
          if (moonContext) {
            moonContext.fillStyle = member.darkColor;
            moonContext.fillRect(0, 0, 128, 128);
            moonContext.font = 'bold 60px Arial';
            moonContext.fillStyle = '#ffffff';
            moonContext.textAlign = 'center';
            moonContext.textBaseline = 'middle';
            moonContext.fillText(member.initials, 64, 64);
          }
          
          const moonTexture = new THREE.CanvasTexture(moonCanvas);
          const moonGeometry = new THREE.SphereGeometry(0.3, 16, 16);
          const moonMaterial = new THREE.MeshBasicMaterial({
            map: moonTexture
          });
          const moon = new THREE.Mesh(moonGeometry, moonMaterial);
          moon.position.x = planetRadius * 1.5;
          planet.add(moon);
          
          group.add(planet);
          
          // Initial orbital position
          const angle = (index / members.length) * Math.PI * 2;
          group.position.set(
            Math.cos(angle) * orbitRadius,
            0,
            Math.sin(angle) * orbitRadius
          );
          
          // Store orbital data
          group.userData.orbitRadius = orbitRadius;
          group.userData.orbitSpeed = 0.1 / (index + 1);
          group.userData.orbitAngle = angle;
          group.userData.rotationSpeed = 0.01 + Math.random() * 0.01;
          group.userData.planet = planet;
          group.userData.moon = moon;
          
          scene.add(group);
          planetObjects.push(group);
        });

        // Mouse events
        const handleMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(planetObjects, true);
          
          // Reset all planets
          planetObjects.forEach(obj => {
            const planet = obj.userData.planet;
            if (planet) {
              planet.scale.setScalar(1);
            }
          });
          
          if (intersects.length > 0) {
            const hoveredGroup = intersects[0].object.parent?.parent || intersects[0].object.parent;
            if (hoveredGroup && hoveredGroup.userData.planet) {
              hoveredGroup.userData.planet.scale.setScalar(1.2);
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
            const clickedGroup = intersects[0].object.parent?.parent || intersects[0].object.parent;
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
        };
        window.addEventListener('resize', handleResize);

        // Animation loop
        const clock = new THREE.Clock();
        
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          
          const elapsedTime = clock.getElapsedTime();
          
          // Rotate sun
          sun.rotation.y = elapsedTime * 0.1;
          if (sunGlowMaterial.uniforms) {
            sunGlowMaterial.uniforms.time.value = elapsedTime;
          }
          
          // Animate planets
          planetObjects.forEach((group) => {
            // Orbital motion
            group.userData.orbitAngle += group.userData.orbitSpeed * 0.01;
            group.position.x = Math.cos(group.userData.orbitAngle) * group.userData.orbitRadius;
            group.position.z = Math.sin(group.userData.orbitAngle) * group.userData.orbitRadius;
            
            // Planet rotation
            if (group.userData.planet) {
              group.userData.planet.rotation.y += group.userData.rotationSpeed;
            }
            
            // Moon orbit
            if (group.userData.moon) {
              const moonAngle = elapsedTime * 2 + group.userData.orbitAngle;
              group.userData.moon.position.x = Math.cos(moonAngle) * 1.5;
              group.userData.moon.position.z = Math.sin(moonAngle) * 1.5;
            }
          });
          
          // Rotate star field slowly
          stars.rotation.y += 0.0001;
          
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

export default ThreeScenePlanet;