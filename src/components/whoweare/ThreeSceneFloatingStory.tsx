import React, { useEffect, useRef, useState, useMemo } from 'react';
import { WhoWeAreMemberData } from '../../data/whoweareTeamMembers';

interface ThreeSceneFloatingStoryProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
  onStoryCardSelect?: (story: any) => void;
  isUIActive?: boolean;
}

const ThreeSceneFloatingStory: React.FC<ThreeSceneFloatingStoryProps> = ({ 
  members, 
  onMemberSelect, 
  onLoadComplete, 
  onLoadError,
  onStoryCardSelect,
  isUIActive = false
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
  
  // Log members when they change
  useEffect(() => {
    console.log(`🎨 ThreeSceneFloatingStory received ${members.length} members:`, members.map(m => m.name));
  }, [members]);
  
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
      title: '혼자만의 성장에 \n마침표를 찍어요.',
      content: '강의만으로는 채워지지 않는 갈증,\n동료의 피드백이 절실했던 순간들.\n우리는 \'함께\'라는 가장 강력한 변수를 더해\n성장의 방정식을 새로 써요.',
      position: generateRandomPosition(0),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    },
    {
      id: 'value1',
      title: '나의 \'아웃풋\'으로 증명하고, \n동료의 \'피드백\'으로 완성해요.',
      content: '책으로만 배우는 시대를 넘어\n나만의 결과물을 만드는 경험에 집중해요.\n서로의 아웃풋을 기꺼이 공유하고\n건설적인 피드백으로 함께 완성도를 높여요.',
      position: generateRandomPosition(1),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    },
    {
      id: 'value2',
      title: '따로 또 같이,\n느슨하게 연결돼요.',
      content: '모두가 같은 속도로 뛸 필요는 없어요.\n각자의 궤도를 존중하는 비동기(Async) 참여로\n오래 지속할 우리만의 터전(Site)을 만들어요.',
      position: generateRandomPosition(2),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    },
    {
      id: 'value3',
      title: '성장의 선순환 구조를 만들어요.',
      content: '성장에 기여한 리더에겐 합당한 보상을,\n참여하는 동료에겐 다음이 기대되는 경험을.\n서로가 서로의 성장을 돕는 투명한 시스템으로\n지속가능한 생태계를 꾸려나가요.',
      position: generateRandomPosition(3),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    },
    {
      id: 'question',
      title: '우리의 여정에 동참해요.',
      content: '결국 우리의 질문은 하나예요.\n"어떻게 하면 이 외로운 항해를\n함께, 그리고 끝까지 완주할 수 있을까?"\n그 답을 여기서 함께 찾아요.',
      position: generateRandomPosition(4),
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 }
    }
  ], []);

  useEffect(() => {
    let mounted = true;

    const initThree = async () => {
      try {
        // Debug: Log WebGL context count
        const canvasCount = document.querySelectorAll('canvas').length;
        console.log(`[ThreeScene] Canvas count before init: ${canvasCount}`);
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

        // WebGL Renderer with high performance settings
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false
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

        // Enhanced particles (stars) with depth
        const starGroups: any[] = [];
        
        // Create circular texture for particles
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
          gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 32, 32);
        }
        
        const particleTexture = new THREE.CanvasTexture(canvas);
        
        // Create multiple layers of stars for depth
        const starLayers = [
          { count: 3500, size: 0.02, range: 250, opacity: 0.6, color: 0xffffff }, // Very distant stars
          { count: 2500, size: 0.03, range: 180, opacity: 0.7, color: 0xffffdd }, // Distant stars
          { count: 2000, size: 0.05, range: 120, opacity: 0.8, color: 0xffffcc }, // Mid-distance stars
          { count: 1500, size: 0.08, range: 80, opacity: 0.9, color: 0xC3E88D }, // Closer stars
          { count: 1000, size: 0.12, range: 40, opacity: 1.0, color: 0xC3E88D }, // Nearest stars
          { count: 800, size: 0.06, range: 25, opacity: 0.85, color: 0xffffff }, // Very close small stars
        ];
        
        starLayers.forEach((layer, layerIndex) => {
          const particlesGeometry = new THREE.BufferGeometry();
          const positions = new Float32Array(layer.count * 3);
          const sizes = new Float32Array(layer.count);
          
          for (let i = 0; i < layer.count; i++) {
            const i3 = i * 3;
            // Distribute stars in a sphere for more natural look
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = Math.random() * layer.range + layer.range * 0.5;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Add size variation within each layer
            sizes[i] = layer.size * (0.5 + Math.random() * 0.5);
          }
          
          particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
          
          const particlesMaterial = new THREE.PointsMaterial({
            color: layer.color,
            size: layer.size,
            sizeAttenuation: true,
            map: particleTexture,
            transparent: true,
            opacity: layer.opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: false
          });
          
          // Store base opacity for twinkling effect
          particlesMaterial.userData = { baseOpacity: layer.opacity };
          
          const particles = new THREE.Points(particlesGeometry, particlesMaterial);
          particles.userData.layerIndex = layerIndex;
          starGroups.push(particles);
          scene.add(particles);
        });

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
            
            // Apply DPR for sharper text on high-DPI displays
            const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
            const baseWidth = 1024; // Increased from 512
            const baseHeight = 768; // Increased from 384
            
            canvas.width = baseWidth * dpr;
            canvas.height = baseHeight * dpr;
            canvas.style.width = baseWidth + 'px';
            canvas.style.height = baseHeight + 'px';
            
            if (ctx) {
              // Scale context to match DPR
              ctx.scale(dpr, dpr);
              
              // Clear canvas
              ctx.fillStyle = 'rgba(0, 0, 0, 0)';
              ctx.fillRect(0, 0, baseWidth, baseHeight);
              
              // Add stronger background for better text visibility
              const bgGradient = ctx.createRadialGradient(baseWidth/2, baseHeight/2, 0, baseWidth/2, baseHeight/2, baseWidth * 0.6);
              bgGradient.addColorStop(0, 'rgba(10, 10, 10, 0.95)');
              bgGradient.addColorStop(0.7, 'rgba(10, 10, 10, 0.85)');
              bgGradient.addColorStop(1, 'rgba(10, 10, 10, 0.7)');
              ctx.fillStyle = bgGradient;
              ctx.fillRect(0, 0, baseWidth, baseHeight);
              
              // Add subtle glow background for title
              if (panel.title) {
                const titleGlow = ctx.createRadialGradient(baseWidth/2, 150, 0, baseWidth/2, 150, 300);
                titleGlow.addColorStop(0, 'rgba(195, 232, 141, 0.15)');
                titleGlow.addColorStop(1, 'rgba(195, 232, 141, 0)');
                ctx.fillStyle = titleGlow;
                ctx.fillRect(0, 0, baseWidth, 300);
              }
              
              // Title with maximum clarity
              if (panel.title) {
                const titleLines = panel.title.split('\n');
                const lineHeight = 90; // Doubled for new resolution
                const totalHeight = (titleLines.length - 1) * lineHeight;
                const startY = 150 - totalHeight / 2; // Doubled from 75

                // Multiple shadow layers for better visibility
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 20;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 3;
                
                // Draw title multiple times for bold effect
                ctx.fillStyle = '#C3E88D';
                ctx.font = '600 74px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'; // Doubled font size
                ctx.textAlign = 'center';
                
                titleLines.forEach((line, i) => {
                  const y = startY + i * lineHeight;
                  // Draw shadow layer
                  ctx.fillText(line, baseWidth/2, y);
                  
                  // Draw main text
                  ctx.shadowBlur = 5;
                  ctx.shadowOffsetY = 1;
                  ctx.fillText(line, baseWidth/2, y);
                });
                
                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;
              }
              
              // Content with maximum readability
              ctx.fillStyle = '#ffffff';
              ctx.font = '400 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'; // Doubled font size
              ctx.textAlign = 'center';
              ctx.shadowColor = '#000000';
              ctx.shadowBlur = 20;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 3;
              
              const lines = panel.content.split('\n');
              lines.forEach((line, i) => {
                // Draw shadow layer
                ctx.fillText(line, baseWidth/2, 320 + i * 70); // Doubled positions
              });
              
              // Draw text again with less shadow for crisp edges
              ctx.shadowBlur = 5;
              ctx.shadowOffsetY = 2;
              lines.forEach((line, i) => {
                ctx.fillText(line, baseWidth/2, 320 + i * 70); // Doubled positions
              });
              
              // Final layer for maximum sharpness
              ctx.shadowBlur = 0;
              ctx.shadowOffsetY = 0;
              lines.forEach((line, i) => {
                ctx.fillText(line, baseWidth/2, 320 + i * 70); // Doubled positions
              });
            }
            
            const texture = new THREE.CanvasTexture(canvas);
            // Optimize texture filtering for clarity
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            texture.generateMipmaps = true;
            texture.needsUpdate = true;
            
            return texture;
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

        // Create shuffled indices for random placement
        const shuffledIndices = Array.from({ length: members.length }, (_, i) => i);
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }

        members.forEach((member, originalIndex) => {
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
          
          // Position in space with better distribution using shuffled index
          const shuffledIndex = shuffledIndices[originalIndex];
          const angle = (shuffledIndex / members.length) * Math.PI * 2;
          const radius = 12 + (shuffledIndex % 2) * 3; // Alternate between two radius levels
          const height = Math.sin(angle * 2) * 3 + (shuffledIndex % 3 - 1) * 1.5; // Vary heights more
          
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
          light.visible = false; // Initially hide the light
          scene.add(light);
          group.userData.light = light;
          
          // Initial scale animation for member spheres
          group.scale.set(0, 0, 0);
          profileGroup.visible = false; // Initially hide profile
          const memberDelay = 1500 + originalIndex * 250; // Start after story cards finish
          setTimeout(() => {
            // Turn on the light when animation starts
            light.visible = true;
            
            const scaleAnimation = () => {
              group.scale.x += (1 - group.scale.x) * 0.08;
              group.scale.y += (1 - group.scale.y) * 0.08;
              group.scale.z += (1 - group.scale.z) * 0.08;
              
              // Show profile when scale is large enough
              if (group.scale.x > 0.5 && !profileGroup.visible) {
                profileGroup.visible = true;
              }
              
              if (group.scale.x < 0.99) {
                requestAnimationFrame(scaleAnimation);
              }
            };
            scaleAnimation();
          }, memberDelay);
          
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
          
          // Prevent clicks during zoom animation or when 2D UI is active
          if (isZooming || selectedStoryCard || isUIActive) return;
          
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
              // Handle story card click with stage-separated animation
              setIsZooming(true);
              setSelectedStoryCard(clickedObject.group);
              
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
              
              // Stage-separated animation parameters
              const startPosition = camera.position.clone();
              const startTarget = controls.target.clone();
              const zoomDuration = 1200;
              const stage2Start = 800; // Start fading 3D at 66%
              const stage3Start = 1000; // Start showing 2D at 83%
              const startTime = Date.now();
              
              // Delay card trigger to stage 3
              setTimeout(() => {
                if (clickedObject.group.userData && onStoryCardSelect) {
                  onStoryCardSelect(clickedObject.group.userData);
                }
              }, stage3Start);
              
              const animateZoom = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / zoomDuration, 1);
                
                // Use easeInOutCubic for smooth motion
                const easeProgress = progress < 0.5 
                  ? 4 * progress * progress * progress 
                  : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                // Interpolate camera position
                camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
                
                // Interpolate camera target (where it's looking)
                const currentTarget = new THREE.Vector3();
                currentTarget.lerpVectors(startTarget, cardPosition, easeProgress);
                camera.lookAt(currentTarget);
                controls.target.copy(currentTarget);
                
                // Stage-based opacity control
                if (elapsed >= stage2Start) {
                  // Stage 2: Start fading out 3D objects
                  const fadeProgress = Math.min((elapsed - stage2Start) / (zoomDuration - stage2Start), 1);
                  
                  // Fade other story cards
                  storyObjects.forEach(obj => {
                    if (obj !== clickedObject.group) {
                      const card = obj.children[0];
                      if (card && card.material) {
                        card.material.opacity = 0.95 * (1 - fadeProgress * 0.8);
                      }
                    }
                  });
                  
                  // Fade member spheres
                  memberObjects.forEach(obj => {
                    const sphere = obj.children.find((child: any) => 
                      child.geometry instanceof THREE.SphereGeometry && child.name !== 'clickHelper'
                    );
                    if (sphere && sphere.material) {
                      sphere.material.opacity = 0.5 * (1 - fadeProgress * 0.8);
                    }
                  });
                  
                  // Also fade the focused panel slightly for smooth transition
                  if (elapsed >= stage3Start && clickedObject.group) {
                    const panelFadeProgress = Math.min((elapsed - stage3Start) / (zoomDuration - stage3Start), 1);
                    const card = clickedObject.group.children[0];
                    if (card && card.material) {
                      card.material.opacity = 0.95 * (1 - panelFadeProgress * 0.3);
                    }
                  }
                } else {
                  // Stage 1: Pure zoom, keep everything visible with subtle fade
                  storyObjects.forEach(obj => {
                    if (obj !== clickedObject.group) {
                      const card = obj.children[0];
                      if (card && card.material) {
                        card.material.opacity = 0.95 * (1 - easeProgress * 0.3);
                      }
                    }
                  });
                  
                  memberObjects.forEach(obj => {
                    const sphere = obj.children.find((child: any) => 
                      child.geometry instanceof THREE.SphereGeometry && child.name !== 'clickHelper'
                    );
                    if (sphere && sphere.material) {
                      sphere.material.opacity = 0.5 * (1 - easeProgress * 0.3);
                    }
                  });
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

        // Reset camera with stage-separated animation
        const handleResetCamera = () => {
          if (!cameraRef.current || !controlsRef.current || !camera) return;
          
          // Reset zoom state
          setIsZooming(false);
          const selectedCard = selectedStoryCard;
          setSelectedStoryCard(null);
          
          // Get the stored zoom origin or use defaults
          const zoomFrom = selectedCard?.userData?.zoomFrom || {
            position: new THREE.Vector3(0, 3, 25),
            target: new THREE.Vector3(0, 0, 0)
          };
          
          // Restore focused panel opacity immediately
          if (selectedCard) {
            const card = selectedCard.children[0];
            if (card && card.material) {
              card.material.opacity = 0.95;
            }
          }
          
          // Small delay to let 2D fade out complete
          const animationDelay = 50;
          
          setTimeout(() => {
            const duration = 800; // Faster for snappier feel
            const stage2Start = 150; // Start restoring 3D objects early
            const startTime = Date.now();
            const startPosition = camera.position.clone();
            const startTarget = controls.target.clone();
            
            const animateReset = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // Use easeOutCubic for smooth deceleration
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              
              // Interpolate camera position
              camera.position.lerpVectors(startPosition, zoomFrom.position, easeProgress);
              
              // Interpolate camera target
              const currentTarget = new THREE.Vector3();
              currentTarget.lerpVectors(startTarget, zoomFrom.target, easeProgress);
              camera.lookAt(currentTarget);
              controls.target.copy(currentTarget);
              
              // Stage-based visibility restoration
              if (elapsed >= stage2Start) {
                // Restore 3D object visibility
                const restoreProgress = Math.min((elapsed - stage2Start) / (duration - stage2Start), 1);
                
                // Restore story cards
                storyObjects.forEach(obj => {
                  const card = obj.children[0];
                  if (card && card.material) {
                    card.material.opacity = 0.15 + restoreProgress * 0.8;
                  }
                });
                
                // Restore member spheres
                memberObjects.forEach(obj => {
                  const sphere = obj.children.find((child: any) => 
                    child.geometry instanceof THREE.SphereGeometry && child.name !== 'clickHelper'
                  );
                  if (sphere && sphere.material) {
                    sphere.material.opacity = 0.1 + restoreProgress * 0.4;
                  }
                });
              }
              
              if (progress < 1) {
                requestAnimationFrame(animateReset);
              } else {
                // Ensure all objects are fully visible
                storyObjects.forEach(obj => {
                  const card = obj.children[0];
                  if (card && card.material) {
                    card.material.opacity = 0.95;
                  }
                });
                
                memberObjects.forEach(obj => {
                  const sphere = obj.children.find((child: any) => 
                    child.geometry instanceof THREE.SphereGeometry && child.name !== 'clickHelper'
                  );
                  if (sphere && sphere.material) {
                    sphere.material.opacity = 0.5;
                    sphere.material.emissive = new THREE.Color(0x000000);
                    sphere.material.emissiveIntensity = 0;
                  }
                });
                
                // Re-enable controls
                controls.enabled = true;
                controls.autoRotate = true;
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
            
            // Only show profile if scale is large enough
            const showProfile = obj.scale.x > 0.5;
            
            if (distance > 25) {
              // Far: show profile if scale allows, minimal animation
              if (obj.userData.profileGroup) obj.userData.profileGroup.visible = showProfile;
              if (obj.userData.light) obj.userData.light.visible = false;
              
              obj.rotation.y += obj.userData.rotationSpeed * 0.5;
            } else if (distance > 12) {
              // Medium: show profile if scale allows but no lookAt
              if (obj.userData.profileGroup) obj.userData.profileGroup.visible = showProfile;
              if (obj.userData.light) obj.userData.light.visible = obj.scale.x > 0.1;
              
              const floatY = Math.sin(time * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.3;
              obj.position.y = obj.userData.originalY + floatY;
              obj.rotation.y += obj.userData.rotationSpeed;
            } else {
              // Near: full animation
              if (obj.userData.profileGroup) {
                obj.userData.profileGroup.visible = showProfile;
                if (showProfile) {
                  obj.userData.profileGroup.lookAt(camera.position);
                }
              }
              if (obj.userData.light) obj.userData.light.visible = obj.scale.x > 0.1;
              
              const floatY = Math.sin(time * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.5;
              obj.position.y = obj.userData.originalY + floatY;
              obj.rotation.y += obj.userData.rotationSpeed;
              
              if (obj.userData.light) {
                obj.userData.light.position.copy(obj.position);
              }
            }
          });
          
          // Subtle star rotation and twinkling effect
          starGroups.forEach((starGroup, index) => {
            // Farther stars rotate slower for realistic parallax
            const speedFactor = 1 - (index * 0.2);
            starGroup.rotation.y += 0.00005 * speedFactor;
            starGroup.rotation.x += 0.00002 * speedFactor;
            
            // Add twinkling effect by modulating opacity
            const material = starGroup.material as any;
            if (material) {
              // Create a pulsing effect with different frequencies for each layer
              const twinkleSpeed = 2 + index * 0.5;
              const twinkleAmount = 0.3 - (index * 0.05); // Distant stars twinkle more
              material.opacity = material.userData.baseOpacity + 
                Math.sin(time * twinkleSpeed) * twinkleAmount * material.userData.baseOpacity;
            }
          });
          
          controls.update();
          renderer.render(scene, camera);
        };

        animate();
        onLoadComplete();

        // Cleanup
        return () => {
          console.log('[ThreeScene] Starting cleanup...');
          mounted = false;
          window.removeEventListener('mousedown', handleMouseDown);
          window.removeEventListener('mouseup', handleMouseUp);
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('click', handleClick);
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('resetCamera', handleResetCamera);
          
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
          }

          // More thorough cleanup of Three.js resources
          if (sceneRef.current) {
            sceneRef.current.traverse((object: any) => {
              if (object.geometry) {
                object.geometry.dispose();
              }
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach((material: any) => {
                    if (material.map) material.map.dispose();
                    if (material.normalMap) material.normalMap.dispose();
                    if (material.roughnessMap) material.roughnessMap.dispose();
                    material.dispose();
                  });
                } else {
                  if (object.material.map) object.material.map.dispose();
                  if (object.material.normalMap) object.material.normalMap.dispose();
                  if (object.material.roughnessMap) object.material.roughnessMap.dispose();
                  object.material.dispose();
                }
              }
              // Remove from parent
              if (object.parent) {
                object.parent.remove(object);
              }
            });
            
            // Clear the scene
            while(sceneRef.current.children.length > 0) {
              sceneRef.current.remove(sceneRef.current.children[0]);
            }
          }
          
          // Dispose controls
          if (controlsRef.current) {
            controlsRef.current.dispose();
            controlsRef.current = null;
          }
          
          // Force WebGL context loss and cleanup
          if (rendererRef.current) {
            const gl = rendererRef.current.getContext();
            const loseContext = gl?.getExtension('WEBGL_lose_context');
            if (loseContext) {
              loseContext.loseContext();
            }
            
            rendererRef.current.renderLists.dispose();
            rendererRef.current.dispose();
            rendererRef.current.forceContextLoss();
            
            if (mountRef.current && rendererRef.current.domElement) {
              mountRef.current.removeChild(rendererRef.current.domElement);
            }
            
            rendererRef.current = null;
          }
          
          // Clear all refs
          sceneRef.current = null;
          cameraRef.current = null;
          
          // Debug: Log cleanup completion
          const canvasCountAfter = document.querySelectorAll('canvas').length;
          console.log(`[ThreeScene] Cleanup complete. Canvas count: ${canvasCountAfter}`);
        };
      } catch (error) {
        console.error('Three.js initialization error:', error);
        onLoadError('WebGL 초기화 중 오류가 발생했습니다.');
      }
    };

    initThree();

    return () => {
      mounted = false;
      // Clean up Three.js resources when component unmounts or members change
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && mountRef.current && rendererRef.current.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        // Clean up scene objects
        sceneRef.current.traverse((child: any) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((material: any) => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
      // Reset state so scene can reinitialize with new members
      setIsThreeLoaded(false);
    };
  }, [members, onMemberSelect, onLoadComplete, onLoadError]);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ThreeSceneFloatingStory;