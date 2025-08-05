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
  
  // Simplified drag detection
  const mouseDownTimeRef = useRef<number>(0);
  const mouseDownPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

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
      id: 'why',
      title: '왜 시작했나요?',
      content: '혼자 공부하다 지치지 않으셨나요?\n유튜브와 블로그만으론 부족하죠.\n진짜 성장은 함께할 때\n비로소 시작된다고 믿어요.',
      position: generateRandomPosition(0),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    },
    {
      id: 'value1',
      title: '어떻게 성장하나요?',
      content: '실제 프로젝트를 함께 만들어요.\n코드 리뷰로 서로 배우고,\n동료의 피드백으로 성장해요.\n지식이 경험이 되는 순간을 만들어요.',
      position: generateRandomPosition(1),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    },
    {
      id: 'value2',
      title: '어떤 문화를 만드나요?',
      content: '각자의 속도를 존중해요.\n비동기적(Async)으로 참여하되,\n안정적인 터전(Site)에서\n지속적으로 연결되어 있어요.',
      position: generateRandomPosition(2),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    },
    {
      id: 'value3',
      title: '어떻게 지속하나요?',
      content: '리더에겐 합당한 보상을,\n멤버에겐 다음이 기대되는 경험을.\n모두가 윈윈하는 구조로\n오래오래 함께 가요.',
      position: generateRandomPosition(3),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    },
    {
      id: 'question',
      title: '우리의 질문',
      content: '"어떻게 하면 이 외로운 여정을\n함께, 그리고 꾸준히\n걸어갈 수 있을까요?"',
      position: generateRandomPosition(4),
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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = false; // Disable shadows for performance
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

        // Optimized lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
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
          
          // Create text texture function
          const createTextTexture = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { alpha: false });
            canvas.width = 512; // Optimized resolution
            canvas.height = 384; // Optimized resolution
            
            if (ctx) {
              
              // Clear canvas
              ctx.fillStyle = 'rgba(0, 0, 0, 0)';
              ctx.fillRect(0, 0, 512, 384);
              
              // Add stronger background for better text visibility
              const bgGradient = ctx.createRadialGradient(256, 192, 0, 256, 192, 300);
              bgGradient.addColorStop(0, 'rgba(10, 10, 10, 0.95)');
              bgGradient.addColorStop(0.7, 'rgba(10, 10, 10, 0.85)');
              bgGradient.addColorStop(1, 'rgba(10, 10, 10, 0.7)');
              ctx.fillStyle = bgGradient;
              ctx.fillRect(0, 0, 512, 384);
              
              // Add subtle glow background for title
              if (panel.title) {
                const titleGlow = ctx.createRadialGradient(256, 75, 0, 256, 75, 150);
                titleGlow.addColorStop(0, 'rgba(195, 232, 141, 0.15)');
                titleGlow.addColorStop(1, 'rgba(195, 232, 141, 0)');
                ctx.fillStyle = titleGlow;
                ctx.fillRect(0, 0, 512, 150);
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
                ctx.font = '600 37px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.textAlign = 'center';
                
                // Draw shadow layer
                ctx.fillText(panel.title, 256, 75);
                
                // Draw main text
                ctx.shadowBlur = 5;
                ctx.shadowOffsetY = 1;
                ctx.fillText(panel.title, 256, 75);
                
                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;
              }
              
              // Content with maximum readability
              ctx.fillStyle = '#ffffff';
              ctx.font = '400 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
              ctx.textAlign = 'center';
              ctx.shadowColor = '#000000';
              ctx.shadowBlur = 20;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 3;
              
              const lines = panel.content.split('\n');
              lines.forEach((line, i) => {
                // Draw shadow layer
                ctx.fillText(line, 256, 160 + i * 35);
              });
              
              // Draw text again with less shadow for crisp edges
              ctx.shadowBlur = 5;
              ctx.shadowOffsetY = 2;
              lines.forEach((line, i) => {
                ctx.fillText(line, 256, 160 + i * 35);
              });
              
              // Final layer for maximum sharpness
              ctx.shadowBlur = 0;
              ctx.shadowOffsetY = 0;
              lines.forEach((line, i) => {
                ctx.fillText(line, 256, 160 + i * 35);
              });
            }
            
            return new THREE.CanvasTexture(canvas);
          };
          
          // Create front text
          const frontTexture = createTextTexture();
          const textMaterial = new THREE.MeshBasicMaterial({
            map: frontTexture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            depthWrite: true,
            depthTest: true
          });
          
          const textPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(4.8, 2.8),
            textMaterial
          );
          textPlane.position.z = 0.01;
          group.add(textPlane);
          
          // Create back text
          const backTexture = createTextTexture();
          const backTextMaterial = new THREE.MeshBasicMaterial({
            map: backTexture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            depthWrite: true,
            depthTest: true
          });
          
          const backTextPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(4.8, 2.8),
            backTextMaterial
          );
          backTextPlane.position.z = -0.01;
          backTextPlane.rotation.y = Math.PI; // Rotate 180 degrees
          group.add(backTextPlane);
          
          // Position and rotation
          group.position.set(panel.position.x, panel.position.y, panel.position.z);
          group.rotation.y = panel.rotation.y;
          
          // Single optimized light per card
          const cardLight = new THREE.PointLight(0xC3E88D, 0.5, 15);
          cardLight.position.copy(group.position);
          scene.add(cardLight);
          group.userData.light = cardLight;
          
          // Animation properties
          group.userData.floatOffset = Math.random() * Math.PI * 2;
          group.userData.originalPosition = group.position.clone();
          group.userData.originalRotation = group.rotation.clone();
          group.userData.isStoryCard = true;
          
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
          const sphereGeometry = new THREE.SphereGeometry(1.0, 32, 32);
          const sphereMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(member.color),
            metalness: 0.1,
            roughness: 0.1,
            transparent: true,
            opacity: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            side: THREE.DoubleSide,
            depthWrite: false
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.renderOrder = 1;
          group.add(sphere);
          
          // Add invisible click helper sphere (much larger for better detection)
          const clickHelperGeometry = new THREE.SphereGeometry(1.5, 16, 16);
          const clickHelperMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.01, // Very slight opacity to ensure raycasting works
            side: THREE.DoubleSide
          });
          const clickHelper = new THREE.Mesh(clickHelperGeometry, clickHelperMaterial);
          clickHelper.userData = member;
          clickHelper.name = 'clickHelper';
          clickHelper.renderOrder = 999; // Ensure it's checked first
          group.add(clickHelper);
          
          // Inner glow (removed to eliminate dark edges)
          // Commenting out the inner glow sphere
          
          // Profile card inside sphere
          const profileGroup = new THREE.Group();
          
          // Create profile card with canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 128;
          canvas.height = 160;
          
          if (ctx) {
            // Glassmorphism background
            const gradient = ctx.createLinearGradient(0, 0, 0, 160);
            gradient.addColorStop(0, `rgba(255, 255, 255, 0.1)`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, 0.05)`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0.1)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 128, 160);
            
            // Profile content
            const centerX = 64;
            const padding = 20;
            const contentWidth = canvas.width - (padding * 2);
            
            // Dynamic sizing based on content
            let currentY = 10;
            const photoSize = Math.min(30, canvas.height * 0.25); // 25% of canvas height max
            const photoRadius = photoSize / 2;
            
            // Profile image with dynamic sizing
            if (member.profileImage && imageMap.has(member.id)) {
              const img = imageMap.get(member.id)!;
              ctx.save();
              ctx.beginPath();
              ctx.arc(centerX, currentY + photoRadius, photoRadius, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              
              // Calculate proper image scaling
              const scale = Math.min(photoSize / img.width, photoSize / img.height);
              const scaledWidth = img.width * scale;
              const scaledHeight = img.height * scale;
              const offsetX = (photoSize - scaledWidth) / 2;
              const offsetY = (photoSize - scaledHeight) / 2;
              
              ctx.drawImage(img, 
                centerX - photoRadius + offsetX, 
                currentY + offsetY, 
                scaledWidth, 
                scaledHeight
              );
              ctx.restore();
            } else {
              // Fallback to initials with dynamic size
              const circleGradient = ctx.createRadialGradient(centerX, currentY + photoRadius, 0, centerX, currentY + photoRadius, photoRadius);
              circleGradient.addColorStop(0, member.color);
              circleGradient.addColorStop(1, `${member.color}88`);
              ctx.fillStyle = circleGradient;
              ctx.beginPath();
              ctx.arc(centerX, currentY + photoRadius, photoRadius, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.fillStyle = '#ffffff';
              const initialsFontSize = photoRadius * 0.7;
              ctx.font = `bold ${initialsFontSize}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(member.initials, centerX, currentY + photoRadius);
            }
            
            currentY += photoSize + 8;
            
            // Name with dynamic font size
            ctx.fillStyle = '#ffffff';
            let nameFontSize = 9;
            ctx.font = `bold ${nameFontSize}px Arial`;
            ctx.textAlign = 'center';
            
            // Adjust font size if name is too wide
            while (ctx.measureText(member.name).width > contentWidth && nameFontSize > 6) {
              nameFontSize--;
              ctx.font = `bold ${nameFontSize}px Arial`;
            }
            ctx.fillText(member.name, centerX, currentY);
            
            currentY += nameFontSize + 4;
            
            // Role with dynamic font size
            ctx.fillStyle = member.color;
            let roleFontSize = 7;
            ctx.font = `${roleFontSize}px Arial`;
            
            // Adjust font size if role is too wide
            while (ctx.measureText(member.role).width > contentWidth && roleFontSize > 5) {
              roleFontSize--;
              ctx.font = `${roleFontSize}px Arial`;
            }
            ctx.fillText(member.role, centerX, currentY);
          }
          
          const profileTexture = new THREE.CanvasTexture(canvas);
          const profileMaterial = new THREE.MeshBasicMaterial({
            map: profileTexture,
            transparent: true,
            side: THREE.DoubleSide
          });
          const profilePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.7, 0.875),
            profileMaterial
          );
          profilePlane.position.z = 0.05;
          profilePlane.renderOrder = 2; // Ensure proper layering
          profileGroup.add(profilePlane);
          
          group.add(profileGroup);
          group.userData.profileGroup = profileGroup;
          
          // Position in space with better distribution
          const memberIndex = members.indexOf(member);
          const angle = (memberIndex / members.length) * Math.PI * 2;
          const radius = 12 + (memberIndex % 2) * 3; // Alternate between two radius levels
          const height = Math.sin(angle * 2) * 3 + (memberIndex % 3 - 1) * 1.5; // Vary heights more
          
          group.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
          );
          
          group.userData.floatOffset = Math.random() * Math.PI * 2;
          group.userData.floatSpeed = 0.5 + Math.random() * 0.5;
          group.userData.rotationSpeed = 0.001 + Math.random() * 0.002;
          group.userData.originalY = group.position.y;
          group.userData.isMember = true;
          
          // Optimized member light
          const light = new THREE.PointLight(new THREE.Color(member.color), 0.3, 8);
          light.position.copy(group.position);
          scene.add(light);
          group.userData.light = light;
          
          scene.add(group);
          memberObjects.push(group);
        });

        // Helper function to find the group with userData
        const findGroupWithUserData = (object: any): any => {
          let current = object;
          while (current) {
            if (current.userData && (current.userData.id || current.userData.name || current.userData.isMember || current.userData.isStoryCard)) {
              return current;
            }
            current = current.parent;
          }
          return null;
        };

        // Mouse events
        const handleMouseDown = (event: MouseEvent) => {
          mouseDownTimeRef.current = Date.now();
          mouseDownPosRef.current = { x: event.clientX, y: event.clientY };
          hasMovedRef.current = false;
        };
        
        const handleMouseUp = (event: MouseEvent) => {
          // Just a placeholder - we handle everything in click
        };
        
        const handleMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          // Check if mouse has moved significantly since mousedown
          if (mouseDownTimeRef.current > 0) {
            const distance = Math.sqrt(
              Math.pow(event.clientX - mouseDownPosRef.current.x, 2) + 
              Math.pow(event.clientY - mouseDownPosRef.current.y, 2)
            );
            if (distance > 5) {
              hasMovedRef.current = true;
            }
          }
          
          raycaster.setFromCamera(mouse, camera);
          
          // Set near and far for better detection
          raycaster.near = 0.1;
          raycaster.far = 100;
          
          // Get all intersections from both story cards and members
          const allObjects = [...storyObjects, ...memberObjects];
          const allIntersects = raycaster.intersectObjects(allObjects, true);
          
          
          // Reset all objects first
          storyObjects.forEach(obj => {
            obj.scale.set(1, 1, 1);
            const card = obj.children[0] as any;
            if (card && card.material) {
              card.material.opacity = 0.95;
            }
          });
          
          memberObjects.forEach(obj => {
            obj.scale.set(1, 1, 1);
            const sphere = obj.children.find((child: any) => child.geometry instanceof THREE.SphereGeometry && child.name !== 'clickHelper') as any;
            if (sphere && sphere.material) {
              sphere.material.opacity = 0.5;
              sphere.material.emissive = new THREE.Color(0x000000); // Reset glow
              sphere.material.emissiveIntensity = 0;
            }
          });
          
          // Find the closest object that the mouse is actually over
          let hoveredObject = null;
          let minDistance = Infinity;
          
          for (const intersect of allIntersects) {
            // Skip invisible objects
            if (!intersect.object.visible) continue;
            
            const parentGroup = findGroupWithUserData(intersect.object);
            if (!parentGroup) continue;
            
            // Check if it's a valid story card or member
            const isStoryCard = parentGroup.userData.isStoryCard || storyObjects.includes(parentGroup);
            const isMember = parentGroup.userData.isMember || memberObjects.includes(parentGroup);
            
            if ((isStoryCard || isMember) && intersect.distance < minDistance) {
              minDistance = intersect.distance;
              hoveredObject = {
                group: parentGroup,
                isStoryCard,
                isMember,
                distance: intersect.distance
              };
            }
          }
          
          // Apply hover effect to the closest object
          if (hoveredObject) {
            if (hoveredObject.isStoryCard) {
              hoveredObject.group.scale.set(1.1, 1.1, 1.1);
              const card = hoveredObject.group.children[0] as any;
              if (card && card.material) {
                card.material.opacity = 1;
              }
            } else if (hoveredObject.isMember) {
              hoveredObject.group.scale.set(1.3, 1.3, 1.3); // 더 크게
              const sphere = hoveredObject.group.children.find((child: any) => child.geometry instanceof THREE.SphereGeometry && child.name !== 'clickHelper') as any;
              if (sphere && sphere.material) {
                sphere.material.opacity = 0.9; // 더 선명하게
                sphere.material.emissive = new THREE.Color(hoveredObject.group.userData.color);
                sphere.material.emissiveIntensity = 0.3; // 빛나는 효과
              }
            }
            // 더 강력하게 cursor 설정
            document.body.style.cursor = 'pointer';
            renderer.domElement.style.cursor = 'pointer';
          } else {
            document.body.style.cursor = 'default';
            renderer.domElement.style.cursor = 'default';
          }
        };

        const handleClick = (event: MouseEvent) => {
          // Debounce clicks - prevent multiple rapid clicks
          const currentTime = Date.now();
          if (currentTime - lastClickTimeRef.current < 300) return;
          lastClickTimeRef.current = currentTime;
          
          // Prevent clicks during zoom animation
          if (isZooming || selectedStoryCard) return;
          
          // Check if this was a drag (mouse moved more than 5px or took longer than 500ms)
          const clickDuration = currentTime - mouseDownTimeRef.current;
          if (hasMovedRef.current || clickDuration > 500) {
            // Reset state and ignore this as a click
            mouseDownTimeRef.current = 0;
            hasMovedRef.current = false;
            return;
          }
          
          // Update mouse position from click event
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          
          // Set near and far for better detection
          raycaster.near = 0.1;
          raycaster.far = 100;
          
          // Get all intersections from both story cards and members
          const allObjects = [...storyObjects, ...memberObjects];
          const allIntersects = raycaster.intersectObjects(allObjects, true);
          
          // Find the closest object that was clicked
          let clickedObject = null;
          let minDistance = Infinity;
          
          for (const intersect of allIntersects) {
            // Skip invisible objects
            if (!intersect.object.visible) continue;
            
            const parentGroup = findGroupWithUserData(intersect.object);
            if (!parentGroup) continue;
            
            // Check if it's a valid story card or member
            const isStoryCard = parentGroup.userData.isStoryCard || storyObjects.includes(parentGroup);
            const isMember = parentGroup.userData.isMember || memberObjects.includes(parentGroup);
            
            if ((isStoryCard || isMember) && intersect.distance < minDistance) {
              minDistance = intersect.distance;
              clickedObject = {
                group: parentGroup,
                isStoryCard,
                isMember,
                distance: intersect.distance
              };
            }
          }
          
          // Handle the click on the closest object
          if (clickedObject) {
            if (clickedObject.isMember) {
              onMemberSelect(clickedObject.group.userData as WhoWeAreMemberData);
            } else if (clickedObject.isStoryCard) {
              // Handle story card click
              setIsZooming(true);
              setSelectedStoryCard(clickedObject.group);
              
              // Trigger card preparation immediately
              if (clickedObject.group.userData && onStoryCardSelect) {
                onStoryCardSelect(clickedObject.group.userData);
              }
              
              // Zoom animation to card
              const cardPosition = clickedObject.group.position.clone();
              
              // Calculate a better camera position based on card's location
              const direction = cardPosition.clone().normalize();
              const distance = 8;
              const targetPosition = cardPosition.clone().add(direction.multiplyScalar(distance));
              
              // Store initial states for smooth reset
              const initialCameraPosition = camera.position.clone();
              const initialControlsTarget = controls.target.clone();
              
              // Store zoom state for reset
              clickedObject.group.userData.zoomFrom = {
                position: initialCameraPosition,
                target: initialControlsTarget
              };
              
              // Disable controls during animation
              controls.enabled = false;
              controls.autoRotate = false;
              
              // Animate camera
              const startPosition = camera.position.clone();
              const startTarget = controls.target.clone();
              const duration = 1200; // Fixed zoom speed
              const startTime = Date.now();
              
              const animateZoom = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Simple ease-out cubic
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                // Interpolate camera position
                camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
                
                // Interpolate camera target (where it's looking)
                const currentTarget = new THREE.Vector3();
                currentTarget.lerpVectors(startTarget, cardPosition, easeProgress);
                camera.lookAt(currentTarget);
                controls.target.copy(currentTarget);
                
                // Fade out 3D card as 2D card appears
                if (progress > 0.7 && clickedObject.group) {
                  const fadeProgress = (progress - 0.7) / 0.3; // 0 to 1 over last 30%
                  const card = clickedObject.group.children[0];
                  if (card && card.material) {
                    card.material.opacity = 0.95 * (1 - fadeProgress * 0.7); // Fade to 30% opacity
                  }
                }
                
                if (progress < 1) {
                  requestAnimationFrame(animateZoom);
                }
              };
              
              animateZoom();
            }
          }
          
          // Reset mouse state after handling click
          mouseDownTimeRef.current = 0;
          hasMovedRef.current = false;
        };

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleClick);

        // Reset camera when closing card
        const handleResetCamera = () => {
          if (!cameraRef.current || !controlsRef.current || !camera) return;
          
          // Reset zoom state
          setIsZooming(false);
          const selectedCard = selectedStoryCard;
          
          // Get the stored zoom origin or use defaults
          const zoomFrom = selectedCard?.userData?.zoomFrom || {
            position: new THREE.Vector3(0, 3, 25),
            target: new THREE.Vector3(0, 0, 0)
          };
          
          
          // Small delay to let GPU prepare for 3D rendering after 2D fadeout
          const animationDelay = 50;
          
          setTimeout(() => {
            const duration = 1200; // Same as zoom in
            const startTime = Date.now();
            const startPosition = camera.position.clone();
            const startTarget = controls.target.clone();
            
            // Enable controls smoothly during animation
            let controlsEnabled = false;
            
            const animateReset = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Smoother ease for zoom out
              const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
              
              // Interpolate camera position
              camera.position.lerpVectors(startPosition, zoomFrom.position, easeProgress);
              
              // Interpolate camera target (where it's looking)
              const currentTarget = new THREE.Vector3();
              currentTarget.lerpVectors(startTarget, zoomFrom.target, easeProgress);
              camera.lookAt(currentTarget);
              controls.target.copy(currentTarget);
              
              // Enable controls halfway through for smoother transition
              if (progress > 0.5 && !controlsEnabled) {
                controlsEnabled = true;
                controls.enabled = true;
                controls.autoRotate = true;
              }
              
              if (progress < 1) {
                requestAnimationFrame(animateReset);
              } else {
                // Ensure controls are fully updated
                controls.update();
                
                // Clean up stored zoom data
                if (selectedCard) {
                  delete selectedCard.userData.zoomFrom;
                }
              }
            };
            
            animateReset();
          }, animationDelay);
        };
        
        window.addEventListener('resetCamera', handleResetCamera);

        // Window resize
        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Animation loop with LOD
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          const time = Date.now() * 0.001;
          
          // LOD system
          const cameraPosition = camera.position;
          
          // Animate story panels with LOD
          storyObjects.forEach((obj, index) => {
            const distance = obj.position.distanceTo(cameraPosition);
            
            // LOD levels
            if (distance > 30) {
              // Far: minimal animation, hide lights
              obj.visible = true;
              if (obj.userData.light) obj.userData.light.visible = false;
              if (obj.userData.textLight) obj.userData.textLight.visible = false;
              if (obj.userData.spotLight) obj.userData.spotLight.visible = false;
              
              // Simple rotation only
              obj.rotation.y = obj.userData.originalRotation.y + time * 0.1;
            } else if (distance > 15) {
              // Medium: reduced animation
              obj.visible = true;
              if (obj.userData.light) obj.userData.light.visible = true;
              if (obj.userData.textLight) obj.userData.textLight.visible = false;
              if (obj.userData.spotLight) obj.userData.spotLight.visible = false;
              
              // Simplified floating
              const floatY = Math.sin(time * 0.3 + obj.userData.floatOffset) * 0.2;
              obj.position.y = obj.userData.originalPosition.y + floatY;
              obj.rotation.y = obj.userData.originalRotation.y + Math.sin(time * 0.2 + index) * 0.05;
            } else {
              // Near: full animation
              obj.visible = true;
              if (obj.userData.light) obj.userData.light.visible = true;
              if (obj.userData.textLight) obj.userData.textLight.visible = true;
              if (obj.userData.spotLight) obj.userData.spotLight.visible = true;
              
              const floatY = Math.sin(time * 0.3 + obj.userData.floatOffset) * 0.3;
              const floatX = Math.cos(time * 0.2 + obj.userData.floatOffset) * 0.2;
              const floatZ = Math.sin(time * 0.25 + obj.userData.floatOffset) * 0.1;
              
              obj.position.y = obj.userData.originalPosition.y + floatY;
              obj.position.x = obj.userData.originalPosition.x + floatX;
              obj.position.z = obj.userData.originalPosition.z + floatZ;
              
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
            }
          });
          
          // Animate member spheres with LOD
          memberObjects.forEach((obj) => {
            const distance = obj.position.distanceTo(cameraPosition);
            
            if (distance > 25) {
              // Far: hide profile, minimal animation
              if (obj.userData.profileGroup) obj.userData.profileGroup.visible = false;
              if (obj.userData.light) obj.userData.light.visible = false;
              
              obj.rotation.y += obj.userData.rotationSpeed * 0.5;
            } else if (distance > 12) {
              // Medium: show profile but no lookAt
              if (obj.userData.profileGroup) obj.userData.profileGroup.visible = true;
              if (obj.userData.light) obj.userData.light.visible = true;
              
              const floatY = Math.sin(time * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.3;
              obj.position.y = obj.userData.originalY + floatY;
              obj.rotation.y += obj.userData.rotationSpeed;
            } else {
              // Near: full animation
              if (obj.userData.profileGroup) {
                obj.userData.profileGroup.visible = true;
                obj.userData.profileGroup.lookAt(camera.position);
              }
              if (obj.userData.light) obj.userData.light.visible = true;
              
              const floatY = Math.sin(time * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.5;
              obj.position.y = obj.userData.originalY + floatY;
              obj.rotation.y += obj.userData.rotationSpeed;
              
              if (obj.userData.light) {
                obj.userData.light.position.copy(obj.position);
              }
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
          window.removeEventListener('mousedown', handleMouseDown);
          window.removeEventListener('mouseup', handleMouseUp);
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