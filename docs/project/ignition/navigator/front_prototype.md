    
    ```html
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>커리어 네비게이터 - 프로토타입 1</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
                background: #0a0a0a;
                color: #e5e5e5;
                line-height: 1.6;
            }
            
            /* 헤더 */
            .header {
                background: rgba(15, 15, 15, 0.95);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                position: sticky;
                top: 0;
                z-index: 100;
            }
            
            .nav-container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 1rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .logo {
                font-size: 1.5rem;
                font-weight: 700;
                background: linear-gradient(135deg, #C3E88D 0%, #82aaff 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .nav-tabs {
                display: flex;
                gap: 2rem;
            }
            
            .nav-tab {
                color: #999;
                text-decoration: none;
                transition: color 0.3s;
                position: relative;
            }
            
            .nav-tab.active {
                color: #C3E88D;
            }
            
            .nav-tab.active::after {
                content: '';
                position: absolute;
                bottom: -1rem;
                left: 0;
                right: 0;
                height: 2px;
                background: #C3E88D;
            }
            
            /* 메인 컨테이너 */
            .main-container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 2rem;
            }
            
            /* 히어로 섹션 */
            .hero-section {
                text-align: center;
                padding: 3rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                margin-bottom: 3rem;
            }
            
            .hero-title {
                font-size: 2.5rem;
                font-weight: 800;
                margin-bottom: 1rem;
                background: linear-gradient(135deg, #fff 0%, #C3E88D 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .hero-subtitle {
                color: #999;
                font-size: 1.2rem;
            }
            
            /* 검색 및 필터 */
            .search-filter-section {
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 1rem;
                margin-bottom: 2rem;
                align-items: center;
            }
            
            .search-box {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .search-input {
                background: none;
                border: none;
                color: #e5e5e5;
                font-size: 1rem;
                flex: 1;
                outline: none;
            }
            
            .search-input::placeholder {
                color: #666;
            }
            
            .filter-chips {
                display: flex;
                gap: 0.5rem;
            }
            
            .filter-chip {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 0.5rem 1rem;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .filter-chip:hover {
                background: rgba(195, 232, 141, 0.1);
                border-color: rgba(195, 232, 141, 0.3);
            }
            
            /* 통계 카드 */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 3rem;
            }
            
            .stat-card {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 1.5rem;
                text-align: center;
            }
            
            .stat-number {
                font-size: 2rem;
                font-weight: 700;
                color: #C3E88D;
                margin-bottom: 0.5rem;
            }
            
            .stat-label {
                color: #999;
                font-size: 0.9rem;
            }
            
            /* 공고 그리드 */
            .job-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 1.5rem;
                margin-bottom: 3rem;
            }
            
            .job-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 1.5rem;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                overflow: hidden;
            }
            
            .job-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #C3E88D 0%, #82aaff 100%);
                transform: translateX(-100%);
                transition: transform 0.3s;
            }
            
            .job-card:hover {
                transform: translateY(-2px);
                border-color: rgba(195, 232, 141, 0.3);
                box-shadow: 0 10px 30px rgba(195, 232, 141, 0.1);
            }
            
            .job-card:hover::before {
                transform: translateX(0);
            }
            
            .job-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 1rem;
            }
            
            .company-logo {
                width: 48px;
                height: 48px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                color: #C3E88D;
            }
            
            .match-score {
                background: rgba(195, 232, 141, 0.1);
                color: #C3E88D;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 600;
            }
            
            .job-title {
                font-size: 1.2rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            .company-name {
                color: #999;
                margin-bottom: 1rem;
            }
            
            .tech-stack {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }
            
            .tech-tag {
                background: rgba(130, 170, 255, 0.1);
                color: #82aaff;
                padding: 0.25rem 0.75rem;
                border-radius: 4px;
                font-size: 0.85rem;
            }
            
            .job-meta {
                display: flex;
                gap: 1rem;
                color: #666;
                font-size: 0.9rem;
            }
            
            .job-meta-item {
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }
            
            /* 작전 회의실 버튼 */
            .war-room-btn {
                position: absolute;
                bottom: 1rem;
                right: 1rem;
                background: rgba(255, 234, 0, 0.1);
                color: #ffea00;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                font-size: 0.85rem;
                font-weight: 600;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s;
            }
            
            .job-card:hover .war-room-btn {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* 트렌드 섹션 */
            .trend-section {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 2rem;
                margin-top: 3rem;
            }
            
            .trend-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }
            
            .trend-title {
                font-size: 1.5rem;
                font-weight: 700;
            }
            
            .trend-link {
                color: #82aaff;
                text-decoration: none;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .trend-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
            
            .trend-item {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
                padding: 1rem;
                text-align: center;
            }
            
            .trend-rank {
                font-size: 2rem;
                font-weight: 700;
                color: #C3E88D;
                margin-bottom: 0.5rem;
            }
            
            .trend-skill {
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            .trend-change {
                color: #82aaff;
                font-size: 0.9rem;
            }
        </style>
    </head>
    <body>
        <!-- 헤더 -->
        <header class="header">
            <div class="nav-container">
                <div class="logo">AsyncSite</div>
                <nav class="nav-tabs">
                    <a href="#" class="nav-tab">스터디</a>
                    <a href="#" class="nav-tab active">Ignition</a>
                    <a href="#" class="nav-tab">커뮤니티</a>
                </nav>
            </div>
        </header>
    
        <!-- 메인 컨텐츠 -->
        <main class="main-container">
            <!-- 히어로 섹션 -->
            <section class="hero-section">
                <h1 class="hero-title">커리어 네비게이터</h1>
                <p class="hero-subtitle">공고를 넘어, 당신의 다음 커리어 여정을 설계합니다.</p>
            </section>
    
            <!-- 검색 및 필터 -->
            <section class="search-filter-section">
                <div class="search-box">
                    <span>🔍</span>
                    <input type="text" class="search-input" placeholder="회사, 직무, 기술 스택으로 검색">
                </div>
                <div class="filter-chips">
                    <div class="filter-chip">🏢 회사별</div>
                    <div class="filter-chip">💻 기술 스택</div>
                    <div class="filter-chip">📈 경력</div>
                    <div class="filter-chip">📍 지역</div>
                </div>
            </section>
    
            <!-- 통계 카드 -->
            <section class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">152</div>
                    <div class="stat-label">활성 채용공고</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">48</div>
                    <div class="stat-label">신규 공고 (이번주)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">85%</div>
                    <div class="stat-label">평균 매칭률</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">23</div>
                    <div class="stat-label">진행중인 작전회의실</div>
                </div>
            </section>
    
            <!-- 공고 그리드 -->
            <section class="job-grid">
                <!-- 공고 카드 1 -->
                <article class="job-card">
                    <div class="job-header">
                        <div class="company-logo">N</div>
                        <div class="match-score">95% 매칭</div>
                    </div>
                    <h3 class="job-title">백엔드 서버 개발자</h3>
                    <div class="company-name">네이버웹툰</div>
                    <div class="tech-stack">
                        <span class="tech-tag">#Java</span>
                        <span class="tech-tag">#Kotlin</span>
                        <span class="tech-tag">#MSA</span>
                        <span class="tech-tag">#Spring</span>
                    </div>
                    <div class="job-meta">
                        <div class="job-meta-item">🏢 경력 3년+</div>
                        <div class="job-meta-item">📍 분당</div>
                        <div class="job-meta-item">📅 ~08.31</div>
                    </div>
                    <button class="war-room-btn">👥 작전 회의실</button>
                </article>
    
                <!-- 공고 카드 2 -->
                <article class="job-card">
                    <div class="job-header">
                        <div class="company-logo">K</div>
                        <div class="match-score">87% 매칭</div>
                    </div>
                    <h3 class="job-title">카카오페이 결제 서버 개발자</h3>
                    <div class="company-name">카카오</div>
                    <div class="tech-stack">
                        <span class="tech-tag">#Java</span>
                        <span class="tech-tag">#Spring Boot</span>
                        <span class="tech-tag">#Kafka</span>
                        <span class="tech-tag">#MySQL</span>
                    </div>
                    <div class="job-meta">
                        <div class="job-meta-item">🏢 경력 5년+</div>
                        <div class="job-meta-item">📍 판교</div>
                        <div class="job-meta-item">📅 ~09.15</div>
                    </div>
                    <button class="war-room-btn">👥 작전 회의실</button>
                </article>
    
                <!-- 공고 카드 3 -->
                <article class="job-card">
                    <div class="job-header">
                        <div class="company-logo">C</div>
                        <div class="match-score">82% 매칭</div>
                    </div>
                    <h3 class="job-title">물류 플랫폼 개발자</h3>
                    <div class="company-name">쿠팡</div>
                    <div class="tech-stack">
                        <span class="tech-tag">#Go</span>
                        <span class="tech-tag">#Python</span>
                        <span class="tech-tag">#AWS</span>
                        <span class="tech-tag">#Docker</span>
                    </div>
                    <div class="job-meta">
                        <div class="job-meta-item">🏢 경력 무관</div>
                        <div class="job-meta-item">📍 송파</div>
                        <div class="job-meta-item">📅 ~09.30</div>
                    </div>
                    <button class="war-room-btn">👥 작전 회의실</button>
                </article>
    
                <!-- 공고 카드 4 -->
                <article class="job-card">
                    <div class="job-header">
                        <div class="company-logo">B</div>
                        <div class="match-score">78% 매칭</div>
                    </div>
                    <h3 class="job-title">딜리버리 서비스 백엔드</h3>
                    <div class="company-name">배달의민족</div>
                    <div class="tech-stack">
                        <span class="tech-tag">#Kotlin</span>
                        <span class="tech-tag">#Spring</span>
                        <span class="tech-tag">#Redis</span>
                        <span class="tech-tag">#k8s</span>
                    </div>
                    <div class="job-meta">
                        <div class="job-meta-item">🏢 경력 2년+</div>
                        <div class="job-meta-item">📍 송파</div>
                        <div class="job-meta-item">📅 ~08.25</div>
                    </div>
                    <button class="war-room-btn">👥 작전 회의실</button>
                </article>
            </section>
    
            <!-- 기술 트렌드 -->
            <section class="trend-section">
                <div class="trend-header">
                    <h2 class="trend-title">📈 최신 기술 트렌드</h2>
                    <a href="#" class="trend-link">전체 트렌드 보기 →</a>
                </div>
                <div class="trend-grid">
                    <div class="trend-item">
                        <div class="trend-rank">#1</div>
                        <div class="trend-skill">Kubernetes</div>
                        <div class="trend-change">▲ 23% 수요 증가</div>
                    </div>
                    <div class="trend-item">
                        <div class="trend-rank">#2</div>
                        <div class="trend-skill">Kafka</div>
                        <div class="trend-change">▲ 18% 수요 증가</div>
                    </div>
                    <div class="trend-item">
                        <div class="trend-rank">#3</div>
                        <div class="trend-skill">React</div>
                        <div class="trend-change">▲ 15% 수요 증가</div>
                    </div>
                    <div class="trend-item">
                        <div class="trend-rank">#4</div>
                        <div class="trend-skill">TypeScript</div>
                        <div class="trend-change">▲ 12% 수요 증가</div>
                    </div>
                </div>
            </section>
        </main>
    </body>
    </html>
    ```
    
    ```html
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>커리어 네비게이터 - 프로토타입 2</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
                background: #111111;
                color: #f0f0f0;
                line-height: 1.6;
            }
            
            /* 헤더 */
            .header {
                background: #1a1a1a;
                border-bottom: 2px solid #2a2a2a;
                position: sticky;
                top: 0;
                z-index: 100;
            }
            
            .nav-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 1.25rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .logo {
                font-size: 1.5rem;
                font-weight: 700;
                color: #fff;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .logo-accent {
                color: #C3E88D;
            }
            
            .nav-tabs {
                display: flex;
                gap: 3rem;
            }
            
            .nav-tab {
                color: #888;
                text-decoration: none;
                font-weight: 500;
                transition: color 0.3s;
            }
            
            .nav-tab.active {
                color: #fff;
                font-weight: 700;
            }
            
            /* 레이아웃 */
            .layout-container {
                display: flex;
                max-width: 1200px;
                margin: 0 auto;
                gap: 2rem;
                padding: 2rem;
            }
            
            /* 사이드바 */
            .sidebar {
                width: 280px;
                flex-shrink: 0;
            }
            
            .filter-section {
                background: #1a1a1a;
                border: 1px solid #2a2a2a;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            }
            
            .filter-title {
                font-size: 0.9rem;
                font-weight: 600;
                color: #888;
                margin-bottom: 1rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .filter-option {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem 0;
                cursor: pointer;
                color: #ccc;
                transition: color 0.2s;
            }
            
            .filter-option:hover {
                color: #fff;
            }
            
            .filter-checkbox {
                width: 18px;
                height: 18px;
                border: 2px solid #444;
                border-radius: 4px;
                background: transparent;
                position: relative;
            }
            
            .filter-checkbox.checked {
                background: #C3E88D;
                border-color: #C3E88D;
            }
            
            .filter-checkbox.checked::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #000;
                font-size: 12px;
                font-weight: bold;
            }
            
            .filter-count {
                margin-left: auto;
                font-size: 0.85rem;
                color: #666;
            }
            
            /* 로드맵 CTA */
            .roadmap-cta {
                background: linear-gradient(135deg, #1e3a1e 0%, #2a4a2a 100%);
                border: 1px solid #3a5a3a;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            }
            
            .roadmap-title {
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 0.75rem;
                color: #C3E88D;
            }
            
            .roadmap-desc {
                font-size: 0.9rem;
                color: #aaa;
                margin-bottom: 1rem;
            }
            
            .roadmap-btn {
                background: #C3E88D;
                color: #000;
                border: none;
                border-radius: 8px;
                padding: 0.75rem 1.5rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                width: 100%;
            }
            
            .roadmap-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(195, 232, 141, 0.3);
            }
            
            /* 메인 컨텐츠 */
            .main-content {
                flex: 1;
            }
            
            /* 검색바 */
            .search-section {
                background: #1a1a1a;
                border: 1px solid #2a2a2a;
                border-radius: 12px;
                padding: 1rem;
                margin-bottom: 1.5rem;
                display: flex;
                gap: 1rem;
                align-items: center;
            }
            
            .search-input-wrapper {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                background: #0a0a0a;
                border-radius: 8px;
                padding: 0.75rem 1rem;
            }
            
            .search-input {
                background: none;
                border: none;
                color: #f0f0f0;
                font-size: 1rem;
                flex: 1;
                outline: none;
            }
            
            .search-btn {
                background: #C3E88D;
                color: #000;
                border: none;
                border-radius: 8px;
                padding: 0.75rem 2rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            /* 정렬 및 뷰 옵션 */
            .list-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }
            
            .results-count {
                color: #888;
                font-size: 0.95rem;
            }
            
            .view-options {
                display: flex;
                gap: 1rem;
                align-items: center;
            }
            
            .sort-dropdown {
                background: #1a1a1a;
                border: 1px solid #2a2a2a;
                border-radius: 8px;
                padding: 0.5rem 1rem;
                color: #f0f0f0;
                font-size: 0.9rem;
                cursor: pointer;
            }
            
            /* 공고 리스트 */
            .job-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .job-item {
                background: #1a1a1a;
                border: 1px solid #2a2a2a;
                border-radius: 12px;
                padding: 1.5rem;
                transition: all 0.3s;
                cursor: pointer;
                position: relative;
            }
            
            .job-item:hover {
                border-color: #3a3a3a;
                background: #1e1e1e;
            }
            
            .job-item-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 1rem;
            }
            
            .job-info {
                flex: 1;
            }
            
            .job-company {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 0.5rem;
            }
            
            .company-logo {
                width: 40px;
                height: 40px;
                background: #2a2a2a;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                color: #C3E88D;
                font-size: 1.2rem;
            }
            
            .company-name {
                font-size: 0.9rem;
                color: #888;
            }
            
            .job-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #fff;
                margin-bottom: 0.75rem;
            }
            
            .job-badges {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                align-items: flex-end;
            }
            
            .match-badge {
                background: rgba(195, 232, 141, 0.15);
                color: #C3E88D;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                border: 1px solid rgba(195, 232, 141, 0.3);
            }
            
            .war-room-badge {
                background: rgba(255, 234, 0, 0.1);
                color: #ffea00;
                padding: 0.375rem 0.75rem;
                border-radius: 6px;
                font-size: 0.85rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.375rem;
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .job-item:hover .war-room-badge {
                opacity: 1;
            }
            
            .job-description {
                color: #aaa;
                font-size: 0.95rem;
                margin-bottom: 1rem;
                line-height: 1.6;
            }
            
            .job-skills {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }
            
            .skill-tag {
                background: #2a2a2a;
                color: #82aaff;
                padding: 0.375rem 0.875rem;
                border-radius: 6px;
                font-size: 0.85rem;
                border: 1px solid #3a3a3a;
            }
            
            .job-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 1rem;
                border-top: 1px solid #2a2a2a;
            }
            
            .job-meta {
                display: flex;
                gap: 1.5rem;
                color: #666;
                font-size: 0.9rem;
            }
            
            .job-meta-item {
                display: flex;
                align-items: center;
                gap: 0.375rem;
            }
            
            .job-action {
                display: flex;
                gap: 0.75rem;
            }
            
            .action-btn {
                background: transparent;
                border: 1px solid #3a3a3a;
                color: #888;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .action-btn:hover {
                border-color: #C3E88D;
                color: #C3E88D;
            }
            
            .action-btn.primary {
                background: #C3E88D;
                color: #000;
                border-color: #C3E88D;
                font-weight: 600;
            }
            
            .action-btn.primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(195, 232, 141, 0.3);
            }
            
            /* 작전 회의실 인디케이터 */
            .war-room-indicator {
                position: absolute;
                top: 1.5rem;
                right: 1.5rem;
                width: 8px;
                height: 8px;
                background: #ffea00;
                border-radius: 50%;
                box-shadow: 0 0 8px rgba(255, 234, 0, 0.5);
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(255, 234, 0, 0.5);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(255, 234, 0, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(255, 234, 0, 0);
                }
            }
            
            /* 페이지네이션 */
            .pagination {
                display: flex;
                justify-content: center;
                gap: 0.5rem;
                margin-top: 3rem;
            }
            
            .page-btn {
                background: #1a1a1a;
                border: 1px solid #2a2a2a;
                color: #888;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .page-btn:hover {
                border-color: #3a3a3a;
                color: #fff;
            }
            
            .page-btn.active {
                background: #C3E88D;
                color: #000;
                border-color: #C3E88D;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <!-- 헤더 -->
        <header class="header">
            <div class="nav-container">
                <div class="logo">
                    Async<span class="logo-accent">Site</span>
                </div>
                <nav class="nav-tabs">
                    <a href="#" class="nav-tab">스터디</a>
                    <a href="#" class="nav-tab active">Ignition</a>
                    <a href="#" class="nav-tab">커뮤니티</a>
                </nav>
            </div>
        </header>
    
        <!-- 메인 레이아웃 -->
        <div class="layout-container">
            <!-- 사이드바 -->
            <aside class="sidebar">
                <!-- 회사 필터 -->
                <div class="filter-section">
                    <h3 class="filter-title">회사</h3>
                    <div class="filter-option">
                        <div class="filter-checkbox checked"></div>
                        <span>네이버</span>
                        <span class="filter-count">12</span>
                    </div>
                    <div class="filter-option">
                        <div class="filter-checkbox checked"></div>
                        <span>카카오</span>
                        <span class="filter-count">8</span>
                    </div>
                    <div class="filter-option">
                        <div class="filter-checkbox"></div>
                        <span>쿠팡</span>
                        <span class="filter-count">15</span>
                    </div>
                    <div class="filter-option">
                        <div class="filter-checkbox"></div>
                        <span>배달의민족</span>
                        <span class="filter-count">6</span>
                    </div>
                    <div class="filter-option">
                        <div class="filter-checkbox"></div>
                        <span>토스</span>
                        <span class="filter-count">10</span>
                    </div>
                </div>
    
                <!-- 기술 스택 필터 -->
                <div class="filter-section">
                    <h3 class="filter-title">기술 스택</h3>
                    <div class="filter-option">
                        <div class="filter-checkbox checked"></div>
                        <span>Java</span>
                        <span class="filter-count">45</span>
                    </div>
                    <div class="filter-option">
                        <div class="filter-checkbox checked"></div>
                        <span>Spring</span>
                        <span class="filter-count">38</span>
                    </div>
                    <div class="filter-option">
                        <div class="filter-checkbox"></div>
                        <span>Kotlin</span>
                        <span class="filter-count">22</span>
                    </div>
                    <div class="filter-option">
                        <div class="filter-checkbox"></div>
                        <span>Python</span>
                        <span class="filter-count">18</span>
                    </div>
                    <div class="filter-option">
                        <div class="filter-checkbox"></div>
                        <span>React</span>
                        <span class="filter-count">25</span>
                    </div>
                </div>
    
                <!-- 경력 필터 -->
                <div class="filter-section">
                    <h3 class="filter-title">경력</h3>
                    <div class="filter-option">
                        <div class="filter-checkbox"></div>
                        <span>신입</span>
                        <span class="filter-count">23</span>
                    </div>
                    <div class="filter-option">
                        <div class="filter-checkbox checked"></div>
                        <span>경력 (1-3년)</span>
                        <span class="filter-count">35</span>
                    </div>
                    <div class="filter-option">
                        <div class="filter-checkbox"></div>
                        <span>경력 (4-7년)</span>
                        <span class="filter-count">28</span>
                    </div>
                    <div class="filter-option">
                        <div class="filter-checkbox"></div>
                        <span>경력 (8년+)</span>
                        <span class="filter-count">14</span>
                    </div>
                </div>
    
                <!-- 로드맵 CTA -->
                <div class="roadmap-cta">
                    <h3 class="roadmap-title">🚀 성장 로드맵</h3>
                    <p class="roadmap-desc">목표 공고까지의 최적 경로를 찾아보세요</p>
                    <button class="roadmap-btn">내 로드맵 만들기</button>
                </div>
            </aside>
    
            <!-- 메인 컨텐츠 -->
            <main class="main-content">
                <!-- 검색바 -->
                <section class="search-section">
                    <div class="search-input-wrapper">
                        <span>🔍</span>
                        <input type="text" class="search-input" placeholder="회사, 직무, 기술 스택으로 검색하세요">
                    </div>
                    <button class="search-btn">검색</button>
                </section>
    
                <!-- 리스트 컨트롤 -->
                <div class="list-controls">
                    <span class="results-count">총 85개의 채용공고</span>
                    <div class="view-options">
                        <select class="sort-dropdown">
                            <option>매칭률 높은순</option>
                            <option>최신순</option>
                            <option>마감임박순</option>
                            <option>인기순</option>
                        </select>
                    </div>
                </div>
    
                <!-- 공고 리스트 -->
                <div class="job-list">
                    <!-- 공고 아이템 1 -->
                    <article class="job-item">
                        <div class="war-room-indicator"></div>
                        <div class="job-item-header">
                            <div class="job-info">
                                <div class="job-company">
                                    <div class="company-logo">N</div>
                                    <span class="company-name">네이버웹툰</span>
                                </div>
                                <h3 class="job-title">백엔드 서버 개발자 (네이버웹툰)</h3>
                            </div>
                            <div class="job-badges">
                                <div class="match-badge">95% 매칭</div>
                                <div class="war-room-badge">👥 12명 작전회의중</div>
                            </div>
                        </div>
                        <p class="job-description">
                            네이버웹툰의 글로벌 서비스를 함께 만들어갈 백엔드 개발자를 찾습니다. 대용량 트래픽 처리와 안정적인 서비스 운영에 관심이 있으신 분을 환영합니다.
                        </p>
                        <div class="job-skills">
                            <span class="skill-tag">Java</span>
                            <span class="skill-tag">Spring Boot</span>
                            <span class="skill-tag">Kotlin</span>
                            <span class="skill-tag">MSA</span>
                            <span class="skill-tag">Kafka</span>
                        </div>
                        <div class="job-footer">
                            <div class="job-meta">
                                <div class="job-meta-item">🏢 경력 3년 이상</div>
                                <div class="job-meta-item">📍 분당</div>
                                <div class="job-meta-item">📅 ~2025.08.31</div>
                            </div>
                            <div class="job-action">
                                <button class="action-btn">상세보기</button>
                                <button class="action-btn primary">로드맵 분석</button>
                            </div>
                        </div>
                    </article>
    
                    <!-- 공고 아이템 2 -->
                    <article class="job-item">
                        <div class="job-item-header">
                            <div class="job-info">
                                <div class="job-company">
                                    <div class="company-logo">K</div>
                                    <span class="company-name">카카오</span>
                                </div>
                                <h3 class="job-title">카카오페이 결제 서버 개발자</h3>
                            </div>
                            <div class="job-badges">
                                <div class="match-badge">87% 매칭</div>
                                <div class="war-room-badge">👥 8명 작전회의중</div>
                            </div>
                        </div>
                        <p class="job-description">
                            카카오페이 결제 시스템의 안정성과 확장성을 책임질 서버 개발자를 모십니다. 금융 서비스 개발 경험이 있으신 분을 우대합니다.
                        </p>
                        <div class="job-skills">
                            <span class="skill-tag">Java</span>
                            <span class="skill-tag">Spring Boot</span>
                            <span class="skill-tag">MySQL</span>
                            <span class="skill-tag">Redis</span>
                            <span class="skill-tag">Kafka</span>
                        </div>
                        <div class="job-footer">
                            <div class="job-meta">
                                <div class="job-meta-item">🏢 경력 5년 이상</div>
                                <div class="job-meta-item">📍 판교</div>
                                <div class="job-meta-item">📅 ~2025.09.15</div>
                            </div>
                            <div class="job-action">
                                <button class="action-btn">상세보기</button>
                                <button class="action-btn primary">로드맵 분석</button>
                            </div>
                        </div>
                    </article>
    
                    <!-- 공고 아이템 3 -->
                    <article class="job-item">
                        <div class="war-room-indicator"></div>
                        <div class="job-item-header">
                            <div class="job-info">
                                <div class="job-company">
                                    <div class="company-logo">C</div>
                                    <span class="company-name">쿠팡</span>
                                </div>
                                <h3 class="job-title">물류 플랫폼 백엔드 개발자</h3>
                            </div>
                            <div class="job-badges">
                                <div class="match-badge">82% 매칭</div>
                                <div class="war-room-badge">👥 15명 작전회의중</div>
                            </div>
                        </div>
                        <p class="job-description">
                            쿠팡의 혁신적인 물류 시스템을 개발하고 운영할 백엔드 개발자를 찾습니다. 대규모 분산 시스템 개발에 열정이 있는 분을 환영합니다.
                        </p>
                        <div class="job-skills">
                            <span class="skill-tag">Go</span>
                            <span class="skill-tag">Python</span>
                            <span class="skill-tag">AWS</span>
                            <span class="skill-tag">Docker</span>
                            <span class="skill-tag">Kubernetes</span>
                        </div>
                        <div class="job-footer">
                            <div class="job-meta">
                                <div class="job-meta-item">🏢 경력 무관</div>
                                <div class="job-meta-item">📍 송파</div>
                                <div class="job-meta-item">📅 ~2025.09.30</div>
                            </div>
                            <div class="job-action">
                                <button class="action-btn">상세보기</button>
                                <button class="action-btn primary">로드맵 분석</button>
                            </div>
                        </div>
                    </article>
                </div>
    
                <!-- 페이지네이션 -->
                <div class="pagination">
                    <button class="page-btn">&lt;</button>
                    <button class="page-btn active">1</button>
                    <button class="page-btn">2</button>
                    <button class="page-btn">3</button>
                    <button class="page-btn">4</button>
                    <button class="page-btn">5</button>
                    <button class="page-btn">&gt;</button>
                </div>
            </main>
        </div>
    </body>
    </html>
    ```
    
    ```html
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>커리어 네비게이터 - 프로토타입 3</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
                background: #0f0f0f;
                color: #e0e0e0;
                line-height: 1.6;
            }
            
            /* 헤더 */
            .header {
                background: rgba(18, 18, 18, 0.98);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                position: sticky;
                top: 0;
                z-index: 100;
            }
            
            .header-content {
                max-width: 1600px;
                margin: 0 auto;
                padding: 0 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 64px;
            }
            
            .logo {
                font-size: 1.4rem;
                font-weight: 700;
                letter-spacing: -0.02em;
            }
            
            .logo-text {
                background: linear-gradient(to right, #fff 0%, #C3E88D 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .nav-tabs {
                display: flex;
                gap: 1rem;
            }
            
            .nav-tab {
                color: rgba(255, 255, 255, 0.6);
                text-decoration: none;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                transition: all 0.3s;
                font-weight: 500;
            }
            
            .nav-tab:hover {
                color: rgba(255, 255, 255, 0.9);
                background: rgba(255, 255, 255, 0.05);
            }
            
            .nav-tab.active {
                color: #C3E88D;
                background: rgba(195, 232, 141, 0.1);
            }
            
            /* 메인 레이아웃 */
            .dashboard-container {
                max-width: 1600px;
                margin: 0 auto;
                padding: 2rem;
            }
            
            /* 개인화 헤더 */
            .personal-header {
                background: linear-gradient(135deg, rgba(195, 232, 141, 0.05) 0%, rgba(130, 170, 255, 0.05) 100%);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 2rem;
            }
            
            .greeting {
                font-size: 1.8rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
            }
            
            .sub-greeting {
                color: rgba(255, 255, 255, 0.6);
                font-size: 1.1rem;
            }
            
            .quick-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 1.5rem;
            }
            
            .quick-stat {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .stat-icon {
                width: 48px;
                height: 48px;
                background: rgba(195, 232, 141, 0.1);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }
            
            .stat-content {
                flex: 1;
            }
            
            .stat-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: #C3E88D;
            }
            
            .stat-label {
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.5);
            }
            
            /* 메인 그리드 */
            .dashboard-grid {
                display: grid;
                grid-template-columns: 1fr 380px;
                gap: 2rem;
                margin-bottom: 2rem;
            }
            
            /* 추천 공고 섹션 */
            .recommended-section {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 1.5rem;
            }
            
            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }
            
            .section-title {
                font-size: 1.3rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .section-action {
                color: #82aaff;
                text-decoration: none;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }
            
            /* 공고 카드 (컴팩트) */
            .job-card-compact {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 1.25rem;
                margin-bottom: 1rem;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                overflow: hidden;
            }
            
            .job-card-compact::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: linear-gradient(to bottom, #C3E88D 0%, #82aaff 100%);
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .job-card-compact:hover {
                background: rgba(255, 255, 255, 0.05);
                transform: translateX(4px);
            }
            
            .job-card-compact:hover::before {
                opacity: 1;
            }
            
            .job-compact-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 0.75rem;
            }
            
            .job-compact-info {
                flex: 1;
            }
            
            .company-info {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.25rem;
            }
            
            .company-logo-sm {
                width: 24px;
                height: 24px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: 700;
                color: #C3E88D;
            }
            
            .company-name-sm {
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.5);
            }
            
            .job-title-compact {
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 0.75rem;
                line-height: 1.4;
            }
            
            .match-indicator {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.25rem;
            }
            
            .match-circle {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: conic-gradient(#C3E88D 0deg, #C3E88D calc(var(--match) * 3.6deg), rgba(255, 255, 255, 0.1) calc(var(--match) * 3.6deg));
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            
            .match-circle::before {
                content: '';
                position: absolute;
                width: 40px;
                height: 40px;
                background: #0f0f0f;
                border-radius: 50%;
            }
            
            .match-value {
                position: relative;
                font-size: 0.9rem;
                font-weight: 700;
                color: #C3E88D;
                z-index: 1;
            }
            
            .match-label {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.4);
            }
            
            .job-tags-compact {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
                margin-bottom: 0.75rem;
            }
            
            .tag-compact {
                background: rgba(130, 170, 255, 0.1);
                color: #82aaff;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
            }
            
            .job-compact-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 0.75rem;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .job-meta-compact {
                display: flex;
                gap: 1rem;
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.4);
            }
            
            .war-room-link {
                background: rgba(255, 234, 0, 0.1);
                color: #ffea00;
                padding: 0.25rem 0.75rem;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 500;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 0.25rem;
                transition: all 0.3s;
            }
            
            .war-room-link:hover {
                background: rgba(255, 234, 0, 0.2);
                transform: translateY(-1px);
            }
            
            /* 사이드바 */
            .sidebar {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }
            
            /* 로드맵 위젯 */
            .roadmap-widget {
                background: linear-gradient(135deg, rgba(195, 232, 141, 0.08) 0%, rgba(195, 232, 141, 0.02) 100%);
                border: 1px solid rgba(195, 232, 141, 0.2);
                border-radius: 16px;
                padding: 1.5rem;
                text-align: center;
            }
            
            .roadmap-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            
            .roadmap-title {
                font-size: 1.2rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: #C3E88D;
            }
            
            .roadmap-desc {
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 1rem;
                line-height: 1.5;
            }
            
            .roadmap-btn {
                background: #C3E88D;
                color: #000;
                border: none;
                border-radius: 10px;
                padding: 0.75rem 1.5rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                width: 100%;
                font-size: 0.95rem;
            }
            
            .roadmap-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(195, 232, 141, 0.3);
            }
            
            /* 트렌드 위젯 */
            .trend-widget {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 1.5rem;
            }
            
            .trend-widget-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .trend-widget-title {
                font-size: 1.1rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .trend-list {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            
            .trend-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.75rem;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 8px;
                transition: all 0.3s;
            }
            
            .trend-item:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .trend-rank {
                width: 32px;
                height: 32px;
                background: rgba(195, 232, 141, 0.1);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                color: #C3E88D;
            }
            
            .trend-info {
                flex: 1;
            }
            
            .trend-name {
                font-weight: 600;
                margin-bottom: 0.125rem;
            }
            
            .trend-change {
                font-size: 0.8rem;
                color: #82aaff;
            }
            
            .trend-graph {
                width: 40px;
                height: 20px;
                display: flex;
                align-items: flex-end;
                gap: 2px;
            }
            
            .trend-bar {
                flex: 1;
                background: rgba(195, 232, 141, 0.3);
                border-radius: 2px;
                transition: height 0.3s;
            }
            
            /* 작전 회의실 위젯 */
            .warroom-widget {
                background: rgba(255, 234, 0, 0.03);
                border: 1px solid rgba(255, 234, 0, 0.15);
                border-radius: 16px;
                padding: 1.5rem;
            }
            
            .warroom-widget-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .warroom-widget-title {
                font-size: 1.1rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #ffea00;
            }
            
            .warroom-count {
                background: rgba(255, 234, 0, 0.2);
                color: #ffea00;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .warroom-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .warroom-item {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 8px;
                padding: 0.75rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .warroom-item:hover {
                background: rgba(255, 234, 0, 0.05);
            }
            
            .warroom-company {
                font-weight: 600;
                font-size: 0.9rem;
                margin-bottom: 0.125rem;
            }
            
            .warroom-position {
                font-size: 0.8rem;
                color: rgba(255, 255, 255, 0.5);
            }
            
            .warroom-members {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.6);
            }
            
            /* 하단 섹션 */
            .bottom-section {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
            }
            
            /* 최근 본 공고 */
            .recent-section {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 1.5rem;
            }
            
            .recent-list {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            
            .recent-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.75rem;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .recent-item:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .recent-logo {
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                color: #82aaff;
            }
            
            .recent-info {
                flex: 1;
            }
            
            .recent-title {
                font-weight: 600;
                margin-bottom: 0.125rem;
                font-size: 0.95rem;
            }
            
            .recent-company {
                font-size: 0.8rem;
                color: rgba(255, 255, 255, 0.5);
            }
            
            .recent-time {
                font-size: 0.8rem;
                color: rgba(255, 255, 255, 0.4);
            }
            
            /* 검색 플로팅 버튼 */
            .search-float {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                background: #C3E88D;
                color: #000;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(195, 232, 141, 0.4);
                transition: all 0.3s;
                z-index: 50;
            }
            
            .search-float:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 30px rgba(195, 232, 141, 0.5);
            }
        </style>
    </head>
    <body>
        <!-- 헤더 -->
        <header class="header">
            <div class="header-content">
                <div class="logo">
                    <span class="logo-text">AsyncSite</span>
                </div>
                <nav class="nav-tabs">
                    <a href="#" class="nav-tab">스터디</a>
                    <a href="#" class="nav-tab active">Ignition</a>
                    <a href="#" class="nav-tab">커뮤니티</a>
                </nav>
            </div>
        </header>
    
        <!-- 대시보드 컨테이너 -->
        <div class="dashboard-container">
            <!-- 개인화 헤더 -->
            <section class="personal-header">
                <h1 class="greeting">안녕하세요, 김개발님! 👋</h1>
                <p class="sub-greeting">오늘도 당신의 커리어 성장을 응원합니다</p>
                
                <div class="quick-stats">
                    <div class="quick-stat">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-content">
                            <div class="stat-value">92%</div>
                            <div class="stat-label">평균 매칭률</div>
                        </div>
                    </div>
                    <div class="quick-stat">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <div class="stat-value">15개</div>
                            <div class="stat-label">새로운 기회</div>
                        </div>
                    </div>
                    <div class="quick-stat">
                        <div class="stat-icon">🚀</div>
                        <div class="stat-content">
                            <div class="stat-value">3개</div>
                            <div class="stat-label">진행중인 로드맵</div>
                        </div>
                    </div>
                    <div class="quick-stat">
                        <div class="stat-icon">👥</div>
                        <div class="stat-content">
                            <div class="stat-value">8개</div>
                            <div class="stat-label">활성 작전회의실</div>
                        </div>
                    </div>
                </div>
            </section>
    
            <!-- 메인 그리드 -->
            <div class="dashboard-grid">
                <!-- 추천 공고 섹션 -->
                <section class="recommended-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <span>✨</span>
                            <span>맞춤 추천 공고</span>
                        </h2>
                        <a href="#" class="section-action">전체보기 →</a>
                    </div>
    
                    <!-- 공고 카드 1 -->
                    <article class="job-card-compact">
                        <div class="job-compact-header">
                            <div class="job-compact-info">
                                <div class="company-info">
                                    <div class="company-logo-sm">N</div>
                                    <span class="company-name-sm">네이버웹툰</span>
                                </div>
                                <h3 class="job-title-compact">백엔드 서버 개발자 (네이버웹툰)</h3>
                            </div>
                            <div class="match-indicator">
                                <div class="match-circle" style="--match: 95">
                                    <span class="match-value">95%</span>
                                </div>
                                <span class="match-label">매칭</span>
                            </div>
                        </div>
                        <div class="job-tags-compact">
                            <span class="tag-compact">Java</span>
                            <span class="tag-compact">Spring Boot</span>
                            <span class="tag-compact">MSA</span>
                            <span class="tag-compact">Kafka</span>
                        </div>
                        <div class="job-compact-footer">
                            <div class="job-meta-compact">
                                <span>경력 3년+</span>
                                <span>분당</span>
                                <span>~08.31</span>
                            </div>
                            <a href="#" class="war-room-link">
                                <span>👥</span>
                                <span>12명 참여중</span>
                            </a>
                        </div>
                    </article>
    
                    <!-- 공고 카드 2 -->
                    <article class="job-card-compact">
                        <div class="job-compact-header">
                            <div class="job-compact-info">
                                <div class="company-info">
                                    <div class="company-logo-sm">K</div>
                                    <span class="company-name-sm">카카오</span>
                                </div>
                                <h3 class="job-title-compact">카카오페이 결제 서버 개발자</h3>
                            </div>
                            <div class="match-indicator">
                                <div class="match-circle" style="--match: 87">
                                    <span class="match-value">87%</span>
                                </div>
                                <span class="match-label">매칭</span>
                            </div>
                        </div>
                        <div class="job-tags-compact">
                            <span class="tag-compact">Java</span>
                            <span class="tag-compact">Spring Boot</span>
                            <span class="tag-compact">MySQL</span>
                            <span class="tag-compact">Kafka</span>
                        </div>
                        <div class="job-compact-footer">
                            <div class="job-meta-compact">
                                <span>경력 5년+</span>
                                <span>판교</span>
                                <span>~09.15</span>
                            </div>
                            <a href="#" class="war-room-link">
                                <span>👥</span>
                                <span>8명 참여중</span>
                            </a>
                        </div>
                    </article>
    
                    <!-- 공고 카드 3 -->
                    <article class="job-card-compact">
                        <div class="job-compact-header">
                            <div class="job-compact-info">
                                <div class="company-info">
                                    <div class="company-logo-sm">T</div>
                                    <span class="company-name-sm">토스</span>
                                </div>
                                <h3 class="job-title-compact">금융 서비스 백엔드 개발자</h3>
                            </div>
                            <div class="match-indicator">
                                <div class="match-circle" style="--match: 82">
                                    <span class="match-value">82%</span>
                                </div>
                                <span class="match-label">매칭</span>
                            </div>
                        </div>
                        <div class="job-tags-compact">
                            <span class="tag-compact">Kotlin</span>
                            <span class="tag-compact">Spring</span>
                            <span class="tag-compact">Redis</span>
                            <span class="tag-compact">k8s</span>
                        </div>
                        <div class="job-compact-footer">
                            <div class="job-meta-compact">
                                <span>경력 무관</span>
                                <span>강남</span>
                                <span>~09.30</span>
                            </div>
                            <a href="#" class="war-room-link">
                                <span>👥</span>
                                <span>작전회의 시작</span>
                            </a>
                        </div>
                    </article>
                </section>
    
                <!-- 사이드바 -->
                <aside class="sidebar">
                    <!-- 로드맵 위젯 -->
                    <div class="roadmap-widget">
                        <div class="roadmap-icon">🗺️</div>
                        <h3 class="roadmap-title">성장 로드맵</h3>
                        <p class="roadmap-desc">
                            목표 공고까지의 최단 경로를<br>
                            AI가 분석해드립니다
                        </p>
                        <button class="roadmap-btn">내 로드맵 만들기</button>
                    </div>
    
                    <!-- 트렌드 위젯 -->
                    <div class="trend-widget">
                        <div class="trend-widget-header">
                            <h3 class="trend-widget-title">
                                <span>📈</span>
                                <span>실시간 기술 트렌드</span>
                            </h3>
                        </div>
                        <div class="trend-list">
                            <div class="trend-item">
                                <div class="trend-rank">1</div>
                                <div class="trend-info">
                                    <div class="trend-name">Kubernetes</div>
                                    <div class="trend-change">▲ 23% 상승</div>
                                </div>
                                <div class="trend-graph">
                                    <div class="trend-bar" style="height: 40%"></div>
                                    <div class="trend-bar" style="height: 60%"></div>
                                    <div class="trend-bar" style="height: 80%"></div>
                                    <div class="trend-bar" style="height: 100%"></div>
                                </div>
                            </div>
                            <div class="trend-item">
                                <div class="trend-rank">2</div>
                                <div class="trend-info">
                                    <div class="trend-name">Kafka</div>
                                    <div class="trend-change">▲ 18% 상승</div>
                                </div>
                                <div class="trend-graph">
                                    <div class="trend-bar" style="height: 30%"></div>
                                    <div class="trend-bar" style="height: 50%"></div>
                                    <div class="trend-bar" style="height: 70%"></div>
                                    <div class="trend-bar" style="height: 85%"></div>
                                </div>
                            </div>
                            <div class="trend-item">
                                <div class="trend-rank">3</div>
                                <div class="trend-info">
                                    <div class="trend-name">React</div>
                                    <div class="trend-change">▲ 15% 상승</div>
                                </div>
                                <div class="trend-graph">
                                    <div class="trend-bar" style="height: 50%"></div>
                                    <div class="trend-bar" style="height: 55%"></div>
                                    <div class="trend-bar" style="height: 65%"></div>
                                    <div class="trend-bar" style="height: 75%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <!-- 작전 회의실 위젯 -->
                    <div class="warroom-widget">
                        <div class="warroom-widget-header">
                            <h3 class="warroom-widget-title">
                                <span>👥</span>
                                <span>활발한 작전회의실</span>
                            </h3>
                            <span class="warroom-count">23개 활성</span>
                        </div>
                        <div class="warroom-list">
                            <div class="warroom-item">
                                <div>
                                    <div class="warroom-company">네이버웹툰</div>
                                    <div class="warroom-position">백엔드 개발자</div>
                                </div>
                                <div class="warroom-members">
                                    <span>👥</span>
                                    <span>12명</span>
                                </div>
                            </div>
                            <div class="warroom-item">
                                <div>
                                    <div class="warroom-company">카카오</div>
                                    <div class="warroom-position">결제 서버 개발자</div>
                                </div>
                                <div class="warroom-members">
                                    <span>👥</span>
                                    <span>8명</span>
                                </div>
                            </div>
                            <div class="warroom-item">
                                <div>
                                    <div class="warroom-company">쿠팡</div>
                                    <div class="warroom-position">물류 플랫폼</div>
                                </div>
                                <div class="warroom-members">
                                    <span>👥</span>
                                    <span>15명</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
    
            <!-- 하단 섹션 -->
            <div class="bottom-section">
                <!-- 최근 본 공고 -->
                <section class="recent-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <span>🕐</span>
                            <span>최근 본 공고</span>
                        </h2>
                        <a href="#" class="section-action">전체보기 →</a>
                    </div>
                    <div class="recent-list">
                        <div class="recent-item">
                            <div class="recent-logo">B</div>
                            <div class="recent-info">
                                <div class="recent-title">딜리버리 서비스 백엔드</div>
                                <div class="recent-company">배달의민족</div>
                            </div>
                            <div class="recent-time">2시간 전</div>
                        </div>
                        <div class="recent-item">
                            <div class="recent-logo">L</div>
                            <div class="recent-info">
                                <div class="recent-title">커머스 플랫폼 개발자</div>
                                <div class="recent-company">라인</div>
                            </div>
                            <div class="recent-time">어제</div>
                        </div>
                        <div class="recent-item">
                            <div class="recent-logo">S</div>
                            <div class="recent-info">
                                <div class="recent-title">클라우드 엔지니어</div>
                                <div class="recent-company">삼성SDS</div>
                            </div>
                            <div class="recent-time">3일 전</div>
                        </div>
                    </div>
                </section>
    
                <!-- 추가 섹션 영역 -->
                <section class="recent-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <span>💡</span>
                            <span>추천 학습 경로</span>
                        </h2>
                        <a href="#" class="section-action">전체보기 →</a>
                    </div>
                    <div class="recent-list">
                        <div class="recent-item">
                            <div class="recent-logo" style="background: rgba(195, 232, 141, 0.1); color: #C3E88D;">K</div>
                            <div class="recent-info">
                                <div class="recent-title">Kafka 실전 스터디</div>
                                <div class="recent-company">AsyncSite 스터디</div>
                            </div>
                            <div class="recent-time">모집중</div>
                        </div>
                        <div class="recent-item">
                            <div class="recent-logo" style="background: rgba(130, 170, 255, 0.1); color: #82aaff;">D</div>
                            <div class="recent-info">
                                <div class="recent-title">Docker & k8s 마스터</div>
                                <div class="recent-company">AsyncSite 강의</div>
                            </div>
                            <div class="recent-time">인기</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    
        <!-- 검색 플로팅 버튼 -->
        <button class="search-float">🔍</button>
    </body>
    </html>
    ```
