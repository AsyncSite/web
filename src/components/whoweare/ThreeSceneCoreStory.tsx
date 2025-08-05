import React, { useEffect, useRef, useState } from 'react';
import { WhoWeAreMemberData } from '../../pages/WhoWeArePage';

interface ThreeSceneCoreStoryProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

const ThreeSceneCoreStory: React.FC<ThreeSceneCoreStoryProps> = ({ 
  members, 
  onMemberSelect, 
  onLoadComplete, 
  onLoadError 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);
  const storyMaterialRef = useRef<any>(null);
  const updateStoryCanvasRef = useRef<((index: number) => void) | null>(null);
  const [isThreeLoaded, setIsThreeLoaded] = useState(false);
  const [coreState, setCoreState] = useState<'idle' | 'active' | 'expanded'>('idle');
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // Story content
  const storyContent = [
    {
      title: 'AsyncSite',
      subtitle: '지속가능한 성장 생태계',
      content: '각자의 궤도를 도는 개발자들이\n서로의 중력이 되어주는 곳'
    },
    {
      title: '시작',
      subtitle: '점으로 흩어진 지식의 시대',
      content: '수많은 강의를 완강해도\n연결되지 않는 단편적인 지식들'
    },
    {
      title: '가치 1',
      subtitle: '큰 그림을 그려요',
      content: '코드 리뷰와 동료 피드백을 통해\n학습한 지식을 실제 경험으로'
    },
    {
      title: '가치 2',
      subtitle: '느슨하지만 끈끈해요',
      content: '각자의 속도와 리듬을 존중하는\n비동기적(Async) 참여'
    },
    {
      title: '가치 3',
      subtitle: '지속가능함을 추구해요',
      content: '리더에게 합당한 보상,\n멤버들에게는 다음 시즌을 기대하게'
    },
    {
      title: '우리의 질문',
      subtitle: '',
      content: '"어떻게 하면, 이 외로운 여정을\n함께, 그리고 꾸준히 걸어갈 수 있을까?"'
    }
  ];

  useEffect(() => {
    let mounted = true;

    const initThree = async () => {
      try {
        // Preload profile images
        const imagePromises = members
          .filter(member => member.profileImage)
          .map(member => {
            return new Promise<{ id: string; image: HTMLImageElement }>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve({ id: member.id, image: img });
              img.onerror = () => reject(new Error(`Failed to load image for ${member.id}`));
              img.src = member.profileImage!;
            });
          });

        const loadedImages = await Promise.allSettled(imagePromises);
        const imageMap = new Map<string, HTMLImageElement>();
        
        loadedImages.forEach(result => {
          if (result.status === 'fulfilled') {
            imageMap.set(result.value.id, result.value.image);
          }
        });

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

        // Camera setup - closer to center
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(0, 8, 20);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true 
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 1.5;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 8;
        controls.maxDistance = 30;
        controls.enablePan = false;
        controls.maxPolarAngle = Math.PI * 0.8;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        // Central Story Core
        const coreGroup = new THREE.Group();
        
        // 1. Inner core - glowing energy
        const coreGeometry = new THREE.IcosahedronGeometry(2, 3);
        const coreMaterial = new THREE.MeshBasicMaterial({
          color: 0xC3E88D,
          wireframe: true,
          transparent: true,
          opacity: 0.6
        });
        const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
        coreGroup.add(coreMesh);

        // 2. Outer shell - transparent crystal
        const shellGeometry = new THREE.IcosahedronGeometry(2.5, 2);
        const shellMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x6366f1,
          metalness: 0.2,
          roughness: 0.1,
          transparent: true,
          opacity: 0.2,
          clearcoat: 1.0,
          clearcoatRoughness: 0.0,
          side: THREE.DoubleSide,
          envMapIntensity: 0.5
        });
        const shellMesh = new THREE.Mesh(shellGeometry, shellMaterial);
        coreGroup.add(shellMesh);

        // 3. Energy particles around core
        const particleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const radius = 2.5 + Math.random() * 1;
          
          particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
          particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
          particlePositions[i + 2] = radius * Math.cos(phi);
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
          color: 0xC3E88D,
          size: 0.1,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
        });
        
        const coreParticles = new THREE.Points(particleGeometry, particleMaterial);
        coreGroup.add(coreParticles);

        // 4. Core light
        const coreLight = new THREE.PointLight(0xC3E88D, 2, 20);
        coreLight.position.set(0, 0, 0);
        coreGroup.add(coreLight);

        // 5. Story display (initially hidden)
        const storyCanvas = document.createElement('canvas');
        const storyCtx = storyCanvas.getContext('2d');
        storyCanvas.width = 512;
        storyCanvas.height = 512;
        
        const updateStoryCanvas = (index: number) => {
          if (!storyCtx) return;
          
          const story = storyContent[index];
          storyCtx.clearRect(0, 0, 512, 512);
          
          // Background with border
          storyCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
          storyCtx.fillRect(0, 0, 512, 512);
          
          // Border
          storyCtx.strokeStyle = '#C3E88D';
          storyCtx.lineWidth = 4;
          storyCtx.strokeRect(2, 2, 508, 508);
          
          // Title
          storyCtx.fillStyle = '#C3E88D';
          storyCtx.font = 'bold 48px Arial';
          storyCtx.textAlign = 'center';
          storyCtx.fillText(story.title, 256, 150);
          
          // Subtitle
          if (story.subtitle) {
            storyCtx.fillStyle = '#ffffff';
            storyCtx.font = '24px Arial';
            storyCtx.fillText(story.subtitle, 256, 200);
          }
          
          // Content (multiline)
          storyCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          storyCtx.font = '20px Arial';
          const lines = story.content.split('\n');
          lines.forEach((line, i) => {
            storyCtx.fillText(line, 256, 280 + i * 30);
          });
          
          storyTexture.needsUpdate = true;
        };
        
        const storyTexture = new THREE.CanvasTexture(storyCanvas);
        const storyMaterial = new THREE.MeshBasicMaterial({
          map: storyTexture,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide
        });
        storyMaterialRef.current = storyMaterial;
        
        const storyPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(6, 6),
          storyMaterial
        );
        storyPlane.position.z = 4;
        storyPlane.position.y = 0;
        coreGroup.add(storyPlane);
        
        // Store update function in ref
        updateStoryCanvasRef.current = updateStoryCanvas;
        
        // Initialize first story
        updateStoryCanvas(0);
        
        scene.add(coreGroup);

        // Background stars
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 500;
        const starPositions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
          starPositions[i] = (Math.random() - 0.5) * 100;
          starPositions[i + 1] = (Math.random() - 0.5) * 100;
          starPositions[i + 2] = (Math.random() - 0.5) * 100;
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.05,
          transparent: true,
          opacity: 0.6
        });
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Member spheres orbiting the core
        const memberObjects: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        members.forEach((member, index) => {
          const group = new THREE.Group();
          group.userData = member;
          
          // Glass sphere
          const sphereGeometry = new THREE.SphereGeometry(1.2, 32, 32);
          const sphereMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(member.color),
            metalness: 0.1,
            roughness: 0.1,
            transparent: true,
            opacity: 0.4,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            side: THREE.DoubleSide
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          group.add(sphere);
          
          // Profile card
          const profileGroup = new THREE.Group();
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 256;
          canvas.height = 320;
          
          if (ctx) {
            // Draw profile card
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, 256, 320);
            
            const centerX = 128;
            const photoY = 75;
            
            if (member.profileImage && imageMap.has(member.id)) {
              const img = imageMap.get(member.id)!;
              ctx.save();
              ctx.beginPath();
              ctx.arc(centerX, photoY, 40, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              ctx.drawImage(img, centerX - 40, photoY - 40, 80, 80);
              ctx.restore();
            } else {
              // Initials fallback
              const gradient = ctx.createRadialGradient(centerX, photoY, 0, centerX, photoY, 40);
              gradient.addColorStop(0, member.color);
              gradient.addColorStop(1, `${member.color}88`);
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(centerX, photoY, 40, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 30px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(member.initials, centerX, photoY);
            }
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(member.name, centerX, 150);
            
            ctx.fillStyle = member.color;
            ctx.font = '14px Arial';
            ctx.fillText(member.role, centerX, 175);
          }
          
          const profileTexture = new THREE.CanvasTexture(canvas);
          const profileMaterial = new THREE.MeshBasicMaterial({
            map: profileTexture,
            transparent: true,
            side: THREE.DoubleSide
          });
          const profilePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 1),
            profileMaterial
          );
          profileGroup.add(profilePlane);
          
          group.add(profileGroup);
          group.userData.profileGroup = profileGroup;
          
          // Orbital position
          const angle = (index / members.length) * Math.PI * 2;
          const orbitRadius = 8 + Math.sin(index) * 2;
          const orbitHeight = Math.sin(angle * 2) * 2;
          
          group.position.set(
            Math.cos(angle) * orbitRadius,
            orbitHeight,
            Math.sin(angle) * orbitRadius
          );
          
          // Store orbit parameters
          group.userData.orbitAngle = angle;
          group.userData.orbitRadius = orbitRadius;
          group.userData.orbitHeight = orbitHeight;
          group.userData.orbitSpeed = 0.1 + Math.random() * 0.1;
          
          // Point light for each member
          const light = new THREE.PointLight(new THREE.Color(member.color), 0.3, 5);
          light.position.copy(group.position);
          scene.add(light);
          group.userData.light = light;
          
          scene.add(group);
          memberObjects.push(group);
        });

        // Mouse events
        const handleMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          // Check intersection with core group
          raycaster.setFromCamera(mouse, camera);
          const coreIntersects = raycaster.intersectObjects([coreGroup], true);
          
          // Check if any of the intersected objects belong to the core
          const hitCore = coreIntersects.some(intersect => 
            intersect.object === coreMesh || 
            intersect.object === shellMesh ||
            intersect.object.parent === coreGroup
          );
          
          if (hitCore) {
            setCoreState('active');
            document.body.style.cursor = 'pointer';
          } else {
            if (coreState !== 'expanded') {
              setCoreState('idle');
            }
            
            // Check member spheres
            const intersects = raycaster.intersectObjects(memberObjects, true);
            
            memberObjects.forEach(obj => {
              obj.scale.set(1, 1, 1);
              const sphere = obj.children[0] as any;
              if (sphere && sphere.material) {
                sphere.material.opacity = 0.4;
              }
            });
            
            if (intersects.length > 0) {
              const hoveredObject = intersects[0].object.parent;
              if (hoveredObject) {
                hoveredObject.scale.set(1.2, 1.2, 1.2);
                const sphere = hoveredObject.children[0] as any;
                if (sphere && sphere.material) {
                  sphere.material.opacity = 0.6;
                }
              }
              document.body.style.cursor = 'pointer';
            } else {
              document.body.style.cursor = 'default';
            }
          }
        };

        const handleClick = () => {
          raycaster.setFromCamera(mouse, camera);
          
          // Check if clicking on core group
          const coreIntersects = raycaster.intersectObjects([coreGroup], true);
          
          // Check if any of the intersected objects belong to the core
          const hitCore = coreIntersects.some(intersect => 
            intersect.object === coreMesh || 
            intersect.object === shellMesh ||
            intersect.object.parent === coreGroup
          );
          
          if (hitCore) {
            console.log('Core clicked! Current state:', coreState);
            if (coreState === 'expanded') {
              // Navigate through stories
              const nextIndex = (currentStoryIndex + 1) % storyContent.length;
              setCurrentStoryIndex(nextIndex);
              if (updateStoryCanvasRef.current) {
                updateStoryCanvasRef.current(nextIndex);
              }
            } else {
              setCoreState('expanded');
              console.log('Expanding story...');
              if (updateStoryCanvasRef.current) {
                updateStoryCanvasRef.current(currentStoryIndex);
              }
            }
          } else {
            // Check member spheres
            const intersects = raycaster.intersectObjects(memberObjects, true);
            
            if (intersects.length > 0 && intersects[0].object.parent) {
              const clickedMember = intersects[0].object.parent.userData as WhoWeAreMemberData;
              onMemberSelect(clickedMember);
            } else if (coreState === 'expanded') {
              setCoreState('idle');
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
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          const time = Date.now() * 0.001;
          
          // Animate core
          coreMesh.rotation.x += 0.005;
          coreMesh.rotation.y += 0.003;
          shellMesh.rotation.x -= 0.002;
          shellMesh.rotation.y += 0.001;
          
          // Core particles
          coreParticles.rotation.y += 0.001;
          
          // Core pulsing
          const pulse = Math.sin(time * 2) * 0.1 + 1;
          coreMesh.scale.set(pulse, pulse, pulse);
          
          // Core state animations
          if (coreState === 'active') {
            coreMaterial.opacity = Math.min(coreMaterial.opacity + 0.02, 0.9);
            coreLight.intensity = Math.min(coreLight.intensity + 0.05, 4);
          } else if (coreState === 'idle') {
            coreMaterial.opacity = Math.max(coreMaterial.opacity - 0.02, 0.6);
            coreLight.intensity = Math.max(coreLight.intensity - 0.05, 2);
          } else if (coreState === 'expanded') {
            if (storyMaterialRef.current) {
              storyMaterialRef.current.opacity = Math.min(storyMaterialRef.current.opacity + 0.03, 1);
            }
            coreMaterial.opacity = Math.max(coreMaterial.opacity - 0.02, 0.3);
          }
          
          // Always update story opacity based on state
          if (coreState !== 'expanded' && storyMaterialRef.current && storyMaterialRef.current.opacity > 0) {
            storyMaterialRef.current.opacity = Math.max(storyMaterialRef.current.opacity - 0.03, 0);
          }
          
          // Animate member orbits
          memberObjects.forEach((obj) => {
            // Static position with gentle floating animation only
            const floatY = Math.sin(time + obj.userData.orbitAngle) * 0.3;
            obj.position.y = obj.userData.orbitHeight + floatY;
            
            // Rotate sphere
            obj.rotation.y += 0.005;
            
            // Keep profile facing forward
            if (obj.userData.profileGroup) {
              obj.userData.profileGroup.rotation.y = -obj.rotation.y;
            }
          });
          
          // Subtle star rotation
          stars.rotation.y += 0.00005;
          
          controls.update();
          renderer.render(scene, camera);
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
  }, [members, onMemberSelect, onLoadComplete, onLoadError, coreState, currentStoryIndex]);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ThreeSceneCoreStory;