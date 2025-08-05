import React, { useEffect, useRef, useState } from 'react';

// Define member data interface directly in this component
export interface ThreeSceneEnhancedMemberData {
  id: string;
  name: string;
  initials: string;
  role: string;
  quote: string;
  story: string;
  color: string;
  position: { x: number; y: number; z: number };
  techStack: string[];
}

interface ThreeSceneEnhancedProps {
  members: ThreeSceneEnhancedMemberData[];
  onMemberSelect: (member: ThreeSceneEnhancedMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

// Enhanced member data with workspace info
interface EnhancedMemberData extends ThreeSceneEnhancedMemberData {
  workspace?: {
    screens: string[];
    tools: string[];
    activity: string;
  };
}

const ThreeSceneEnhanced: React.FC<ThreeSceneEnhancedProps> = ({ 
  members, 
  onMemberSelect, 
  onLoadComplete, 
  onLoadError 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);
  const connectionsRef = useRef<any[]>([]);

  // Enhanced member data
  const enhancedMembers: EnhancedMemberData[] = members.map(member => ({
    ...member,
    workspace: {
      screens: getScreensForRole(member.role),
      tools: getToolsForRole(member.role),
      activity: getActivityForMember(member.id)
    }
  }));

  function getScreensForRole(role: string): string[] {
    const screens: { [key: string]: string[] } = {
      'Product Architect': ['Architecture Diagram', 'Service Mesh', 'Metrics Dashboard'],
      'System Engineer': ['Code Editor', 'Terminal', 'System Monitor'],
      'Experience Designer': ['Figma', 'User Flow', 'Component Library'],
      'Connection Engineer': ['Data Pipeline', 'Query Builder', 'Analytics'],
      'Growth Path Builder': ['Community Dashboard', 'Growth Metrics', 'Member Map'],
      'Platform Engineer': ['Cloud Console', 'CI/CD Pipeline', 'Infrastructure']
    };
    return screens[role] || ['Dashboard', 'Editor', 'Terminal'];
  }

  function getToolsForRole(role: string): string[] {
    const tools: { [key: string]: string[] } = {
      'Product Architect': ['MSA', 'React', 'AWS'],
      'System Engineer': ['Spring', 'Docker', 'K8s'],
      'Experience Designer': ['Three.js', 'GSAP', 'CSS'],
      'Connection Engineer': ['Kafka', 'GraphQL', 'Redis'],
      'Growth Path Builder': ['Analytics', 'Discord', 'Notion'],
      'Platform Engineer': ['Terraform', 'Jenkins', 'Prometheus']
    };
    return tools[role] || ['Code', 'Git', 'VSCode'];
  }

  function getActivityForMember(id: string): string {
    const activities: { [key: string]: string } = {
      'rene-choi': 'Designing new microservice',
      'jinwoo-cho': 'Optimizing API performance',
      'mihyun-park': 'Creating 3D interactions',
      'geon-lee': 'Building data pipeline',
      'jiyeon-kim': 'Planning community event',
      'dongmin-cha': 'Deploying infrastructure'
    };
    return activities[id] || 'Working on AsyncSite';
  }

  useEffect(() => {
    let mounted = true;

    const initThree = async () => {
      try {
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
        const { CSS2DRenderer, CSS2DObject } = await import('three/examples/jsm/renderers/CSS2DRenderer');
        
        if (!mounted || !mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.Fog(0x000000, 10, 100);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(0, 8, 20);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // CSS2D Renderer for labels
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.style.pointerEvents = 'none';
        mountRef.current.appendChild(labelRenderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 10;
        controls.maxDistance = 50;
        controls.maxPolarAngle = Math.PI * 0.495;
        controls.enablePan = false;

        // Enhanced lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);

        // Central light source (AsyncSite core)
        const coreLight = new THREE.PointLight(0xC3E88D, 2, 100);
        coreLight.position.set(0, 5, 0);
        scene.add(coreLight);

        // Rim lighting for depth
        const rimLight1 = new THREE.DirectionalLight(0x6366f1, 0.5);
        rimLight1.position.set(10, 10, 10);
        scene.add(rimLight1);

        const rimLight2 = new THREE.DirectionalLight(0xf87171, 0.3);
        rimLight2.position.set(-10, 10, -10);
        scene.add(rimLight2);

        // Floor with reflections
        const floorGeometry = new THREE.CircleGeometry(50, 64);
        const floorMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x0a0a0a,
          metalness: 0.8,
          roughness: 0.2,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Central hologram (AsyncSite logo/core)
        const createCentralCore = () => {
          const coreGroup = new THREE.Group();
          
          // Core geometry
          const coreGeometry = new THREE.OctahedronGeometry(1, 2);
          const coreMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xC3E88D,
            emissive: 0xC3E88D,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.1,
            transparent: true,
            opacity: 0.9,
          });
          const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
          coreGroup.add(coreMesh);

          // Outer rings
          for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(2 + i * 0.5, 0.05, 16, 100);
            const ringMaterial = new THREE.MeshBasicMaterial({
              color: 0x82aaff,
              transparent: true,
              opacity: 0.3 - i * 0.1
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2 + i * 0.2;
            ring.rotation.z = i * 0.5;
            coreGroup.add(ring);
          }

          coreGroup.position.y = 2;
          return coreGroup;
        };

        const centralCore = createCentralCore();
        scene.add(centralCore);

        // Enhanced particles with code snippets
        const createCodeParticles = () => {
          const codeSnippets = [
            'async', 'await', 'function', 'const', 'class', 'interface',
            'React', 'Spring', 'Docker', 'AWS', '<Component />', '{ code }',
            'git push', 'npm run', 'build()', 'deploy()', '.then()', 'useState'
          ];

          const particlesGroup = new THREE.Group();
          
          codeSnippets.forEach((snippet, i) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 64;
            
            if (context) {
              context.font = '20px "Fira Code", monospace';
              context.fillStyle = '#C3E88D';
              context.textAlign = 'center';
              context.fillText(snippet, 64, 32);
            }
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({
              map: texture,
              transparent: true,
              opacity: 0.3
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            
            const angle = (i / codeSnippets.length) * Math.PI * 2;
            const radius = 15 + Math.random() * 10;
            sprite.position.set(
              Math.cos(angle) * radius,
              Math.random() * 10 - 2,
              Math.sin(angle) * radius
            );
            sprite.scale.set(2, 1, 1);
            
            particlesGroup.add(sprite);
          });
          
          return particlesGroup;
        };

        const codeParticles = createCodeParticles();
        scene.add(codeParticles);

        // Member workstations
        const memberObjects: any[] = [];
        const workstations: any[] = [];

        enhancedMembers.forEach((member, index) => {
          const group = new THREE.Group();
          group.userData = member;
          
          // Workstation platform
          const platformGeometry = new THREE.BoxGeometry(3, 0.2, 3);
          const platformMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a1a,
            metalness: 0.7,
            roughness: 0.3,
            emissive: new THREE.Color(member.color),
            emissiveIntensity: 0.05
          });
          const platform = new THREE.Mesh(platformGeometry, platformMaterial);
          platform.castShadow = true;
          platform.receiveShadow = true;
          group.add(platform);
          
          // Member avatar (holographic)
          const avatarGroup = new THREE.Group();
          
          // Avatar base
          const avatarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 8);
          const avatarMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(member.color),
            emissive: new THREE.Color(member.color),
            emissiveIntensity: 0.3,
            metalness: 0.5,
            roughness: 0.2,
            transparent: true,
            opacity: 0.8,
          });
          const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
          avatar.position.y = 1.5;
          avatar.castShadow = true;
          avatarGroup.add(avatar);
          
          // Holographic effect
          const holoGeometry = new THREE.CylinderGeometry(1, 1, 2.2, 8);
          const holoMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.1,
            wireframe: true
          });
          const holo = new THREE.Mesh(holoGeometry, holoMaterial);
          holo.position.y = 1.5;
          avatarGroup.add(holo);
          
          group.add(avatarGroup);
          
          // Floating screens around workstation
          member.workspace?.screens.forEach((screenName, screenIndex) => {
            const screenGroup = new THREE.Group();
            
            // Screen
            const screenGeometry = new THREE.PlaneGeometry(1.5, 1);
            const screenMaterial = new THREE.MeshPhysicalMaterial({
              color: 0x000000,
              emissive: new THREE.Color(member.color),
              emissiveIntensity: 0.2,
              metalness: 1,
              roughness: 0,
              transparent: true,
              opacity: 0.8
            });
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            
            // Screen content
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 128;
            
            if (context) {
              context.fillStyle = 'rgba(0,0,0,0.8)';
              context.fillRect(0, 0, 256, 128);
              
              context.strokeStyle = member.color;
              context.lineWidth = 2;
              context.strokeRect(5, 5, 246, 118);
              
              context.font = '16px "Fira Code", monospace';
              context.fillStyle = member.color;
              context.textAlign = 'center';
              context.fillText(screenName, 128, 64);
            }
            
            const screenTexture = new THREE.CanvasTexture(canvas);
            screenMaterial.map = screenTexture;
            
            const angle = (screenIndex / 3) * Math.PI * 2 - Math.PI / 2;
            screenGroup.add(screen);
            screenGroup.position.set(
              Math.cos(angle) * 2,
              3 + screenIndex * 0.3,
              Math.sin(angle) * 2
            );
            screenGroup.rotation.y = -angle + Math.PI / 2;
            
            group.add(screenGroup);
          });
          
          // CSS2D Label
          const labelDiv = document.createElement('div');
          labelDiv.className = 'whoweare-enhanced-label';
          labelDiv.innerHTML = `
            <div style="color: ${member.color}; font-weight: bold;">${member.name}</div>
            <div style="font-size: 0.8em; opacity: 0.8;">${member.role}</div>
            <div style="font-size: 0.7em; opacity: 0.6; color: #82aaff;">${member.workspace?.activity}</div>
          `;
          labelDiv.style.cssText = `
            font-family: 'Pretendard', sans-serif;
            text-align: center;
            color: white;
            padding: 8px 16px;
            background: rgba(0,0,0,0.8);
            border-radius: 8px;
            border: 1px solid ${member.color}40;
            backdrop-filter: blur(10px);
          `;
          
          const label = new CSS2DObject(labelDiv);
          label.position.set(0, -1, 0);
          group.add(label);
          
          // Position workstation
          const angle = (index / enhancedMembers.length) * Math.PI * 2;
          const radius = 10;
          group.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
          );
          group.rotation.y = -angle;
          
          group.userData.floatOffset = Math.random() * Math.PI * 2;
          group.userData.baseY = group.position.y;
          
          scene.add(group);
          memberObjects.push(group);
          workstations.push({ group, avatarGroup, member });
        });

        // Dynamic connections between members
        const createConnections = () => {
          const connectionMaterial = new THREE.LineBasicMaterial({
            color: 0x82aaff,
            transparent: true,
            opacity: 0.3,
            linewidth: 2
          });

          // Create connections based on collaboration
          const collaborations = [
            ['rene-choi', 'jinwoo-cho'], // Architecture & System
            ['mihyun-park', 'geon-lee'], // Design & Data
            ['jiyeon-kim', 'dongmin-cha'], // Community & Platform
            ['rene-choi', 'mihyun-park'], // Product & Design
          ];

          collaborations.forEach(([id1, id2]) => {
            const member1 = workstations.find(w => w.member.id === id1);
            const member2 = workstations.find(w => w.member.id === id2);
            
            if (member1 && member2) {
              const points = [];
              points.push(member1.group.position);
              
              // Create curved connection
              const midPoint = new THREE.Vector3()
                .addVectors(member1.group.position, member2.group.position)
                .multiplyScalar(0.5);
              midPoint.y = 5;
              points.push(midPoint);
              
              points.push(member2.group.position);
              
              const curve = new THREE.CatmullRomCurve3(points);
              const curvePoints = curve.getPoints(50);
              const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
              const connection = new THREE.Line(geometry, connectionMaterial);
              
              connectionsRef.current.push({
                line: connection,
                member1: member1.member,
                member2: member2.member
              });
              
              scene.add(connection);
            }
          });
        };

        createConnections();

        // Mouse interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(memberObjects, true);
          
          // Reset all workstations
          workstations.forEach(ws => {
            ws.group.scale.setScalar(1);
            ws.avatarGroup.rotation.y = 0;
          });
          
          // Highlight connections
          connectionsRef.current.forEach(conn => {
            conn.line.material.opacity = 0.1;
          });
          
          if (intersects.length > 0) {
            const hoveredObject = intersects[0].object.parent;
            if (hoveredObject) {
              hoveredObject.scale.setScalar(1.1);
              
              // Highlight related connections
              const hoveredMember = hoveredObject.userData;
              connectionsRef.current.forEach(conn => {
                if (conn.member1.id === hoveredMember.id || conn.member2.id === hoveredMember.id) {
                  conn.line.material.opacity = 0.8;
                  conn.line.material.color = new THREE.Color(hoveredMember.color);
                }
              });
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
            const clickedMember = intersects[0].object.parent.userData as ThreeSceneEnhancedMemberData;
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
        const clock = new THREE.Clock();
        
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          
          const elapsedTime = clock.getElapsedTime();
          
          // Rotate central core
          centralCore.rotation.y = elapsedTime * 0.5;
          centralCore.children.forEach((child, i) => {
            if (child.type === 'Mesh') {
              const mesh = child as any;
              if (mesh.geometry && mesh.geometry.type === 'TorusGeometry') {
                child.rotation.z = elapsedTime * (0.5 + i * 0.1);
              }
            }
          });
          
          // Animate workstations
          workstations.forEach((ws, i) => {
            // Floating animation
            ws.group.position.y = ws.group.userData.baseY + 
              Math.sin(elapsedTime + ws.group.userData.floatOffset) * 0.2;
            
            // Rotate avatars
            ws.avatarGroup.rotation.y = elapsedTime * 0.5;
            
            // Animate screens
            ws.group.children.forEach((child: any, ci: number) => {
              if (child.type === 'Group' && child.children[0]?.geometry?.type === 'PlaneGeometry') {
                child.position.y = 3 + ci * 0.3 + Math.sin(elapsedTime * 2 + ci) * 0.1;
              }
            });
          });
          
          // Animate code particles
          codeParticles.rotation.y = elapsedTime * 0.05;
          codeParticles.children.forEach((particle, i) => {
            particle.position.y += Math.sin(elapsedTime + i) * 0.01;
            const sprite = particle as any;
            if (sprite.material) {
              sprite.material.opacity = 0.3 + Math.sin(elapsedTime * 2 + i) * 0.1;
            }
          });
          
          // Pulse connections
          connectionsRef.current.forEach((conn, i) => {
            const pulse = Math.sin(elapsedTime * 2 + i) * 0.5 + 0.5;
            conn.line.material.opacity = conn.line.material.opacity * 0.9 + pulse * 0.1;
          });
          
          controls.update();
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
          
          if (mountRef.current) {
            if (renderer.domElement) {
              mountRef.current.removeChild(renderer.domElement);
            }
            if (labelRenderer.domElement) {
              mountRef.current.removeChild(labelRenderer.domElement);
            }
          }
          
          renderer.dispose();
          controls.dispose();
          
          scene.traverse((object: any) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((material: any) => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          });
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
  }, [enhancedMembers, onMemberSelect, onLoadComplete, onLoadError]);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ThreeSceneEnhanced;