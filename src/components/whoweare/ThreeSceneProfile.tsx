import React, { useEffect, useRef, useState } from 'react';

// Define member data interface for this component
export interface ThreeSceneProfileMemberData {
  id: string;
  name: string;
  initials: string;
  role: string;
  quote: string;
  story: string;
  color: string;
  darkColor: string;
  position: { x: number; y: number; z: number };
}

interface ThreeSceneProfileProps {
  members: ThreeSceneProfileMemberData[];
  onMemberSelect: (member: ThreeSceneProfileMemberData | null) => void;
  onLoadComplete: () => void;
  onLoadError: (error: string) => void;
}

const ThreeSceneProfile: React.FC<ThreeSceneProfileProps> = ({ 
  members, 
  onMemberSelect, 
  onLoadComplete, 
  onLoadError 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);
  const selectedCardRef = useRef<any>(null);
  const originalPositionsRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    let mounted = true;

    const initThree = async () => {
      try {
        // Dynamic import of Three.js
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
        const { CSS2DRenderer, CSS2DObject } = await import('three/examples/jsm/renderers/CSS2DRenderer');
        
        if (!mounted || !mountRef.current) return;

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
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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

        // Controls setup
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 30;
        controls.maxPolarAngle = Math.PI * 0.495;
        controls.enablePan = false;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(0, 20, 0);
        spotLight.angle = Math.PI / 3;
        spotLight.penumbra = 0.1;
        spotLight.decay = 2;
        spotLight.distance = 50;
        spotLight.castShadow = true;
        scene.add(spotLight);

        // Add rim lighting for depth
        const rimLight1 = new THREE.DirectionalLight(0x6366f1, 0.3);
        rimLight1.position.set(10, 10, 10);
        scene.add(rimLight1);

        const rimLight2 = new THREE.DirectionalLight(0xC3E88D, 0.3);
        rimLight2.position.set(-10, 10, -10);
        scene.add(rimLight2);

        // Floor
        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        const floorMaterial = new THREE.MeshPhongMaterial({
          color: 0x0a0a0a,
          emissive: 0x0a0a0a,
          emissiveIntensity: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Particles background
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 300;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 40;
          positions[i + 1] = Math.random() * 20 - 2;
          positions[i + 2] = (Math.random() - 0.5) * 40;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
          color: 0xC3E88D,
          size: 0.05,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        // Profile cards
        const cardObjects: any[] = [];
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Create profile card function
        const createProfileCard = (member: ThreeSceneProfileMemberData, index: number) => {
          const group = new THREE.Group();
          group.userData = member;
          
          // Card container
          const cardWidth = 3;
          const cardHeight = 4;
          const cardDepth = 0.2;
          
          // Card background
          const cardGeometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);
          const cardMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.2,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
            side: THREE.DoubleSide,
            emissive: new THREE.Color(member.color),
            emissiveIntensity: 0.05
          });
          const card = new THREE.Mesh(cardGeometry, cardMaterial);
          card.castShadow = true;
          card.receiveShadow = true;
          group.add(card);

          // Profile picture area (top part of card)
          const profilePicGeometry = new THREE.PlaneGeometry(cardWidth - 0.2, cardWidth - 0.2);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = 256;
          canvas.height = 256;
          
          if (context) {
            // Create gradient background
            const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
            gradient.addColorStop(0, member.color);
            gradient.addColorStop(1, member.darkColor);
            context.fillStyle = gradient;
            context.fillRect(0, 0, 256, 256);
            
            // Draw initials
            context.fillStyle = '#ffffff';
            context.font = 'bold 120px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(member.initials, 128, 128);
          }
          
          const profileTexture = new THREE.CanvasTexture(canvas);
          const profileMaterial = new THREE.MeshBasicMaterial({
            map: profileTexture,
            transparent: true
          });
          const profilePic = new THREE.Mesh(profilePicGeometry, profileMaterial);
          profilePic.position.y = cardHeight / 2 - cardWidth / 2;
          profilePic.position.z = cardDepth / 2 + 0.01;
          group.add(profilePic);

          // CSS2D Label for text info (always visible)
          const labelDiv = document.createElement('div');
          labelDiv.className = 'whoweare-profile-label';
          labelDiv.innerHTML = `
            <div class="whoweare-profile-name">${member.name}</div>
            <div class="whoweare-profile-role">${member.role}</div>
          `;
          labelDiv.style.cssText = `
            font-family: 'Pretendard', sans-serif;
            text-align: center;
            color: white;
            background: rgba(0,0,0,0.8);
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid ${member.color}40;
            backdrop-filter: blur(10px);
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 150px;
          `;
          
          const label = new CSS2DObject(labelDiv);
          label.position.set(0, -cardHeight / 2 - 0.5, 0);
          group.add(label);

          // Add hover effect to label
          labelDiv.addEventListener('mouseenter', () => {
            labelDiv.style.transform = 'scale(1.1)';
            labelDiv.style.background = 'rgba(0,0,0,0.95)';
            labelDiv.style.borderColor = member.color;
          });
          
          labelDiv.addEventListener('mouseleave', () => {
            labelDiv.style.transform = 'scale(1)';
            labelDiv.style.background = 'rgba(0,0,0,0.8)';
            labelDiv.style.borderColor = `${member.color}40`;
          });

          // Border glow
          const borderGeometry = new THREE.BoxGeometry(
            cardWidth + 0.1, 
            cardHeight + 0.1, 
            cardDepth + 0.1
          );
          const borderMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(member.color),
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
          });
          const border = new THREE.Mesh(borderGeometry, borderMaterial);
          group.add(border);

          // Position in a circle
          const angle = (index / members.length) * Math.PI * 2;
          const radius = 8;
          group.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
          );
          
          // Face the center
          group.lookAt(0, 0, 0);
          group.rotateY(Math.PI);
          
          // Store original position
          originalPositionsRef.current.set(member.id, {
            position: group.position.clone(),
            rotation: group.rotation.clone(),
            scale: group.scale.clone()
          });
          
          group.userData.floatOffset = Math.random() * Math.PI * 2;
          group.userData.baseY = group.position.y;
          
          return group;
        };

        // Create all profile cards
        members.forEach((member, index) => {
          const card = createProfileCard(member, index);
          scene.add(card);
          cardObjects.push(card);
        });

        // Mouse events
        const handleMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(cardObjects, true);
          
          // Reset all cards
          cardObjects.forEach(obj => {
            if (obj !== selectedCardRef.current) {
              obj.scale.set(1, 1, 1);
              const border = obj.children.find((child: any) => child.material?.side === THREE.BackSide);
              if (border) {
                border.material.opacity = 0.3;
              }
            }
          });
          
          // Highlight hovered card
          if (intersects.length > 0 && !selectedCardRef.current) {
            const hoveredCard = intersects[0].object.parent;
            if (hoveredCard && hoveredCard.userData.id) {
              hoveredCard.scale.set(1.1, 1.1, 1.1);
              const border = hoveredCard.children.find((child: any) => child.material?.side === THREE.BackSide);
              if (border) {
                (border as any).material.opacity = 0.6;
              }
              document.body.style.cursor = 'pointer';
            }
          } else if (!selectedCardRef.current) {
            document.body.style.cursor = 'default';
          }
        };

        const handleClick = () => {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(cardObjects, true);
          
          if (intersects.length > 0 && intersects[0].object.parent) {
            const clickedCard = intersects[0].object.parent;
            
            if (clickedCard.userData.id) {
              if (selectedCardRef.current === clickedCard) {
                // Deselect - return to original position
                const original = originalPositionsRef.current.get(clickedCard.userData.id);
                if (original) {
                  clickedCard.position.copy(original.position);
                  clickedCard.rotation.copy(original.rotation);
                  clickedCard.scale.copy(original.scale);
                }
                selectedCardRef.current = null;
                onMemberSelect(null);
                controls.enabled = true;
              } else {
                // Select - move to center and enlarge
                if (selectedCardRef.current) {
                  // Return previous card to original position
                  const prevOriginal = originalPositionsRef.current.get(selectedCardRef.current.userData.id);
                  if (prevOriginal) {
                    selectedCardRef.current.position.copy(prevOriginal.position);
                    selectedCardRef.current.rotation.copy(prevOriginal.rotation);
                    selectedCardRef.current.scale.copy(prevOriginal.scale);
                  }
                }
                
                selectedCardRef.current = clickedCard;
                clickedCard.position.set(0, 0, 8);
                clickedCard.rotation.set(0, 0, 0);
                clickedCard.scale.set(1.5, 1.5, 1.5);
                onMemberSelect(clickedCard.userData as ThreeSceneProfileMemberData);
                controls.enabled = false;
              }
            }
          } else if (selectedCardRef.current) {
            // Click outside - deselect
            const original = originalPositionsRef.current.get(selectedCardRef.current.userData.id);
            if (original) {
              selectedCardRef.current.position.copy(original.position);
              selectedCardRef.current.rotation.copy(original.rotation);
              selectedCardRef.current.scale.copy(original.scale);
            }
            selectedCardRef.current = null;
            onMemberSelect(null);
            controls.enabled = true;
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
          
          // Animate cards (floating effect)
          cardObjects.forEach((card) => {
            if (card !== selectedCardRef.current) {
              card.position.y = card.userData.baseY + Math.sin(elapsedTime + card.userData.floatOffset) * 0.2;
              card.rotation.y += 0.002;
            }
          });
          
          // Rotate particles
          particles.rotation.y += 0.0001;
          
          // Pulse selected card
          if (selectedCardRef.current) {
            const scale = 1.5 + Math.sin(elapsedTime * 2) * 0.05;
            selectedCardRef.current.scale.set(scale, scale, scale);
          }
          
          controls.update();
          renderer.render(scene, camera);
          labelRenderer.render(scene, camera);
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
  }, [members, onMemberSelect, onLoadComplete, onLoadError]);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ThreeSceneProfile;