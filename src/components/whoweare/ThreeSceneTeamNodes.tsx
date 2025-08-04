import React, { useEffect, useRef, useState } from 'react';
import { WhoWeAreMemberData } from '../../pages/WhoWeArePage';

interface ThreeSceneTeamNodesProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

const ThreeSceneTeamNodes: React.FC<ThreeSceneTeamNodesProps> = ({ 
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
        scene.background = new THREE.Color(0x0a0a0a);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(0, 10, 20);

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
        controls.minDistance = 10;
        controls.maxDistance = 40;
        controls.maxPolarAngle = Math.PI * 0.495;

        // Lighting - professional and clean
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 0.5);
        mainLight.position.set(10, 20, 10);
        mainLight.castShadow = true;
        scene.add(mainLight);

        // Ground plane with grid
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshPhongMaterial({
          color: 0x1a1a1a,
          emissive: 0x0a0a0a
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Subtle grid
        const gridHelper = new THREE.GridHelper(50, 25, 0x2a2a2a, 0x1a1a1a);
        gridHelper.position.y = -1.99;
        scene.add(gridHelper);

        // Central AsyncSite hub/core
        const coreGroup = new THREE.Group();
        
        // Core geometry - octahedron for a tech feel
        const coreGeometry = new THREE.OctahedronGeometry(2, 1);
        const coreMaterial = new THREE.MeshPhongMaterial({
          color: 0x6366f1,
          emissive: 0x6366f1,
          emissiveIntensity: 0.2,
          transparent: true,
          opacity: 0.8
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        coreGroup.add(core);

        // Core wireframe
        const coreWireframeGeometry = new THREE.OctahedronGeometry(2.1, 1);
        const coreWireframeMaterial = new THREE.MeshBasicMaterial({
          color: 0x6366f1,
          wireframe: true,
          transparent: true,
          opacity: 0.3
        });
        const coreWireframe = new THREE.Mesh(coreWireframeGeometry, coreWireframeMaterial);
        coreGroup.add(coreWireframe);

        // Add AsyncSite text
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        if (context) {
          context.fillStyle = 'rgba(0,0,0,0)';
          context.fillRect(0, 0, 512, 128);
          context.font = 'bold 48px Arial';
          context.fillStyle = '#ffffff';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText('ASYNCSITE', 256, 64);
        }
        
        const textTexture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.SpriteMaterial({
          map: textTexture,
          transparent: true
        });
        const textSprite = new THREE.Sprite(textMaterial);
        textSprite.scale.set(4, 1, 1);
        textSprite.position.y = 3;
        coreGroup.add(textSprite);

        scene.add(coreGroup);

        // Member nodes
        const nodeObjects: any[] = [];
        const connections: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Create role-based node texture
        const createNodeContent = (member: WhoWeAreMemberData) => {
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 256;
          const context = canvas.getContext('2d');
          
          if (context) {
            // Background with gradient
            const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
            gradient.addColorStop(0, member.color + '40');
            gradient.addColorStop(0.7, member.darkColor + '20');
            gradient.addColorStop(1, 'transparent');
            context.fillStyle = gradient;
            context.fillRect(0, 0, 256, 256);
            
            // Border ring
            context.beginPath();
            context.arc(128, 128, 120, 0, Math.PI * 2);
            context.strokeStyle = member.color;
            context.lineWidth = 3;
            context.stroke();
            
            // Initials
            context.font = 'bold 72px Arial';
            context.fillStyle = member.color;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(member.initials, 128, 100);
            
            // Role
            context.font = '16px Arial';
            context.fillStyle = '#ffffff';
            context.fillText(member.role.toUpperCase(), 128, 160);
          }
          
          return new THREE.CanvasTexture(canvas);
        };

        // Position members in a circular pattern
        const radius = 12;
        members.forEach((member, index) => {
          const angle = (index / members.length) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          const nodeGroup = new THREE.Group();
          nodeGroup.userData = member;
          
          // Node base - smaller planet-like sphere
          const nodeGeometry = new THREE.SphereGeometry(1.5, 32, 32);
          const nodeMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(member.darkColor),
            metalness: 0.3,
            roughness: 0.4,
            clearcoat: 0.3,
            clearcoatRoughness: 0.1,
            emissive: new THREE.Color(member.color),
            emissiveIntensity: 0.1
          });
          const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
          node.castShadow = true;
          node.receiveShadow = true;
          nodeGroup.add(node);
          
          // Node info display
          const displayGeometry = new THREE.PlaneGeometry(3, 3);
          const displayMaterial = new THREE.MeshBasicMaterial({
            map: createNodeContent(member),
            transparent: true,
            side: THREE.DoubleSide
          });
          const display = new THREE.Mesh(displayGeometry, displayMaterial);
          display.position.y = 3;
          // Make display always face camera
          display.lookAt(camera.position);
          nodeGroup.add(display);
          
          // Glowing ring around node
          const ringGeometry = new THREE.TorusGeometry(2, 0.1, 16, 100);
          const ringMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.4
          });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.rotation.x = Math.PI / 2;
          nodeGroup.add(ring);
          
          // Connection to center
          const connectionGeometry = new THREE.BufferGeometry();
          const connectionPoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(x, 0, z)
          ];
          connectionGeometry.setFromPoints(connectionPoints);
          
          const connectionMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.2
          });
          const connection = new THREE.Line(connectionGeometry, connectionMaterial);
          connections.push({
            line: connection,
            startPos: new THREE.Vector3(0, 0, 0),
            endPos: new THREE.Vector3(x, 0, z),
            color: member.color
          });
          scene.add(connection);
          
          nodeGroup.position.set(x, 0, z);
          nodeGroup.userData.baseY = 0;
          nodeGroup.userData.floatOffset = Math.random() * Math.PI * 2;
          nodeGroup.userData.display = display;
          nodeGroup.userData.ring = ring;
          
          scene.add(nodeGroup);
          nodeObjects.push(nodeGroup);
        });

        // Data flow particles between nodes
        const particleCount = 100;
        const particlesGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * radius;
          particlePositions[i * 3] = Math.cos(angle) * r;
          particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
          particlePositions[i * 3 + 2] = Math.sin(angle) * r;
          
          const color = new THREE.Color(members[Math.floor(Math.random() * members.length)].color);
          particleColors[i * 3] = color.r;
          particleColors[i * 3 + 1] = color.g;
          particleColors[i * 3 + 2] = color.b;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
          size: 0.1,
          vertexColors: true,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        // Mouse events
        const handleMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(nodeObjects, true);
          
          // Reset all nodes
          nodeObjects.forEach(obj => {
            obj.scale.setScalar(1);
            if (obj.userData.ring) {
              obj.userData.ring.material.opacity = 0.4;
            }
          });
          
          if (intersects.length > 0) {
            const hoveredGroup = intersects[0].object.parent;
            if (hoveredGroup && hoveredGroup.userData.id) {
              hoveredGroup.scale.setScalar(1.1);
              if (hoveredGroup.userData.ring) {
                hoveredGroup.userData.ring.material.opacity = 0.8;
              }
              document.body.style.cursor = 'pointer';
            }
          } else {
            document.body.style.cursor = 'default';
          }
        };

        const handleClick = () => {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(nodeObjects, true);
          
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
        };
        window.addEventListener('resize', handleResize);

        // Animation loop
        const clock = new THREE.Clock();
        
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          
          const elapsedTime = clock.getElapsedTime();
          
          // Rotate core
          core.rotation.x = elapsedTime * 0.2;
          core.rotation.y = elapsedTime * 0.3;
          coreWireframe.rotation.x = -elapsedTime * 0.1;
          coreWireframe.rotation.y = -elapsedTime * 0.15;
          
          // Animate nodes
          nodeObjects.forEach((nodeGroup, index) => {
            // Gentle floating
            nodeGroup.position.y = nodeGroup.userData.baseY + 
              Math.sin(elapsedTime + nodeGroup.userData.floatOffset) * 0.3;
            
            // Rotate rings
            if (nodeGroup.userData.ring) {
              nodeGroup.userData.ring.rotation.z = elapsedTime * 0.5;
            }
            
            // Make displays face camera
            if (nodeGroup.userData.display) {
              nodeGroup.userData.display.lookAt(camera.position);
            }
          });
          
          // Animate connections
          connections.forEach((conn, index) => {
            const pulse = Math.sin(elapsedTime * 2 + index) * 0.3 + 0.7;
            conn.line.material.opacity = 0.2 * pulse;
          });
          
          // Animate particles
          const positions = particles.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const angle = elapsedTime * 0.1 + (i / particleCount) * Math.PI * 2;
            const r = 2 + (Math.sin(elapsedTime + i) + 1) * radius * 0.4;
            positions[i3] = Math.cos(angle) * r;
            positions[i3 + 2] = Math.sin(angle) * r;
            positions[i3 + 1] = Math.sin(elapsedTime * 2 + i * 0.1) * 2;
          }
          particles.geometry.attributes.position.needsUpdate = true;
          
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

export default ThreeSceneTeamNodes;