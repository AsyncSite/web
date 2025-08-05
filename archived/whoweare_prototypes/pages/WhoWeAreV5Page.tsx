import React, { useState, useEffect, useRef, useCallback } from 'react';
import './WhoWeAreV5Page.css';

// Team member data with code snippets
export const whoweareV5TeamMembers = [
  {
    id: 'rene-choi',
    name: 'RENE CHOI',
    initials: 'RC',
    role: 'Product Architect',
    quote: '"좋은 아키텍처는 보이지 않는 곳에서 빛난다"',
    story: '개발자의 성장을 돕는 플랫폼을 만들며, 기술적 우수성과 사용자 가치의 교집합을 찾아가고 있습니다.',
    color: '#6366f1',
    position: { x: -30, y: -20, z: 10 },
    techStack: ['React', 'TypeScript', 'AWS', 'MSA'],
    codeSnippets: [
      'const buildArchitecture = () => {\n  return scalable && maintainable;\n}',
      'interface AsyncSite {\n  growth: "continuous";\n  community: "strong";\n}',
      '@Service\npublic class GrowthEngine {\n  // 성장의 엔진을 만듭니다\n}'
    ]
  },
  {
    id: 'jinwoo-cho',
    name: '진우 조',
    initials: 'JC',
    role: 'System Engineer',
    quote: '"코드는 단순하게, 생각은 깊게"',
    story: '복잡한 문제를 단순하게 풀어내는 것이 진정한 엔지니어링이라고 믿습니다.',
    color: '#82aaff',
    position: { x: 40, y: 10, z: -5 },
    techStack: ['Java', 'Spring', 'Kubernetes', 'Redis'],
    codeSnippets: [
      'while (problem.isComplex()) {\n  solution = simplify(problem);\n}',
      '@Transactional\npublic void optimize() {\n  // 최적화는 예술이다\n}',
      'docker run --name asyncsite \\\n  -p 8080:8080 \\\n  asyncsite:latest'
    ]
  },
  {
    id: 'mihyun-park',
    name: '미현 박',
    initials: 'MP',
    role: 'Experience Designer',
    quote: '"사용자의 미소가 최고의 디자인"',
    story: '기술과 인간 사이의 따뜻한 연결고리를 만드는 것이 저의 역할입니다.',
    color: '#C3E88D',
    position: { x: -20, y: 30, z: 15 },
    techStack: ['Figma', 'CSS', 'Animation', 'Three.js'],
    codeSnippets: [
      '.user-experience {\n  joy: 100%;\n  friction: 0;\n  delight: infinite;\n}',
      'const createMagic = () => {\n  return user.smile === true;\n}',
      '<Canvas shadows>\n  <Experience />\n</Canvas>'
    ]
  },
  {
    id: 'geon-lee',
    name: 'GEON LEE',
    initials: 'GL',
    role: 'Connection Engineer',
    quote: '"데이터 속에 숨은 이야기를 찾아서"',
    story: '숫자 뒤에 숨은 인사이트로 더 나은 결정을 돕는 것이 제 일입니다.',
    color: '#f87171',
    position: { x: 30, y: -25, z: 20 },
    techStack: ['Python', 'Kafka', 'Elasticsearch', 'GraphQL'],
    codeSnippets: [
      'def find_insight(data):\n    story = analyze(data)\n    return meaningful_story',
      'SELECT insight\nFROM data\nWHERE value = "hidden"',
      'stream.filter(meaningful)\n  .map(transform)\n  .collect(Insights::new)'
    ]
  },
  {
    id: 'jiyeon-kim',
    name: '지연 김',
    initials: 'JK',
    role: 'Growth Path Builder',
    quote: '"함께 성장하는 것이 진짜 성장"',
    story: '개발자들이 외롭지 않게, 서로의 성장을 응원하는 공간을 만들어갑니다.',
    color: '#34d399',
    position: { x: 0, y: 0, z: 30 },
    techStack: ['Community', 'Mentoring', 'Education', 'Growth'],
    codeSnippets: [
      'community.forEach(member => {\n  member.grow();\n  member.support(others);\n});',
      'async function buildPath() {\n  await learn();\n  await share();\n  return growth;\n}',
      'if (developer.isStruggling) {\n  offer.help();\n  provide.support();\n}'
    ]
  },
  {
    id: 'dongmin-cha',
    name: '차동민',
    initials: 'DC',
    role: 'Platform Engineer',
    quote: '"견고한 기반 위에 혁신을 쌓는다"',
    story: '안정적인 시스템 위에서만 진정한 혁신이 가능하다고 믿습니다.',
    color: '#f59e0b',
    position: { x: -35, y: 15, z: -10 },
    techStack: ['DevOps', 'Terraform', 'Jenkins', 'Monitoring'],
    codeSnippets: [
      'terraform apply -auto-approve\n# Infrastructure as Code',
      'uptime: 99.99%\nlatency: < 100ms\nscale: ∞',
      'pipeline {\n  stages {\n    stage("Build") { always() }\n  }\n}'
    ]
  }
];

interface WhoWeAreV5MemberData {
  id: string;
  name: string;
  initials: string;
  role: string;
  quote: string;
  story: string;
  color: string;
  position: { x: number; y: number; z: number };
  techStack: string[];
  codeSnippets: string[];
}

// Terminal commands
const COMMANDS = {
  help: 'help - 사용 가능한 명령어 표시',
  ls: 'ls - 팀 멤버 목록 표시',
  cd: 'cd <member-id> - 특정 멤버에게 포커스',
  cat: 'cat profile - 현재 선택된 멤버의 프로필 표시',
  clear: 'clear - 터미널 초기화',
  whoami: 'whoami - 현재 위치 표시',
  stack: 'stack - 기술 스택 표시',
  code: 'code - 코드 스니펫 표시',
  tree: 'tree - 팀 구조 트리 보기',
  exit: 'exit - 터미널 닫기'
};

const WhoWeAreV5Page: React.FC = () => {
  const [whoweareV5SelectedMember, setWhoweareV5SelectedMember] = useState<WhoWeAreV5MemberData | null>(null);
  const [whoweareV5TerminalOpen, setWhoweareV5TerminalOpen] = useState(true);
  const [whoweareV5TerminalHistory, setWhoweareV5TerminalHistory] = useState<string[]>([
    '  ___   _____ __   __ _   _  _____   _____ ___ _____ _____',
    ' / _ \\ /  ___|\\ \\ / /| \\ | |/  __ \\ /  ___|_ _|_   _|  ___|',
    '/ /_\\ \\\\ `--.  \\ V / |  \\| || /  \\/ \\ `--.  | |  | | | |__',
    '|  _  | `--. \\  \\ /  | . ` || |      `--. \\ | |  | | |  __|',
    '| | | |/\\__/ /  | |  | |\\  || \\__/\\ /\\__/ /_| |_ | | | |___',
    '\\_| |_/\\____/   \\_/  \\_| \\_/ \\____/ \\____/ \\___/ \\_/ \\____/',
    '',
    'AsyncSite Cosmic Terminal v1.0.0',
    '팀 우주 탐험을 시작합니다...',
    'help 명령어로 사용법을 확인하세요.',
    ''
  ]);
  const [whoweareV5CurrentInput, setWhoweareV5CurrentInput] = useState('');
  const [whoweareV5CurrentPath, setWhoweareV5CurrentPath] = useState('~/team');
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Terminal command processing
  const processCommand = useCallback((command: string) => {
    const args = command.trim().split(' ');
    const cmd = args[0].toLowerCase();
    let output: string[] = [];

    switch (cmd) {
      case 'help':
        output = [
          '사용 가능한 명령어:',
          ...Object.values(COMMANDS),
          ''
        ];
        break;

      case 'ls':
        output = [
          'team/',
          ...whoweareV5TeamMembers.map(m => `  ${m.id.padEnd(15)} ${m.role}`),
          ''
        ];
        break;

      case 'cd':
        if (args[1]) {
          const member = whoweareV5TeamMembers.find(m => m.id === args[1]);
          if (member) {
            setWhoweareV5SelectedMember(member);
            setWhoweareV5CurrentPath(`~/team/${member.id}`);
            output = [`${member.name}의 공간으로 이동했습니다.`, ''];
          } else {
            output = [`cd: ${args[1]}: 존재하지 않는 멤버입니다.`, ''];
          }
        } else {
          setWhoweareV5SelectedMember(null);
          setWhoweareV5CurrentPath('~/team');
          output = ['팀 홈으로 돌아왔습니다.', ''];
        }
        break;

      case 'cat':
        if (args[1] === 'profile' && whoweareV5SelectedMember) {
          // ASCII art faces for each member
          const asciiArt: { [key: string]: string[] } = {
            'rene-choi': [
              '     ╭─────╮     ',
              '    │ o   o │    ',
              '    │   >   │    ',
              '    │  ___  │    ',
              '     ╰─────╯     '
            ],
            'jinwoo-cho': [
              '     ┌─────┐     ',
              '    │ ^   ^ │    ',
              '    │   ·   │    ',
              '    │  \_/  │    ',
              '     └─────┘     '
            ],
            'mihyun-park': [
              '     ╭─────╮     ',
              '    │ ◕   ◕ │    ',
              '    │   ∪   │    ',
              '    │  ◡◡◡  │    ',
              '     ╰─────╯     '
            ],
            'geon-lee': [
              '     ┌─────┐     ',
              '    │ ⊙   ⊙ │    ',
              '    │   ▽   │    ',
              '    │  ═══  │    ',
              '     └─────┘     '
            ],
            'jiyeon-kim': [
              '     ╭─────╮     ',
              '    │ ♥   ♥ │    ',
              '    │   ◠   │    ',
              '    │  ◡◡◡  │    ',
              '     ╰─────╯     '
            ],
            'dongmin-cha': [
              '     ┌─────┐     ',
              '    │ ■   ■ │    ',
              '    │   ▼   │    ',
              '    │  ───  │    ',
              '     └─────┘     '
            ]
          };

          const face = asciiArt[whoweareV5SelectedMember.id] || asciiArt['rene-choi'];
          
          output = [
            `╔═══════════════════════════════════════╗`,
            `║         ${whoweareV5SelectedMember.name.padEnd(28)} ║`,
            `╠═══════════════════════════════════════╣`,
            ...face.map(line => `║${line.padEnd(39)}║`),
            `╠═══════════════════════════════════════╣`,
            `║ Role: ${whoweareV5SelectedMember.role.padEnd(32)} ║`,
            `║                                       ║`,
            `║ ${whoweareV5SelectedMember.quote.padEnd(37)} ║`,
            `║                                       ║`,
            `║ ${whoweareV5SelectedMember.story.substring(0, 35).padEnd(37)} ║`,
            `║ ${whoweareV5SelectedMember.story.substring(35, 70).padEnd(37)} ║`,
            `╚═══════════════════════════════════════╝`,
            ''
          ];
        } else {
          output = ['cat: 먼저 cd 명령어로 멤버를 선택하세요.', ''];
        }
        break;

      case 'stack':
        if (whoweareV5SelectedMember) {
          output = [
            `${whoweareV5SelectedMember.name}의 기술 스택:`,
            ...whoweareV5SelectedMember.techStack.map(tech => `  • ${tech}`),
            ''
          ];
        } else {
          output = ['stack: 먼저 cd 명령어로 멤버를 선택하세요.', ''];
        }
        break;

      case 'code':
        if (whoweareV5SelectedMember) {
          const randomSnippet = whoweareV5SelectedMember.codeSnippets[
            Math.floor(Math.random() * whoweareV5SelectedMember.codeSnippets.length)
          ];
          output = [
            `${whoweareV5SelectedMember.name}의 코드 스니펫:`,
            '```',
            ...randomSnippet.split('\n'),
            '```',
            ''
          ];
        } else {
          output = ['code: 먼저 cd 명령어로 멤버를 선택하세요.', ''];
        }
        break;

      case 'clear':
        setWhoweareV5TerminalHistory(['']);
        return;

      case 'whoami':
        output = [`현재 위치: ${whoweareV5CurrentPath}`, ''];
        break;

      case 'tree':
        output = [
          'AsyncSite/',
          '├── Team/',
          '│   ├── rene-choi (Product Architect)',
          '│   ├── jinwoo-cho (System Engineer)',
          '│   ├── mihyun-park (Experience Designer)',
          '│   ├── geon-lee (Connection Engineer)',
          '│   ├── jiyeon-kim (Growth Path Builder)',
          '│   └── dongmin-cha (Platform Engineer)',
          '├── Mission/',
          '│   └── "함께 성장하는 개발자 커뮤니티"',
          '└── Vision/',
          '    └── "고독한 개발자가 없는 세상"',
          ''
        ];
        break;

      case 'exit':
        setWhoweareV5TerminalOpen(false);
        return;

      default:
        if (cmd) {
          output = [`${cmd}: 명령어를 찾을 수 없습니다. help를 입력하세요.`, ''];
        }
    }

    setWhoweareV5TerminalHistory(prev => [...prev, `$ ${command}`, ...output]);
  }, [whoweareV5SelectedMember, whoweareV5CurrentPath]);

  // Handle terminal input
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whoweareV5CurrentInput.trim()) {
      processCommand(whoweareV5CurrentInput);
      setWhoweareV5CurrentInput('');
    }
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [whoweareV5TerminalHistory]);

  // Canvas animation for code particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Code particles
    class CodeParticle {
      x: number;
      y: number;
      z: number;
      text: string;
      color: string;
      member: WhoWeAreV5MemberData;
      velocity: { x: number; y: number; z: number };

      constructor(member: WhoWeAreV5MemberData) {
        this.member = member;
        this.x = member.position.x * 10 + (Math.random() - 0.5) * 100;
        this.y = member.position.y * 10 + (Math.random() - 0.5) * 100;
        this.z = member.position.z + (Math.random() - 0.5) * 20;
        
        const snippets = member.codeSnippets[0].split('\n');
        this.text = snippets[Math.floor(Math.random() * snippets.length)].trim();
        this.color = member.color;
        
        this.velocity = {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.1
        };
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.z += this.velocity.z;

        // Boundary check
        if (Math.abs(this.x) > canvasWidth / 2) this.velocity.x *= -1;
        if (Math.abs(this.y) > canvasHeight / 2) this.velocity.y *= -1;
        if (this.z < -50 || this.z > 50) this.velocity.z *= -1;
      }

      draw(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, selectedMember: WhoWeAreV5MemberData | null) {
        const scale = (this.z + 50) / 100;
        const opacity = selectedMember && selectedMember.id !== this.member.id ? 0.2 : scale;
        
        ctx.save();
        ctx.translate(centerX + this.x * scale, centerY + this.y * scale);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = this.color;
        ctx.font = `${12 * scale}px 'Fira Code', monospace`;
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
      }
    }

    const particles: CodeParticle[] = [];
    whoweareV5TeamMembers.forEach(member => {
      for (let i = 0; i < 5; i++) {
        particles.push(new CodeParticle(member));
      }
    });

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw connections
      if (whoweareV5SelectedMember) {
        ctx.strokeStyle = whoweareV5SelectedMember.color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.3;
        
        particles
          .filter(p => p.member.id === whoweareV5SelectedMember.id)
          .forEach(p => {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + p.x * ((p.z + 50) / 100), centerY + p.y * ((p.z + 50) / 100));
            ctx.stroke();
          });
      }

      // Update and draw particles
      particles.forEach(particle => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx, centerX, centerY, whoweareV5SelectedMember);
      });

      // Draw team members
      whoweareV5TeamMembers.forEach(member => {
        const scale = (member.position.z + 50) / 100;
        const x = centerX + member.position.x * 10 * scale;
        const y = centerY + member.position.y * 10 * scale;
        
        // Glow effect
        if (whoweareV5SelectedMember?.id === member.id) {
          ctx.shadowBlur = 30;
          ctx.shadowColor = member.color;
        }
        
        // Member node
        ctx.fillStyle = member.color;
        ctx.globalAlpha = whoweareV5SelectedMember && whoweareV5SelectedMember.id !== member.id ? 0.3 : 1;
        ctx.beginPath();
        ctx.arc(x, y, 30 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Initials
        ctx.fillStyle = '#000';
        ctx.font = `bold ${20 * scale}px 'Orbitron', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(member.initials, x, y);
        
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [whoweareV5SelectedMember]);

  return (
    <div className="whoweare-v5-container">
      {/* Code galaxy canvas */}
      <canvas ref={canvasRef} className="whoweare-v5-galaxy-canvas" />

      {/* Header */}
      <div className="whoweare-v5-header">
        <h1 className="whoweare-v5-title">COSMIC TERMINAL</h1>
        <p className="whoweare-v5-subtitle">AsyncSite 팀의 코드 은하계</p>
      </div>

      {/* Terminal interface */}
      <div className={`whoweare-v5-terminal ${whoweareV5TerminalOpen ? 'open' : 'closed'}`}>
        <div className="whoweare-v5-terminal-header">
          <div className="whoweare-v5-terminal-buttons">
            <span className="whoweare-v5-terminal-btn close" onClick={() => setWhoweareV5TerminalOpen(false)}></span>
            <span className="whoweare-v5-terminal-btn minimize"></span>
            <span className="whoweare-v5-terminal-btn maximize"></span>
          </div>
          <div className="whoweare-v5-terminal-title">asyncsite@cosmic-terminal</div>
        </div>
        
        <div className="whoweare-v5-terminal-body" ref={terminalRef}>
          {whoweareV5TerminalHistory.map((line, index) => (
            <div key={index} className="whoweare-v5-terminal-line">
              {line}
            </div>
          ))}
          
          <form onSubmit={handleTerminalSubmit} className="whoweare-v5-terminal-input-line">
            <span className="whoweare-v5-terminal-prompt">
              {whoweareV5CurrentPath} $
            </span>
            <input
              ref={inputRef}
              type="text"
              value={whoweareV5CurrentInput}
              onChange={(e) => setWhoweareV5CurrentInput(e.target.value)}
              className="whoweare-v5-terminal-input"
              autoFocus
            />
          </form>
        </div>
      </div>

      {/* Terminal toggle button */}
      {!whoweareV5TerminalOpen && (
        <button 
          className="whoweare-v5-terminal-toggle"
          onClick={() => setWhoweareV5TerminalOpen(true)}
        >
          &gt;_
        </button>
      )}

      {/* Navigation hint */}
      <div className="whoweare-v5-navigation-hint">
        <span>터미널에 명령어를 입력해 팀을 탐험하세요</span>
      </div>
    </div>
  );
};

export default WhoWeAreV5Page;