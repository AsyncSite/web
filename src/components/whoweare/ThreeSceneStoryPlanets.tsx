import React, { useEffect, useRef, useState } from 'react';
import { WhoWeAreMemberData } from '../../pages/WhoWeArePage';

interface ThreeSceneStoryPlanetsProps {
  members: WhoWeAreMemberData[];
  onMemberSelect: (member: WhoWeAreMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

const ThreeSceneStoryPlanets: React.FC<ThreeSceneStoryPlanetsProps> = ({ 
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
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<string | null>(null);

  // Story planets data
  const storyPlanets = [
    {
      id: 'core',
      title: 'AsyncSite',
      subtitle: '지속가능한 성장 생태계',
      content: '각자의 궤도를 도는 개발자들이\n서로의 중력이 되어주는 곳',
      color: '#C3E88D',
      darkColor: '#7CB342',
      size: 3,
      position: { x: 0, y: 0, z: 0 },
      isCenter: true
    },
    {
      id: 'origin',
      title: '시작',
      subtitle: '점으로 흩어진 지식의 시대',
      content: '수많은 강의를 완강해도\n연결되지 않는 단편적인 지식들',
      color: '#82AAFF',
      darkColor: '#448AFF',
      size: 2,
      position: { x: -8, y: 2, z: -3 },
      orbitRadius: 8,
      orbitSpeed: 0.3
    },
    {
      id: 'value1',
      title: '가치 1',
      subtitle: '큰 그림을 그려요',
      content: '코드 리뷰와 동료 피드백을 통해\n학습한 지식을 실제 경험으로',
      color: '#F78C6C',
      darkColor: '#FF5722',
      size: 1.8,
      position: { x: 6, y: -1, z: 5 },
      orbitRadius: 7,
      orbitSpeed: 0.4
    },
    {
      id: 'value2',
      title: '가치 2',
      subtitle: '느슨하지만 끈끈해요',
      content: '각자의 속도와 리듬을 존중하는\n비동기적(Async) 참여',
      color: '#C792EA',
      darkColor: '#7C4DFF',
      size: 1.8,
      position: { x: -5, y: -2, z: 6 },
      orbitRadius: 6.5,
      orbitSpeed: 0.35
    },
    {
      id: 'value3',
      title: '가치 3',
      subtitle: '지속가능함을 추구해요',
      content: '리더에게 합당한 보상,\n멤버들에게는 다음 시즌을 기대하게',
      color: '#89DDFF',
      darkColor: '#00BCD4',
      size: 1.8,
      position: { x: 4, y: 3, z: -6 },
      orbitRadius: 7.5,
      orbitSpeed: 0.25
    },
    {
      id: 'question',
      title: '우리의 질문',
      subtitle: '',
      content: '"어떻게 하면, 이 외로운 여정을\n함께, 그리고 꾸준히 걸어갈 수 있을까?"',
      color: '#FFCB6B',
      darkColor: '#FFA000',
      size: 2.2,
      position: { x: 0, y: -3, z: 8 },
      orbitRadius: 9,
      orbitSpeed: 0.2
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
        scene.background = new THREE.Color(0x0a0a0a);
        scene.fog = new THREE.FogExp2(0x0a0a0a, 0.01);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          60,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(15, 10, 20);
        camera.lookAt(0, 0, 0);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 15;
        controls.maxDistance = 40;
        controls.maxPolarAngle = Math.PI * 0.85;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        // Key light
        const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
        keyLight.position.set(10, 15, 10);
        keyLight.castShadow = true;
        scene.add(keyLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4488ff, 0.4);
        fillLight.position.set(-10, 5, -10);
        scene.add(fillLight);

        // Background stars
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const starPositions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
          const radius = 50 + Math.random() * 150;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          
          starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
          starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
          starPositions[i + 2] = radius * Math.cos(phi);
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.1,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending
        });
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Create story planets
        const storyObjects: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        storyPlanets.forEach((story) => {
          const group = new THREE.Group();
          group.userData = story;
          
          // Planet sphere
          const geometry = new THREE.SphereGeometry(story.size, 64, 64);
          const material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(story.color),
            metalness: 0.3,
            roughness: 0.4,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            transparent: true,
            opacity: 0.9,
            emissive: new THREE.Color(story.darkColor || story.color),
            emissiveIntensity: 0.2
          });
          
          const sphere = new THREE.Mesh(geometry, material);
          sphere.castShadow = true;
          sphere.receiveShadow = true;
          group.add(sphere);
          
          // Inner glow
          const glowGeometry = new THREE.SphereGeometry(story.size * 0.98, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(story.color),
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
          });
          const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
          group.add(glowSphere);
          
          // Atmosphere ring (for non-center planets)
          if (!story.isCenter) {
            const ringGeometry = new THREE.RingGeometry(story.size * 1.1, story.size * 1.3, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
              color: new THREE.Color(story.color),
              transparent: true,
              opacity: 0.2,
              side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
          }
          
          // Text canvas for planet surface
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 512;
          canvas.height = 256;
          
          if (ctx) {
            // Clear canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 0)';
            ctx.fillRect(0, 0, 512, 256);
            
            // Title
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(story.title, 256, 80);
            
            // Subtitle
            if (story.subtitle) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
              ctx.fillText(story.subtitle, 256, 120);
            }
          }
          
          const texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;
          
          // Apply texture to a plane (simulating text on planet)
          const textMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
          });
          
          const textPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(story.size * 2, story.size),
            textMaterial
          );
          textPlane.position.z = story.size + 0.1;
          group.add(textPlane);
          
          // Position
          group.position.set(story.position.x, story.position.y, story.position.z);
          
          // Store animation data
          if (story.orbitRadius) {
            group.userData.orbitRadius = story.orbitRadius;
            group.userData.orbitSpeed = story.orbitSpeed || 0.3;
            group.userData.orbitAngle = Math.random() * Math.PI * 2;
          }
          
          // Point light
          const light = new THREE.PointLight(new THREE.Color(story.color), 0.5, story.size * 10);
          light.position.copy(group.position);
          scene.add(light);
          group.userData.light = light;
          
          scene.add(group);
          storyObjects.push(group);
        });

        // Create member spheres (smaller, orbiting around story planets)
        const memberObjects: any[] = [];
        
        members.forEach((member, index) => {
          const group = new THREE.Group();
          group.userData = member;
          
          // Glass sphere
          const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
          const sphereMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(member.color),
            metalness: 0.0,
            roughness: 0.0,
            transmission: 0.9,
            transparent: true,
            opacity: 0.4,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            ior: 1.5,
            thickness: 0.5
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          group.add(sphere);
          
          // Profile inside
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 256;
          canvas.height = 256;
          
          if (ctx) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, 256, 256);
            
            const centerX = 128;
            const centerY = 128;
            
            if (member.profileImage && imageMap.has(member.id)) {
              const img = imageMap.get(member.id)!;
              ctx.save();
              ctx.beginPath();
              ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              ctx.drawImage(img, centerX - 60, centerY - 60, 120, 120);
              ctx.restore();
            } else {
              ctx.fillStyle = member.color;
              ctx.beginPath();
              ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 40px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(member.initials, centerX, centerY);
            }
          }
          
          const profileTexture = new THREE.CanvasTexture(canvas);
          const profileMaterial = new THREE.MeshBasicMaterial({
            map: profileTexture,
            transparent: true
          });
          const profilePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(1.2, 1.2),
            profileMaterial
          );
          group.add(profilePlane);
          
          // Assign to orbit around a story planet
          const storyIndex = Math.floor(index % (storyPlanets.length - 1)) + 1; // Skip center planet
          const parentStory = storyObjects[storyIndex];
          
          group.userData.parentStory = parentStory;
          group.userData.orbitRadius = 3 + Math.random() * 2;
          group.userData.orbitSpeed = 0.5 + Math.random() * 0.5;
          group.userData.orbitAngle = (index / members.length) * Math.PI * 2;
          group.userData.orbitHeight = (Math.random() - 0.5) * 2;
          
          scene.add(group);
          memberObjects.push(group);
        });

        // Mouse events
        const handleMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          
          // Check story planets
          const storyIntersects = raycaster.intersectObjects(storyObjects, true);
          
          // Reset all story planets
          storyObjects.forEach(obj => {
            const sphere = obj.children[0] as any;
            if (sphere && sphere.material) {
              sphere.material.emissiveIntensity = 0.2;
            }
          });
          
          if (storyIntersects.length > 0) {
            const hoveredStory = storyIntersects[0].object.parent;
            if (hoveredStory) {
              setHoveredObject(hoveredStory.userData.id);
              const sphere = hoveredStory.children[0] as any;
              if (sphere && sphere.material) {
                sphere.material.emissiveIntensity = 0.4;
              }
              document.body.style.cursor = 'pointer';
            }
          } else {
            // Check member spheres
            const memberIntersects = raycaster.intersectObjects(memberObjects, true);
            
            if (memberIntersects.length > 0) {
              document.body.style.cursor = 'pointer';
            } else {
              setHoveredObject(null);
              document.body.style.cursor = 'default';
            }
          }
        };

        const handleClick = (event: MouseEvent) => {
          raycaster.setFromCamera(mouse, camera);
          
          // Check story planets
          const storyIntersects = raycaster.intersectObjects(storyObjects, true);
          
          if (storyIntersects.length > 0) {
            const clickedStory = storyIntersects[0].object.parent;
            if (clickedStory) {
              setSelectedStory(clickedStory.userData.id);
              // Could open a modal or expand the story here
            }
          } else {
            // Check member spheres
            const memberIntersects = raycaster.intersectObjects(memberObjects, true);
            
            if (memberIntersects.length > 0 && memberIntersects[0].object.parent) {
              const clickedMember = memberIntersects[0].object.parent.userData as WhoWeAreMemberData;
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

        // Animation loop
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          const time = Date.now() * 0.001;
          
          // Animate story planets
          storyObjects.forEach((obj) => {
            // Rotation
            obj.rotation.y += 0.002;
            
            // Orbital motion for non-center planets
            if (obj.userData.orbitRadius && !obj.userData.isCenter) {
              obj.userData.orbitAngle += obj.userData.orbitSpeed * 0.01;
              
              const x = Math.cos(obj.userData.orbitAngle) * obj.userData.orbitRadius;
              const z = Math.sin(obj.userData.orbitAngle) * obj.userData.orbitRadius;
              const y = Math.sin(obj.userData.orbitAngle * 2) * 2;
              
              obj.position.set(x, y, z);
              
              // Update light position
              if (obj.userData.light) {
                obj.userData.light.position.copy(obj.position);
              }
            }
            
            // Keep text facing camera
            const textPlane = obj.children[3];
            if (textPlane) {
              textPlane.lookAt(camera.position);
            }
          });
          
          // Animate member spheres around their parent story planets
          memberObjects.forEach((obj) => {
            const parent = obj.userData.parentStory;
            if (parent) {
              obj.userData.orbitAngle += obj.userData.orbitSpeed * 0.02;
              
              const localX = Math.cos(obj.userData.orbitAngle) * obj.userData.orbitRadius;
              const localZ = Math.sin(obj.userData.orbitAngle) * obj.userData.orbitRadius;
              const localY = obj.userData.orbitHeight + Math.sin(time + obj.userData.orbitAngle) * 0.3;
              
              obj.position.set(
                parent.position.x + localX,
                parent.position.y + localY,
                parent.position.z + localZ
              );
              
              // Face camera
              obj.lookAt(camera.position);
            }
          });
          
          // Subtle star rotation
          stars.rotation.y += 0.0001;
          
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
  }, [members, onMemberSelect, onLoadComplete, onLoadError, hoveredObject, selectedStory]);

  return (
    <div ref={mountRef} style={{ width: '100vw', height: '100vh' }}>
      {/* Story tooltip */}
      {hoveredObject && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '20px 30px',
          color: '#fff',
          maxWidth: '400px',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 100
        }}>
          {storyPlanets.find(s => s.id === hoveredObject)?.content.split('\n').map((line, i) => (
            <div key={i} style={{ margin: '4px 0' }}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreeSceneStoryPlanets;