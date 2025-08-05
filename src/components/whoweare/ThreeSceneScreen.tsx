import React, { useEffect, useRef, useState } from 'react';
import { WhoWeAreMemberData } from '../../data/whoweareTeamMembers';

interface ThreeSceneScreenProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

const ThreeSceneScreen: React.FC<ThreeSceneScreenProps> = ({ 
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

        // Create screen content
        const createScreenContent = (member: WhoWeAreMemberData) => {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 384;
          const context = canvas.getContext('2d');
          
          if (context) {
            // Background gradient
            const bgGradient = context.createLinearGradient(0, 0, 0, 384);
            bgGradient.addColorStop(0, '#000000');
            bgGradient.addColorStop(1, '#0a0a0a');
            context.fillStyle = bgGradient;
            context.fillRect(0, 0, 512, 384);
            
            // Border glow
            context.strokeStyle = member.color;
            context.lineWidth = 2;
            context.strokeRect(1, 1, 510, 382);
            
            // Profile section
            const profileGradient = context.createLinearGradient(0, 0, 512, 150);
            profileGradient.addColorStop(0, member.color + '40');
            profileGradient.addColorStop(1, 'transparent');
            context.fillStyle = profileGradient;
            context.fillRect(0, 0, 512, 150);
            
            // Initials
            context.font = 'bold 80px Arial';
            context.fillStyle = member.color;
            context.textAlign = 'center';
            context.fillText(member.initials, 256, 100);
            
            // Name
            context.font = 'bold 24px Arial';
            context.fillStyle = '#ffffff';
            context.fillText(member.name, 256, 200);
            
            // Role
            context.font = '18px Arial';
            context.fillStyle = member.color;
            context.fillText(member.role, 256, 235);
            
            // Code/activity lines
            context.font = '12px monospace';
            context.fillStyle = '#666666';
            context.textAlign = 'left';
            const codeLines = [
              '> ' + member.role.toLowerCase().replace(' ', '_') + '.initialize()',
              '> loading skills...',
              '> status: active',
              '> contribution_level: high'
            ];
            codeLines.forEach((line, i) => {
              context.fillText(line, 30, 290 + i * 20);
            });
          }
          
          return new THREE.CanvasTexture(canvas);
        };

        // Member screens
        const screenObjects: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        members.forEach((member) => {
          const group = new THREE.Group();
          group.userData = member;
          
          // Screen stand/base
          const standGeometry = new THREE.CylinderGeometry(0.8, 1, 0.5, 32);
          const standMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a2a2a,
            emissive: new THREE.Color(member.color),
            emissiveIntensity: 0.05
          });
          const stand = new THREE.Mesh(standGeometry, standMaterial);
          stand.castShadow = true;
          stand.receiveShadow = true;
          group.add(stand);
          
          // Screen frame
          const frameGeometry = new THREE.BoxGeometry(3.2, 2.4, 0.1);
          const frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            emissive: 0x0a0a0a,
            shininess: 100
          });
          const frame = new THREE.Mesh(frameGeometry, frameMaterial);
          frame.position.y = 2;
          frame.castShadow = true;
          group.add(frame);
          
          // Screen display
          const screenGeometry = new THREE.PlaneGeometry(3, 2.25);
          const screenMaterial = new THREE.MeshBasicMaterial({
            map: createScreenContent(member)
          });
          const screen = new THREE.Mesh(screenGeometry, screenMaterial);
          screen.position.y = 2;
          screen.position.z = 0.06;
          group.add(screen);
          
          // Screen glow
          const glowGeometry = new THREE.PlaneGeometry(3.4, 2.6);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          glow.position.y = 2;
          glow.position.z = -0.05;
          group.add(glow);
          
          // Power LED
          const ledGeometry = new THREE.CircleGeometry(0.05, 16);
          const ledMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color)
          });
          const led = new THREE.Mesh(ledGeometry, ledMaterial);
          led.position.set(0, 0.8, 0.06);
          group.add(led);
          
          // Position
          group.position.set(member.position.x, 0, member.position.z);
          group.userData.floatOffset = Math.random() * Math.PI * 2;
          group.userData.screen = screen;
          group.userData.glow = glow;
          group.userData.led = led;
          
          // Screen light
          const screenLight = new THREE.PointLight(new THREE.Color(member.color), 0.3, 5);
          screenLight.position.set(member.position.x, 2, member.position.z + 1);
          scene.add(screenLight);
          
          scene.add(group);
          screenObjects.push(group);
        });

        // Mouse events
        const handleMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(screenObjects, true);
          
          // Reset all screens
          screenObjects.forEach(obj => {
            obj.scale.set(1, 1, 1);
            if (obj.userData.glow) {
              obj.userData.glow.material.opacity = 0.1;
            }
          });
          
          if (intersects.length > 0) {
            const hoveredObject = intersects[0].object.parent;
            if (hoveredObject && hoveredObject.userData.id) {
              hoveredObject.scale.set(1.05, 1.05, 1.05);
              if (hoveredObject.userData.glow) {
                hoveredObject.userData.glow.material.opacity = 0.3;
              }
              document.body.style.cursor = 'pointer';
            }
          } else {
            document.body.style.cursor = 'default';
          }
        };

        const handleClick = () => {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(screenObjects, true);
          
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
          
          // Animate screens
          screenObjects.forEach((obj) => {
            const time = Date.now() * 0.001;
            // Gentle floating
            obj.position.y = Math.sin(time + obj.userData.floatOffset) * 0.1;
            // Slight rotation
            obj.rotation.y = Math.sin(time * 0.5 + obj.userData.floatOffset) * 0.05;
            
            // LED pulse
            if (obj.userData.led) {
              const pulse = Math.sin(time * 3 + obj.userData.floatOffset) * 0.5 + 0.5;
              obj.userData.led.material.opacity = 0.5 + pulse * 0.5;
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

export default ThreeSceneScreen;