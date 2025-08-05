import React, { useEffect, useRef, useState } from 'react';
import { WhoWeAreMemberData } from '../../data/whoweareTeamMembers';

interface ThreeScenePlanetsIntuitiveProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

const ThreeScenePlanetsIntuitive: React.FC<ThreeScenePlanetsIntuitiveProps> = ({ 
  members, 
  onMemberSelect, 
  onLoadComplete, 
  onLoadError 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);
  const labelRendererRef = useRef<any>(null);
  const [isThreeLoaded, setIsThreeLoaded] = useState(false);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

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
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // CSS2D Renderer for labels
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.style.pointerEvents = 'none';
        mountRef.current.appendChild(labelRenderer.domElement);
        labelRendererRef.current = labelRenderer;

        // Controls setup
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 10;
        controls.maxDistance = 40;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);

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

        // Member planets
        const memberObjects: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Create a pulsing hint for the first planet
        let pulseLight: any = null;

        members.forEach((member, index) => {
          const group = new THREE.Group();
          group.userData = member;
          
          // Planet sphere with better visibility
          const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
          const sphereMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(member.color),
            emissive: new THREE.Color(member.color),
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.95
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.castShadow = true;
          group.add(sphere);
          
          // Inner glow
          const glowGeometry = new THREE.SphereGeometry(1.8, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.2
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          group.add(glow);
          
          // Profile initials on planet
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = 512;
          canvas.height = 512;
          
          if (context) {
            // Create circular gradient background
            const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
            gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            context.fillStyle = gradient;
            context.fillRect(0, 0, 512, 512);
            
            context.font = 'bold 180px Arial';
            context.fillStyle = '#ffffff';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(member.initials, 256, 256);
          }
          
          const texture = new THREE.CanvasTexture(canvas);
          const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
          });
          const sprite = new THREE.Sprite(spriteMaterial);
          sprite.scale.set(3, 3, 1);
          group.add(sprite);
          
          // HTML Label
          const labelDiv = document.createElement('div');
          labelDiv.className = 'planet-label';
          labelDiv.innerHTML = `
            <div class="planet-label-name">${member.name}</div>
            <div class="planet-label-role">${member.role}</div>
          `;
          labelDiv.style.cssText = `
            text-align: center;
            color: white;
            font-family: Arial, sans-serif;
            padding: 8px 16px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 4px;
            border: 1px solid ${member.color}30;
            transition: all 0.3s ease;
            cursor: pointer;
            pointer-events: auto;
          `;
          
          const label = new CSS2DObject(labelDiv);
          label.position.set(0, -2.5, 0);
          group.add(label);
          
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
          
          // Point light for each planet
          const light = new THREE.PointLight(new THREE.Color(member.color), 0.8, 10);
          light.position.copy(group.position);
          scene.add(light);
          
          // Add pulse effect to first planet
          if (index === 0) {
            pulseLight = new THREE.PointLight(0xffffff, 0, 15);
            pulseLight.position.copy(group.position);
            scene.add(pulseLight);
          }
          
          scene.add(group);
          memberObjects.push(group);
          
          // Add click handler to label
          labelDiv.addEventListener('click', () => {
            onMemberSelect(member);
          });
        });

        // Mouse events
        const handleMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(memberObjects, true);
          
          memberObjects.forEach(obj => {
            obj.scale.set(1, 1, 1);
            const label = obj.children.find((child: any) => child.isCSS2DObject) as any;
            if (label && label.element) {
              label.element.style.transform = 'scale(1)';
              label.element.style.opacity = '0.8';
            }
          });
          
          if (intersects.length > 0) {
            const hoveredObject = intersects[0].object.parent;
            if (hoveredObject) {
              hoveredObject.scale.set(1.2, 1.2, 1.2);
              const label = hoveredObject.children.find((child: any) => child.isCSS2DObject) as any;
              if (label && label.element) {
                label.element.style.transform = 'scale(1.1)';
                label.element.style.opacity = '1';
              }
              setHoveredMember(hoveredObject.userData.id);
            }
            document.body.style.cursor = 'pointer';
          } else {
            setHoveredMember(null);
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
          labelRenderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Animation loop
        let pulseTime = 0;
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          pulseTime += 0.05;
          
          // Animate member planets
          memberObjects.forEach((obj, index) => {
            // Gentle floating motion
            const floatY = Math.sin(Date.now() * 0.001 * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.3;
            obj.position.y = obj.userData.originalY + floatY;
            
            // Gentle rotation
            obj.rotation.y += obj.userData.rotationSpeed;
            
            // Pulse effect for first planet
            if (index === 0 && pulseLight) {
              pulseLight.intensity = Math.sin(pulseTime) * 0.5 + 0.5;
              pulseLight.position.y = obj.position.y;
            }
          });
          
          // Very subtle star field rotation
          particles.rotation.y += 0.00001;
          
          controls.update();
          renderer.render(scene, camera);
          labelRenderer.render(scene, camera);
        };

        animate();
        onLoadComplete();

        // Remove pulse after first interaction
        setTimeout(() => {
          if (pulseLight) {
            scene.remove(pulseLight);
          }
        }, 8000);

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
  }, [members, onMemberSelect, onLoadComplete, onLoadError]);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ThreeScenePlanetsIntuitive;