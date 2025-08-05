import React, { useEffect, useRef, useState, useMemo } from 'react';
import { WhoWeAreMemberData } from '../../pages/WhoWeArePage';

interface ThreeSceneFloatingStoryProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
  onStoryCardSelect?: (story: any) => void;
}

const ThreeSceneFloatingStory: React.FC<ThreeSceneFloatingStoryProps> = ({ 
  members, 
  onMemberSelect, 
  onLoadComplete, 
  onLoadError,
  onStoryCardSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const [isThreeLoaded, setIsThreeLoaded] = useState(false);
  const [selectedStoryCard, setSelectedStoryCard] = useState<any>(null);
  const [isZooming, setIsZooming] = useState(false);
  const lastClickTimeRef = useRef<number>(0);

  // Generate random positions for story panels
  const generateRandomPosition = (index: number) => {
    const angle = (index / 6) * Math.PI * 2 + Math.random() * 0.5;
    const radius = 10 + Math.random() * 8;
    const height = (Math.random() - 0.5) * 12;
    
    return {
      x: Math.cos(angle) * radius,
      y: height,
      z: Math.sin(angle) * radius
    };
  };

  // Story content with random positions generated on mount
  const storyPanels = useMemo(() => [
    {
      id: 'intro',
      title: 'AsyncSite',
      content: '각자의 궤도를 도는 개발자들이\n서로의 중력이 되어주는\n지속가능한 성장 생태계',
      position: generateRandomPosition(0),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    },
    {
      id: 'why',
      title: '왜 시작했나요?',
      content: '우리는 \'점\'으로 흩어진\n지식의 시대에 지쳤어요.\n개발자의 성장은 점점 더\n고독한 싸움이 되어가고 있어요.',
      position: generateRandomPosition(1),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    },
    {
      id: 'value1',
      title: '큰 그림을 그려요',
      content: '코드 리뷰와 동료 피드백,\n팀 프로젝트를 통해\n학습한 지식을 실제 경험으로\n꿰어내는 \'총체적 성장\'',
      position: generateRandomPosition(2),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    },
    {
      id: 'value2',
      title: '느슨하지만 끈끈해요',
      content: '각자의 속도와 리듬을 존중하는\n비동기적(Async) 참여,\n그리고 안정적인 터전(Site)',
      position: generateRandomPosition(3),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    },
    {
      id: 'value3',
      title: '지속가능함을 추구해요',
      content: '리더에게 합당한 보상,\n멤버들에게는 다음 시즌을\n기대하게 만드는 시스템',
      position: generateRandomPosition(4),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    },
    {
      id: 'question',
      title: '',
      content: '"어떻게 하면, 이 외로운 여정을\n함께, 그리고 꾸준히\n걸어갈 수 있을까?"\n\n우리는 그 답을\n여기서 찾아가고 있습니다.',
      position: generateRandomPosition(5),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    }
  ], []);

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
        scene.fog = new THREE.Fog(0x000000, 10, 100);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(0, 3, 25);
        cameraRef.current = camera;

        // WebGL Renderer
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


        // Controls with smoother interaction
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08; // Increased for smoother damping
        controls.minDistance = 10;
        controls.maxDistance = 50;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        controls.rotateSpeed = 0.8; // Slightly slower rotation for better control
        controls.zoomSpeed = 0.8; // Smoother zoom
        controls.panSpeed = 0.8; // Smoother panning
        controlsRef.current = controls;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        // Particles (stars)
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 300;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 50;
          positions[i + 1] = (Math.random() - 0.5) * 50;
          positions[i + 2] = (Math.random() - 0.5) * 50;
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

        // Create floating story panels as 3D objects
        const storyObjects: any[] = [];
        
        storyPanels.forEach((panel, index) => {
          const group = new THREE.Group();
          group.userData = panel;
          
          // Create 3D card background with higher contrast
          const cardGeometry = new THREE.PlaneGeometry(5, 3);
          const cardMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x000000, // Pure black for maximum contrast
            metalness: 0.1,
            roughness: 0.8,
            transparent: true,
            opacity: 0.95, // More opaque for better text visibility
            side: THREE.DoubleSide,
            clearcoat: 0.3,
            clearcoatRoughness: 0.5
          });
          const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
          cardMesh.castShadow = true;
          cardMesh.receiveShadow = true;
          group.add(cardMesh);
          
          // Create glowing border with stronger presence
          const borderGeometry = new THREE.EdgesGeometry(cardGeometry);
          const borderMaterial = new THREE.LineBasicMaterial({
            color: 0xC3E88D,
            transparent: true,
            opacity: 0.9, // More opaque for better visibility
            linewidth: 3 // Thicker border
          });
          const borderLines = new THREE.LineSegments(borderGeometry, borderMaterial);
          group.add(borderLines);
          
          // Create text texture with higher resolution
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 2048; // Double resolution
          canvas.height = 1536; // Double resolution
          
          if (ctx) {
            // Scale context for high DPI
            ctx.scale(2, 2);
            
            // Clear canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 0)';
            ctx.fillRect(0, 0, 1024, 768);
            
            // Add stronger background for better text visibility
            const bgGradient = ctx.createRadialGradient(512, 384, 0, 512, 384, 600);
            bgGradient.addColorStop(0, 'rgba(10, 10, 10, 0.95)');
            bgGradient.addColorStop(0.7, 'rgba(10, 10, 10, 0.85)');
            bgGradient.addColorStop(1, 'rgba(10, 10, 10, 0.7)');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, 1024, 768);
            
            // Add subtle glow background for title
            if (panel.title) {
              const titleGlow = ctx.createRadialGradient(512, 150, 0, 512, 150, 300);
              titleGlow.addColorStop(0, 'rgba(195, 232, 141, 0.15)');
              titleGlow.addColorStop(1, 'rgba(195, 232, 141, 0)');
              ctx.fillStyle = titleGlow;
              ctx.fillRect(0, 0, 1024, 300);
            }
            
            // Title with maximum clarity
            if (panel.title) {
              // Multiple shadow layers for better visibility
              ctx.shadowColor = '#000000';
              ctx.shadowBlur = 20;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 3;
              
              // Draw title multiple times for bold effect
              ctx.fillStyle = '#C3E88D';
              ctx.font = '900 74px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
              ctx.textAlign = 'center';
              
              // Draw shadow layer
              ctx.fillText(panel.title, 512, 150);
              
              // Draw main text
              ctx.shadowBlur = 5;
              ctx.shadowOffsetY = 1;
              ctx.fillText(panel.title, 512, 150);
              
              ctx.shadowBlur = 0;
              ctx.shadowOffsetY = 0;
            }
            
            // Content with maximum readability
            ctx.fillStyle = '#ffffff';
            ctx.font = '600 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;
            
            const lines = panel.content.split('\n');
            lines.forEach((line, i) => {
              // Draw shadow layer
              ctx.fillText(line, 512, 320 + i * 70);
            });
            
            // Draw text again with less shadow for crisp edges
            ctx.shadowBlur = 3;
            ctx.shadowOffsetY = 1;
            lines.forEach((line, i) => {
              ctx.fillText(line, 512, 320 + i * 70);
            });
          }
          
          const textTexture = new THREE.CanvasTexture(canvas);
          const textMaterial = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            depthWrite: false
          });
          
          const textPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(4.8, 2.8),
            textMaterial
          );
          textPlane.position.z = 0.01;
          group.add(textPlane);
          
          // Position and rotation
          group.position.set(panel.position.x, panel.position.y, panel.position.z);
          group.rotation.y = panel.rotation.y;
          
          // Stronger glow light for visibility
          const cardLight = new THREE.PointLight(0xC3E88D, 0.6, 20); // Increased intensity and range
          cardLight.position.copy(group.position);
          scene.add(cardLight);
          group.userData.light = cardLight;
          
          // Additional white light for text clarity
          const textLight = new THREE.PointLight(0xffffff, 0.4, 10); // Increased intensity
          textLight.position.copy(group.position);
          textLight.position.z += 2;
          scene.add(textLight);
          group.userData.textLight = textLight;
          
          // Front-facing spotlight for text
          const spotLight = new THREE.SpotLight(0xffffff, 0.3);
          spotLight.position.copy(group.position);
          spotLight.position.z += 5;
          spotLight.target = cardMesh;
          spotLight.angle = Math.PI / 6;
          spotLight.penumbra = 0.5;
          scene.add(spotLight);
          group.userData.spotLight = spotLight;
          
          // Animation properties
          group.userData.floatOffset = Math.random() * Math.PI * 2;
          group.userData.originalPosition = group.position.clone();
          group.userData.originalRotation = group.rotation.clone();
          
          // Initial scale animation
          group.scale.set(0, 0, 0);
          setTimeout(() => {
            const scaleAnimation = () => {
              group.scale.x += (1 - group.scale.x) * 0.1;
              group.scale.y += (1 - group.scale.y) * 0.1;
              group.scale.z += (1 - group.scale.z) * 0.1;
              
              if (group.scale.x < 0.99) {
                requestAnimationFrame(scaleAnimation);
              }
            };
            scaleAnimation();
          }, 500 + index * 200);
          
          scene.add(group);
          storyObjects.push(group);
        });

        // Member spheres with profile cards
        const memberObjects: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        members.forEach((member) => {
          const group = new THREE.Group();
          group.userData = member;
          
          // Transparent glass sphere
          const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
          const sphereMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(member.color),
            metalness: 0.1,
            roughness: 0.1,
            transparent: true,
            opacity: 0.3,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            side: THREE.DoubleSide
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          group.add(sphere);
          
          // Inner glow
          const glowGeometry = new THREE.SphereGeometry(1.45, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
          });
          const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
          group.add(glowSphere);
          
          // Profile card inside sphere
          const profileGroup = new THREE.Group();
          
          // Create profile card with canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 256;
          canvas.height = 320;
          
          if (ctx) {
            // Glassmorphism background
            const gradient = ctx.createLinearGradient(0, 0, 0, 320);
            gradient.addColorStop(0, `rgba(255, 255, 255, 0.1)`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, 0.05)`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0.1)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 320);
            
            // Profile content
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
              // Fallback to initials
              const circleGradient = ctx.createRadialGradient(centerX, photoY, 0, centerX, photoY, 40);
              circleGradient.addColorStop(0, member.color);
              circleGradient.addColorStop(1, `${member.color}88`);
              ctx.fillStyle = circleGradient;
              ctx.beginPath();
              ctx.arc(centerX, photoY, 40, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 30px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(member.initials, centerX, photoY);
            }
            
            // Name and role
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
            new THREE.PlaneGeometry(1, 1.25),
            profileMaterial
          );
          profilePlane.position.z = 0.05;
          profileGroup.add(profilePlane);
          
          group.add(profileGroup);
          group.userData.profileGroup = profileGroup;
          
          // Position in space
          const angle = (members.indexOf(member) / members.length) * Math.PI * 2;
          const radius = 10;
          const height = Math.sin(angle * 2) * 3;
          
          group.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
          );
          
          group.userData.floatOffset = Math.random() * Math.PI * 2;
          group.userData.floatSpeed = 0.5 + Math.random() * 0.5;
          group.userData.rotationSpeed = 0.001 + Math.random() * 0.002;
          group.userData.originalY = group.position.y;
          
          // Point light
          const light = new THREE.PointLight(new THREE.Color(member.color), 0.5, 8);
          light.position.copy(group.position);
          scene.add(light);
          
          scene.add(group);
          memberObjects.push(group);
        });

        // Helper function to find the group with userData
        const findGroupWithUserData = (object: any): any => {
          let current = object;
          while (current) {
            if (current.userData && (current.userData.id || current.userData.name)) {
              return current;
            }
            current = current.parent;
          }
          return null;
        };

        // Mouse events
        const handleMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          
          // Check all intersections
          const storyIntersects = raycaster.intersectObjects(storyObjects, true);
          const memberIntersects = raycaster.intersectObjects(memberObjects, true);
          
          // Reset all objects
          storyObjects.forEach(obj => {
            obj.scale.set(1, 1, 1);
            const card = obj.children[0] as any;
            if (card && card.material) {
              card.material.opacity = 0.95;
            }
          });
          
          memberObjects.forEach(obj => {
            obj.scale.set(1, 1, 1);
            const sphere = obj.children[0] as any;
            if (sphere && sphere.material) {
              sphere.material.opacity = 0.3;
            }
          });
          
          // Find closest valid story card
          let closestStoryCard = null;
          let closestStoryDistance = Infinity;
          
          for (const intersect of storyIntersects) {
            const card = findGroupWithUserData(intersect.object);
            if (card && storyObjects.includes(card)) {
              if (intersect.distance < closestStoryDistance) {
                closestStoryCard = card;
                closestStoryDistance = intersect.distance;
              }
            }
          }
          
          // Find closest valid member
          let closestMember = null;
          let closestMemberDistance = Infinity;
          
          for (const intersect of memberIntersects) {
            const member = findGroupWithUserData(intersect.object);
            if (member && memberObjects.includes(member) && member.userData) {
              if (intersect.distance < closestMemberDistance) {
                closestMember = member;
                closestMemberDistance = intersect.distance;
              }
            }
          }
          
          // Hover effect on closest object
          if (closestStoryCard && closestStoryDistance < closestMemberDistance) {
            closestStoryCard.scale.set(1.1, 1.1, 1.1);
            const card = closestStoryCard.children[0] as any;
            if (card && card.material) {
              card.material.opacity = 1;
            }
            document.body.style.cursor = 'pointer';
          } else if (closestMember) {
            closestMember.scale.set(1.2, 1.2, 1.2);
            const sphere = closestMember.children[0] as any;
            if (sphere && sphere.material) {
              sphere.material.opacity = 0.5;
            }
            document.body.style.cursor = 'pointer';
          } else {
            document.body.style.cursor = 'default';
          }
        };

        const handleClick = (event: MouseEvent) => {
          // Debounce clicks - prevent multiple rapid clicks
          const currentTime = Date.now();
          if (currentTime - lastClickTimeRef.current < 300) return;
          lastClickTimeRef.current = currentTime;
          
          // Prevent clicks during zoom animation
          if (isZooming || selectedStoryCard) return;
          
          // Update mouse position from click event
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          
          // Check all intersections for both story cards and member spheres
          const storyIntersects = raycaster.intersectObjects(storyObjects, true);
          const memberIntersects = raycaster.intersectObjects(memberObjects, true);
          
          // Find the closest valid story card
          let closestStoryCard = null;
          let closestStoryDistance = Infinity;
          
          for (const intersect of storyIntersects) {
            const card = findGroupWithUserData(intersect.object);
            if (card && storyObjects.includes(card)) {
              if (intersect.distance < closestStoryDistance) {
                closestStoryCard = card;
                closestStoryDistance = intersect.distance;
              }
            }
          }
          
          // Find the closest valid member sphere
          let closestMember = null;
          let closestMemberDistance = Infinity;
          
          for (const intersect of memberIntersects) {
            const member = findGroupWithUserData(intersect.object);
            if (member && memberObjects.includes(member) && member.userData) {
              if (intersect.distance < closestMemberDistance) {
                closestMember = member;
                closestMemberDistance = intersect.distance;
              }
            }
          }
          
          
          // Click on the closest object (story card or member)
          if (closestStoryCard && closestStoryDistance < closestMemberDistance) {
            setIsZooming(true);
            setSelectedStoryCard(closestStoryCard);
            
            // Zoom animation to card
            const targetPosition = closestStoryCard.position.clone();
            targetPosition.z += 8; // Position camera in front of card
            
            // Disable controls during animation
            controls.enabled = false;
            controls.autoRotate = false;
            
            // Animate camera
            const startPosition = camera.position.clone();
            const startRotation = camera.rotation.clone();
            const duration = 1500;
            const startTime = Date.now();
            
            const animateZoom = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
              
              // Interpolate camera position
              camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
              camera.lookAt(closestStoryCard.position);
              
              if (progress < 1) {
                requestAnimationFrame(animateZoom);
              } else {
                // Show 2D card overlay after zoom completes
                setTimeout(() => {
                  // Trigger parent component to show 2D overlay
                  if (closestStoryCard.userData && onStoryCardSelect) {
                    onStoryCardSelect(closestStoryCard.userData);
                  }
                }, 200);
              }
            };
            
            animateZoom();
          } else if (closestMember) {
            onMemberSelect(closestMember.userData as WhoWeAreMemberData);
          }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleClick);

        // Reset camera when closing card
        const handleResetCamera = () => {
          if (!cameraRef.current || !controlsRef.current || !camera) return;
          
          // Reset zoom state immediately
          setIsZooming(false);
          setSelectedStoryCard(null);
          
          const duration = 1000;
          const startTime = Date.now();
          const startPosition = camera.position.clone();
          const targetPosition = new THREE.Vector3(0, 3, 25);
          
          const animateReset = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            camera.lookAt(0, 0, 0);
            
            if (progress < 1) {
              requestAnimationFrame(animateReset);
            } else {
              // Re-enable controls after animation completes
              controls.enabled = true;
              controls.autoRotate = true;
              controls.update();
            }
          };
          
          animateReset();
        };
        
        window.addEventListener('resetCamera', handleResetCamera);

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
          
          // Animate story panels - 3D floating movement
          storyObjects.forEach((obj, index) => {
            const floatY = Math.sin(time * 0.3 + obj.userData.floatOffset) * 0.3;
            const floatX = Math.cos(time * 0.2 + obj.userData.floatOffset) * 0.2;
            const floatZ = Math.sin(time * 0.25 + obj.userData.floatOffset) * 0.1;
            
            obj.position.y = obj.userData.originalPosition.y + floatY;
            obj.position.x = obj.userData.originalPosition.x + floatX;
            obj.position.z = obj.userData.originalPosition.z + floatZ;
            
            // Subtle rotation
            obj.rotation.y = obj.userData.originalRotation.y + Math.sin(time * 0.2 + index) * 0.05;
            obj.rotation.x = Math.sin(time * 0.15 + index) * 0.02;
            
            // Update light positions
            if (obj.userData.light) {
              obj.userData.light.position.copy(obj.position);
            }
            if (obj.userData.textLight) {
              obj.userData.textLight.position.copy(obj.position);
              obj.userData.textLight.position.z += 2;
            }
            if (obj.userData.spotLight) {
              obj.userData.spotLight.position.copy(obj.position);
              obj.userData.spotLight.position.z += 5;
            }
          });
          
          // Animate member spheres
          memberObjects.forEach((obj) => {
            const floatY = Math.sin(time * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.5;
            obj.position.y = obj.userData.originalY + floatY;
            obj.rotation.y += obj.userData.rotationSpeed;
            
            if (obj.userData.profileGroup) {
              obj.userData.profileGroup.lookAt(camera.position);
            }
          });
          
          // Subtle star rotation
          particles.rotation.y += 0.00005;
          particles.rotation.x += 0.00002;
          
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
          window.removeEventListener('resetCamera', handleResetCamera);
          
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

export default ThreeSceneFloatingStory;