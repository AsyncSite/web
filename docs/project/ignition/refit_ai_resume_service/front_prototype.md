
    
    ```html
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Resume Lab - Prototype 1</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #0a0a0a;
                color: #f0f0f0;
                line-height: 1.6;
            }
            
            .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 2rem;
            }
            
            /* Header */
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 3rem;
                padding-bottom: 2rem;
                border-bottom: 1px solid #2a2a2a;
            }
            
            .logo {
                font-size: 1.5rem;
                font-weight: 700;
                color: #C3E88D;
            }
            
            .nav {
                display: flex;
                gap: 2rem;
            }
            
            .nav a {
                color: #aaa;
                text-decoration: none;
                transition: color 0.3s ease;
            }
            
            .nav a:hover, .nav a.active {
                color: #C3E88D;
            }
            
            /* Main Content */
            .main-title {
                text-align: center;
                margin-bottom: 1rem;
            }
            
            .main-title h1 {
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                background: linear-gradient(135deg, #C3E88D 0%, #82aaff 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .main-title p {
                font-size: 1.125rem;
                color: #aaa;
            }
            
            /* Upload Section */
            .upload-section {
                background: #1a1a1a;
                border-radius: 16px;
                padding: 3rem;
                margin: 3rem 0;
                border: 1px solid #2a2a2a;
                position: relative;
                overflow: hidden;
            }
            
            .upload-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #C3E88D 0%, #82aaff 50%, #ffea00 100%);
            }
            
            .upload-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                margin-top: 2rem;
            }
            
            .upload-card {
                background: #0a0a0a;
                border: 2px dashed #3a3a3a;
                border-radius: 12px;
                padding: 2rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .upload-card:hover {
                border-color: #C3E88D;
                background: #1a1a1a;
            }
            
            .upload-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            
            .upload-title {
                font-size: 1.25rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            .upload-desc {
                color: #aaa;
                font-size: 0.875rem;
            }
            
            /* Job Selection */
            .job-selection {
                background: #1a1a1a;
                border-radius: 12px;
                padding: 1.5rem;
                margin: 2rem 0;
                border: 1px solid #2a2a2a;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .job-selection-content {
                flex: 1;
            }
            
            .job-selection-label {
                font-size: 0.875rem;
                color: #aaa;
                margin-bottom: 0.5rem;
            }
            
            .selected-job {
                font-size: 1.125rem;
                font-weight: 600;
                color: #82aaff;
            }
            
            .select-job-btn {
                padding: 0.75rem 1.5rem;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 8px;
                color: #f0f0f0;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .select-job-btn:hover {
                background: #3a3a3a;
                border-color: #C3E88D;
            }
            
            /* Action Button */
            .action-section {
                text-align: center;
                margin: 3rem 0;
            }
            
            .analyze-btn {
                padding: 1rem 3rem;
                font-size: 1.125rem;
                font-weight: 600;
                background: linear-gradient(135deg, #C3E88D 0%, #82aaff 100%);
                color: #0a0a0a;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .analyze-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(195, 232, 141, 0.4);
            }
            
            .analyze-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .usage-info {
                margin-top: 1rem;
                color: #aaa;
                font-size: 0.875rem;
            }
            
            /* Features Grid */
            .features-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 2rem;
                margin: 4rem 0;
            }
            
            .feature-card {
                background: #1a1a1a;
                border-radius: 12px;
                padding: 2rem;
                border: 1px solid #2a2a2a;
                transition: all 0.3s ease;
            }
            
            .feature-card:hover {
                transform: translateY(-4px);
                border-color: #3a3a3a;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
            }
            
            .feature-icon {
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #C3E88D20 0%, #82aaff20 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
            
            .feature-title {
                font-size: 1.125rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            .feature-desc {
                color: #aaa;
                font-size: 0.875rem;
                line-height: 1.6;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <header class="header">
                <div class="logo">AI Resume Lab</div>
                <nav class="nav">
                    <a href="#" class="active">분석하기</a>
                    <a href="#">내 이력서</a>
                    <a href="#">분석 결과</a>
                    <a href="#">가이드</a>
                </nav>
            </header>
            
            <!-- Main Content -->
            <main>
                <div class="main-title">
                    <h1>AI 이력서 분석 실험실</h1>
                    <p>당신의 경험을 '성취'의 언어로 번역합니다</p>
                </div>
                
                <!-- Upload Section -->
                <section class="upload-section">
                    <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">STEP 1: 분석할 이력서를 입력해주세요</h2>
                    
                    <div class="upload-grid">
                        <div class="upload-card">
                            <div class="upload-icon">📄</div>
                            <div class="upload-title">텍스트로 입력</div>
                            <div class="upload-desc">이력서 내용을 직접 붙여넣기</div>
                        </div>
                        
                        <div class="upload-card">
                            <div class="upload-icon">📁</div>
                            <div class="upload-title">파일 업로드</div>
                            <div class="upload-desc">PDF, DOCX, Markdown 지원</div>
                        </div>
                    </div>
                </section>
                
                <!-- Job Selection -->
                <section class="job-selection">
                    <div class="job-selection-content">
                        <div class="job-selection-label">STEP 2: 분석 기준이 될 목표 공고</div>
                        <div class="selected-job">목표 공고를 선택해주세요</div>
                    </div>
                    <button class="select-job-btn">+ 목표 공고 선택하기</button>
                </section>
                
                <!-- Action Button -->
                <section class="action-section">
                    <button class="analyze-btn" disabled>🚀 AI 분석 시작하기 (예상 소요 시간: 약 15초)</button>
                    <div class="usage-info">오늘 2회 더 분석할 수 있습니다</div>
                </section>
                
                <!-- Features -->
                <section class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">🎯</div>
                        <div class="feature-title">목표 공고 기반 분석</div>
                        <div class="feature-desc">지원하려는 회사와 직무에 최적화된 맞춤형 분석을 제공합니다</div>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">⭐</div>
                        <div class="feature-title">STAR 기법 재구성</div>
                        <div class="feature-desc">프로젝트 경험을 구체적인 성과 중심으로 재구성해드립니다</div>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <div class="feature-title">경쟁력 분석</div>
                        <div class="feature-desc">동일 직무 지원자 대비 경쟁력을 객관적으로 평가합니다</div>
                    </div>
                </section>
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
        <title>AI Resume Lab - Prototype 2</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #0f0f0f;
                color: #e0e0e0;
                display: flex;
                min-height: 100vh;
            }
            
            /* Sidebar */
            .sidebar {
                width: 280px;
                background: #1a1a1a;
                border-right: 1px solid #2a2a2a;
                padding: 2rem;
                position: fixed;
                height: 100vh;
                overflow-y: auto;
            }
            
            .logo {
                font-size: 1.5rem;
                font-weight: 700;
                color: #C3E88D;
                margin-bottom: 3rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .logo::before {
                content: '🔬';
                font-size: 1.25rem;
            }
            
            .sidebar-menu {
                list-style: none;
            }
            
            .sidebar-menu li {
                margin-bottom: 0.5rem;
            }
            
            .sidebar-menu a {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.75rem 1rem;
                color: #aaa;
                text-decoration: none;
                border-radius: 8px;
                transition: all 0.3s ease;
            }
            
            .sidebar-menu a:hover {
                background: #2a2a2a;
                color: #f0f0f0;
            }
            
            .sidebar-menu a.active {
                background: linear-gradient(135deg, #C3E88D20 0%, #82aaff20 100%);
                color: #C3E88D;
                border: 1px solid #C3E88D40;
            }
            
            .progress-section {
                margin-top: 3rem;
                padding-top: 2rem;
                border-top: 1px solid #2a2a2a;
            }
            
            .progress-title {
                font-size: 0.875rem;
                color: #aaa;
                margin-bottom: 1rem;
            }
            
            .progress-bar {
                height: 8px;
                background: #2a2a2a;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 0.5rem;
            }
            
            .progress-fill {
                height: 100%;
                width: 70%;
                background: linear-gradient(90deg, #C3E88D 0%, #82aaff 100%);
                border-radius: 4px;
                transition: width 0.3s ease;
            }
            
            .progress-text {
                font-size: 0.875rem;
                color: #82aaff;
            }
            
            /* Main Content */
            .main-content {
                flex: 1;
                margin-left: 280px;
                padding: 2rem 3rem;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 3rem;
            }
            
            .page-title h1 {
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
            }
            
            .page-title p {
                color: #aaa;
            }
            
            .header-actions {
                display: flex;
                gap: 1rem;
            }
            
            .header-btn {
                padding: 0.75rem 1.5rem;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 8px;
                color: #f0f0f0;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.875rem;
            }
            
            .header-btn:hover {
                background: #3a3a3a;
                border-color: #4a4a4a;
            }
            
            /* Content Sections */
            .content-section {
                background: #1a1a1a;
                border-radius: 16px;
                padding: 2.5rem;
                margin-bottom: 2rem;
                border: 1px solid #2a2a2a;
                position: relative;
            }
            
            .section-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .section-number {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #C3E88D20 0%, #82aaff20 100%);
                border: 1px solid #C3E88D40;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                color: #C3E88D;
            }
            
            .section-title {
                font-size: 1.25rem;
                font-weight: 600;
            }
            
            /* Resume Input */
            .resume-input-area {
                background: #0f0f0f;
                border: 1px solid #2a2a2a;
                border-radius: 12px;
                padding: 1.5rem;
                min-height: 300px;
            }
            
            .input-tabs {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
                border-bottom: 1px solid #2a2a2a;
                padding-bottom: 1rem;
            }
            
            .input-tab {
                padding: 0.5rem 1rem;
                background: none;
                border: none;
                color: #aaa;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.3s ease;
                position: relative;
            }
            
            .input-tab.active {
                color: #C3E88D;
            }
            
            .input-tab.active::after {
                content: '';
                position: absolute;
                bottom: -1rem;
                left: 0;
                right: 0;
                height: 2px;
                background: #C3E88D;
            }
            
            .textarea-wrapper {
                position: relative;
            }
            
            .resume-textarea {
                width: 100%;
                min-height: 200px;
                background: transparent;
                border: none;
                color: #f0f0f0;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 0.875rem;
                line-height: 1.6;
                resize: vertical;
                outline: none;
            }
            
            .resume-textarea::placeholder {
                color: #4a4a4a;
            }
            
            /* Job Selection Enhanced */
            .job-selector {
                background: #0f0f0f;
                border: 1px solid #2a2a2a;
                border-radius: 12px;
                padding: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .job-selector:hover {
                border-color: #3a3a3a;
            }
            
            .job-info {
                flex: 1;
            }
            
            .job-label {
                font-size: 0.875rem;
                color: #aaa;
                margin-bottom: 0.5rem;
            }
            
            .job-selected {
                font-size: 1rem;
                color: #82aaff;
                font-weight: 500;
            }
            
            .job-icon {
                font-size: 1.5rem;
                color: #4a4a4a;
            }
            
            /* Analysis Button */
            .analysis-section {
                background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                border-radius: 16px;
                padding: 2rem;
                text-align: center;
                border: 1px solid #3a3a3a;
            }
            
            .analysis-btn {
                padding: 1rem 3rem;
                font-size: 1.125rem;
                font-weight: 600;
                background: linear-gradient(135deg, #C3E88D 0%, #82aaff 100%);
                color: #0a0a0a;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 1rem;
            }
            
            .analysis-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(195, 232, 141, 0.4);
            }
            
            .analysis-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .analysis-info {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin-top: 1rem;
            }
            
            .info-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                color: #aaa;
            }
            
            .info-icon {
                color: #C3E88D;
            }
        </style>
    </head>
    <body>
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="logo">AI Resume Lab</div>
            
            <ul class="sidebar-menu">
                <li><a href="#" class="active">📝 새 분석</a></li>
                <li><a href="#">📁 내 이력서</a></li>
                <li><a href="#">📊 분석 결과</a></li>
                <li><a href="#">🎯 목표 설정</a></li>
                <li><a href="#">💡 인사이트</a></li>
                <li><a href="#">📚 가이드</a></li>
            </ul>
            
            <div class="progress-section">
                <div class="progress-title">오늘의 분석 현황</div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">1/3회 사용</div>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="main-content">
            <header class="header">
                <div class="page-title">
                    <h1>새로운 이력서 분석</h1>
                    <p>AI가 당신의 경험을 가장 효과적으로 표현하는 방법을 찾아드립니다</p>
                </div>
                <div class="header-actions">
                    <button class="header-btn">저장된 템플릿</button>
                    <button class="header-btn">이전 분석 불러오기</button>
                </div>
            </header>
            
            <!-- Step 1: Resume Input -->
            <section class="content-section">
                <div class="section-header">
                    <div class="section-number">1</div>
                    <h2 class="section-title">이력서 입력</h2>
                </div>
                
                <div class="resume-input-area">
                    <div class="input-tabs">
                        <button class="input-tab active">텍스트 입력</button>
                        <button class="input-tab">파일 업로드</button>
                        <button class="input-tab">URL 가져오기</button>
                    </div>
                    
                    <div class="textarea-wrapper">
                        <textarea class="resume-textarea" placeholder="이력서 내용을 붙여넣어 주세요.&#10;&#10;팁: Markdown 형식을 지원합니다. 섹션을 명확히 구분하면 더 정확한 분석이 가능합니다."></textarea>
                    </div>
                </div>
            </section>
            
            <!-- Step 2: Job Selection -->
            <section class="content-section">
                <div class="section-header">
                    <div class="section-number">2</div>
                    <h2 class="section-title">목표 공고 선택</h2>
                </div>
                
                <div class="job-selector">
                    <div class="job-info">
                        <div class="job-label">분석 기준이 될 채용 공고</div>
                        <div class="job-selected">클릭하여 목표 공고를 선택하세요</div>
                    </div>
                    <div class="job-icon">→</div>
                </div>
            </section>
            
            <!-- Analysis Action -->
            <section class="analysis-section">
                <button class="analysis-btn" disabled>
                    🚀 AI 분석 시작하기
                </button>
                
                <div class="analysis-info">
                    <div class="info-item">
                        <span class="info-icon">⏱</span>
                        <span>예상 소요 시간: 15초</span>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">✨</span>
                        <span>4가지 차원의 심층 분석</span>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">📈</span>
                        <span>개선 제안 평균 12개</span>
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
        <title>AI Resume Lab - Prototype 3</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #0a0a0a;
                color: #e8e8e8;
                height: 100vh;
                overflow: hidden;
            }
            
            /* Header */
            .app-header {
                height: 60px;
                background: #141414;
                border-bottom: 1px solid #252525;
                display: flex;
                align-items: center;
                padding: 0 2rem;
                justify-content: space-between;
            }
            
            .header-left {
                display: flex;
                align-items: center;
                gap: 3rem;
            }
            
            .app-logo {
                font-size: 1.25rem;
                font-weight: 700;
                color: #C3E88D;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .header-nav {
                display: flex;
                gap: 2rem;
            }
            
            .header-nav a {
                color: #888;
                text-decoration: none;
                font-size: 0.875rem;
                transition: color 0.3s ease;
            }
            
            .header-nav a:hover, .header-nav a.active {
                color: #C3E88D;
            }
            
            .header-right {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .analysis-status {
                padding: 0.5rem 1rem;
                background: #1a1a1a;
                border-radius: 8px;
                font-size: 0.875rem;
                color: #888;
            }
            
            .analysis-status.ready {
                background: linear-gradient(135deg, #C3E88D20 0%, #82aaff20 100%);
                color: #C3E88D;
                border: 1px solid #C3E88D40;
            }
            
            /* Main Layout */
            .main-container {
                height: calc(100vh - 60px);
                display: flex;
            }
            
            /* Split View */
            .editor-panel, .assistant-panel {
                flex: 1;
                height: 100%;
                overflow-y: auto;
            }
            
            .editor-panel {
                background: #0f0f0f;
                border-right: 1px solid #252525;
            }
            
            .assistant-panel {
                background: #141414;
            }
            
            /* Editor Panel */
            .editor-header {
                padding: 1.5rem 2rem;
                background: #141414;
                border-bottom: 1px solid #252525;
            }
            
            .editor-title {
                font-size: 1.125rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            .editor-subtitle {
                font-size: 0.875rem;
                color: #888;
            }
            
            .editor-content {
                padding: 2rem;
            }
            
            .input-section {
                margin-bottom: 2rem;
            }
            
            .input-label {
                font-size: 0.875rem;
                color: #888;
                margin-bottom: 0.75rem;
                display: block;
            }
            
            .resume-input {
                width: 100%;
                min-height: 400px;
                background: #1a1a1a;
                border: 1px solid #252525;
                border-radius: 8px;
                padding: 1.5rem;
                color: #e8e8e8;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 0.875rem;
                line-height: 1.6;
                resize: vertical;
            }
            
            .resume-input:focus {
                outline: none;
                border-color: #C3E88D40;
            }
            
            .job-selection-box {
                background: #1a1a1a;
                border: 1px solid #252525;
                border-radius: 8px;
                padding: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .job-selection-box:hover {
                border-color: #C3E88D40;
            }
            
            .job-placeholder {
                color: #666;
            }
            
            .add-btn {
                color: #C3E88D;
                font-size: 1.25rem;
            }
            
            /* Assistant Panel */
            .assistant-header {
                padding: 1.5rem 2rem;
                background: #1a1a1a;
                border-bottom: 1px solid #252525;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .assistant-title {
                font-size: 1.125rem;
                font-weight: 600;
                color: #82aaff;
            }
            
            .ai-status {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                color: #888;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                background: #4a4a4a;
                border-radius: 50%;
            }
            
            .status-dot.active {
                background: #C3E88D;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .assistant-content {
                padding: 2rem;
            }
            
            /* AI Suggestions */
            .suggestion-card {
                background: #1a1a1a;
                border: 1px solid #252525;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
                transition: all 0.3s ease;
            }
            
            .suggestion-card:hover {
                border-color: #3a3a3a;
                transform: translateY(-2px);
            }
            
            .suggestion-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 1rem;
            }
            
            .suggestion-icon {
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #C3E88D20 0%, #82aaff20 100%);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }
            
            .suggestion-title {
                font-size: 0.875rem;
                font-weight: 600;
            }
            
            .suggestion-content {
                font-size: 0.875rem;
                color: #aaa;
                line-height: 1.6;
                margin-bottom: 1rem;
            }
            
            .suggestion-action {
                display: flex;
                gap: 0.75rem;
            }
            
            .suggestion-btn {
                padding: 0.5rem 1rem;
                font-size: 0.75rem;
                border-radius: 6px;
                border: 1px solid #252525;
                background: #0f0f0f;
                color: #e8e8e8;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .suggestion-btn.primary {
                background: linear-gradient(135deg, #C3E88D20 0%, #82aaff20 100%);
                border-color: #C3E88D40;
                color: #C3E88D;
            }
            
            .suggestion-btn:hover {
                transform: translateY(-1px);
                border-color: #3a3a3a;
            }
            
            /* Score Display */
            .score-display {
                background: linear-gradient(135deg, #1a1a1a 0%, #252525 100%);
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 2rem;
                text-align: center;
                border: 1px solid #252525;
            }
            
            .score-label {
                font-size: 0.875rem;
                color: #888;
                margin-bottom: 0.5rem;
            }
            
            .score-value {
                font-size: 3rem;
                font-weight: 700;
                background: linear-gradient(135deg, #C3E88D 0%, #82aaff 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 1rem;
            }
            
            .score-change {
                font-size: 0.875rem;
                color: #C3E88D;
            }
            
            /* Bottom Action Bar */
            .action-bar {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 80px;
                background: #141414;
                border-top: 1px solid #252525;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                padding: 0 2rem;
                z-index: 100;
            }
            
            .analyze-button {
                padding: 1rem 3rem;
                font-size: 1rem;
                font-weight: 600;
                background: linear-gradient(135deg, #C3E88D 0%, #82aaff 100%);
                color: #0a0a0a;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .analyze-button:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(195, 232, 141, 0.3);
            }
            
            .analyze-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .action-info {
                font-size: 0.875rem;
                color: #888;
            }
        </style>
    </head>
    <body>
        <!-- Header -->
        <header class="app-header">
            <div class="header-left">
                <div class="app-logo">
                    <span>🔬</span>
                    <span>AI Resume Lab</span>
                </div>
                <nav class="header-nav">
                    <a href="#" class="active">에디터</a>
                    <a href="#">분석 결과</a>
                    <a href="#">버전 관리</a>
                    <a href="#">템플릿</a>
                </nav>
            </div>
            <div class="header-right">
                <div class="analysis-status">
                    분석 대기 중
                </div>
            </div>
        </header>
        
        <!-- Main Container -->
        <div class="main-container">
            <!-- Editor Panel -->
            <section class="editor-panel">
                <div class="editor-header">
                    <h2 class="editor-title">이력서 작성</h2>
                    <p class="editor-subtitle">AI가 실시간으로 개선점을 제안합니다</p>
                </div>
                
                <div class="editor-content">
                    <div class="input-section">
                        <label class="input-label">이력서 내용</label>
                        <textarea class="resume-input" placeholder="이력서 내용을 입력하거나 붙여넣으세요..."></textarea>
                    </div>
                    
                    <div class="input-section">
                        <label class="input-label">목표 채용 공고</label>
                        <div class="job-selection-box">
                            <span class="job-placeholder">목표 공고를 선택하세요</span>
                            <span class="add-btn">+</span>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Assistant Panel -->
            <section class="assistant-panel">
                <div class="assistant-header">
                    <h2 class="assistant-title">AI 어시스턴트</h2>
                    <div class="ai-status">
                        <div class="status-dot"></div>
                        <span>대기 중</span>
                    </div>
                </div>
                
                <div class="assistant-content">
                    <!-- Score Display -->
                    <div class="score-display">
                        <div class="score-label">예상 직무 적합도</div>
                        <div class="score-value">-</div>
                        <div class="score-change">분석을 시작해주세요</div>
                    </div>
                    
                    <!-- AI Suggestions -->
                    <div class="suggestion-card">
                        <div class="suggestion-header">
                            <div class="suggestion-icon">💡</div>
                            <div class="suggestion-title">시작하기 전에</div>
                        </div>
                        <div class="suggestion-content">
                            효과적인 이력서 분석을 위해 다음 사항을 확인해주세요:
                            <br>• 경력사항, 프로젝트, 기술스택이 명확히 구분되어 있나요?
                            <br>• 구체적인 성과나 수치가 포함되어 있나요?
                            <br>• 목표 회사/직무에 맞는 키워드가 있나요?
                        </div>
                    </div>
                    
                    <div class="suggestion-card">
                        <div class="suggestion-header">
                            <div class="suggestion-icon">🎯</div>
                            <div class="suggestion-title">목표 공고 선택의 중요성</div>
                        </div>
                        <div class="suggestion-content">
                            목표 공고를 선택하면 해당 직무에 최적화된 분석을 제공합니다. 
                            회사별 선호 키워드와 필수 역량을 기준으로 맞춤형 개선안을 제시해드립니다.
                        </div>
                        <div class="suggestion-action">
                            <button class="suggestion-btn primary">공고 선택하기</button>
                            <button class="suggestion-btn">건너뛰기</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        
        <!-- Bottom Action Bar -->
        <div class="action-bar">
            <button class="analyze-button" disabled>
                🚀 AI 분석 시작하기
            </button>
            <span class="action-info">이력서와 목표 공고를 모두 입력하면 분석을 시작할 수 있습니다</span>
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
        <title>AI Resume Lab - Analysis Result</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #0a0a0a;
                color: #e8e8e8;
                line-height: 1.6;
            }
            
            /* Header */
            .header {
                background: #141414;
                border-bottom: 1px solid #252525;
                padding: 1.5rem 0;
                position: sticky;
                top: 0;
                z-index: 100;
            }
            
            .header-content {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .back-button {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #888;
                text-decoration: none;
                transition: color 0.3s ease;
            }
            
            .back-button:hover {
                color: #C3E88D;
            }
            
            .header-actions {
                display: flex;
                gap: 1rem;
            }
            
            .header-btn {
                padding: 0.75rem 1.5rem;
                background: #1a1a1a;
                border: 1px solid #252525;
                border-radius: 8px;
                color: #e8e8e8;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.875rem;
            }
            
            .header-btn:hover {
                background: #252525;
                border-color: #3a3a3a;
            }
            
            .header-btn.primary {
                background: linear-gradient(135deg, #C3E88D20 0%, #82aaff20 100%);
                border-color: #C3E88D40;
                color: #C3E88D;
            }
            
            /* Main Container */
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 3rem 2rem;
            }
            
            /* Result Header */
            .result-header {
                text-align: center;
                margin-bottom: 3rem;
            }
            
            .result-title {
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
            }
            
            .result-subtitle {
                color: #888;
                font-size: 1rem;
            }
            
            .analysis-meta {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin-top: 1.5rem;
                font-size: 0.875rem;
                color: #666;
            }
            
            .meta-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            /* Overall Score Section */
            .score-section {
                background: #141414;
                border: 1px solid #252525;
                border-radius: 16px;
                padding: 3rem;
                margin-bottom: 3rem;
                position: relative;
                overflow: hidden;
            }
            
            .score-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #C3E88D 0%, #82aaff 50%, #ffea00 100%);
            }
            
            .score-content {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 3rem;
                align-items: center;
            }
            
            .score-circle {
                position: relative;
                width: 200px;
                height: 200px;
                margin: 0 auto;
            }
            
            .score-circle svg {
                transform: rotate(-90deg);
            }
            
            .score-circle-bg {
                fill: none;
                stroke: #252525;
                stroke-width: 20;
            }
            
            .score-circle-progress {
                fill: none;
                stroke: url(#gradient);
                stroke-width: 20;
                stroke-linecap: round;
                stroke-dasharray: 565;
                stroke-dashoffset: 141; /* 75% = 565 * 0.25 */
                transition: stroke-dashoffset 1s ease;
            }
            
            .score-number {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 3rem;
                font-weight: 700;
                background: linear-gradient(135deg, #C3E88D 0%, #82aaff 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .score-details {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1.5rem;
            }
            
            .score-item {
                background: #1a1a1a;
                border: 1px solid #252525;
                border-radius: 12px;
                padding: 1.5rem;
            }
            
            .score-item-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            
            .score-item-title {
                font-size: 0.875rem;
                color: #888;
            }
            
            .score-item-value {
                font-size: 1.25rem;
                font-weight: 600;
                color: #C3E88D;
            }
            
            .score-item-bar {
                height: 6px;
                background: #252525;
                border-radius: 3px;
                overflow: hidden;
                margin-top: 0.5rem;
            }
            
            .score-item-fill {
                height: 100%;
                background: linear-gradient(90deg, #C3E88D 0%, #82aaff 100%);
                border-radius: 3px;
                transition: width 1s ease;
            }
            
            /* Analysis Sections */
            .analysis-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 2rem;
                margin-bottom: 3rem;
            }
            
            .analysis-card {
                background: #141414;
                border: 1px solid #252525;
                border-radius: 12px;
                padding: 2rem;
                transition: all 0.3s ease;
            }
            
            .analysis-card:hover {
                transform: translateY(-4px);
                border-color: #3a3a3a;
            }
            
            .card-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .card-icon {
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #C3E88D20 0%, #82aaff20 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }
            
            .card-title {
                font-size: 1.125rem;
                font-weight: 600;
            }
            
            .card-content ul {
                list-style: none;
            }
            
            .card-content li {
                padding: 0.75rem 0;
                border-bottom: 1px solid #252525;
                font-size: 0.875rem;
                color: #aaa;
                display: flex;
                align-items: start;
                gap: 0.75rem;
            }
            
            .card-content li:last-child {
                border-bottom: none;
            }
            
            .card-content li::before {
                content: '•';
                color: #C3E88D;
                font-weight: bold;
            }
            
            /* Improvements Section */
            .improvements-section {
                background: #141414;
                border: 1px solid #252525;
                border-radius: 16px;
                padding: 2.5rem;
                margin-bottom: 3rem;
            }
            
            .improvements-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }
            
            .improvements-title {
                font-size: 1.5rem;
                font-weight: 600;
            }
            
            .filter-tabs {
                display: flex;
                gap: 0.5rem;
            }
            
            .filter-tab {
                padding: 0.5rem 1rem;
                background: #1a1a1a;
                border: 1px solid #252525;
                border-radius: 8px;
                color: #888;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .filter-tab.active {
                background: linear-gradient(135deg, #C3E88D20 0%, #82aaff20 100%);
                border-color: #C3E88D40;
                color: #C3E88D;
            }
            
            .improvement-item {
                background: #1a1a1a;
                border: 1px solid #252525;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1rem;
            }
            
            .improvement-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 1rem;
            }
            
            .improvement-info {
                flex: 1;
            }
            
            .improvement-label {
                font-size: 0.75rem;
                color: #888;
                margin-bottom: 0.25rem;
            }
            
            .improvement-title {
                font-size: 1rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            .improvement-priority {
                padding: 0.25rem 0.75rem;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 600;
            }
            
            .priority-high {
                background: #ef444420;
                color: #ef4444;
                border: 1px solid #ef444440;
            }
            
            .priority-medium {
                background: #f59e0b20;
                color: #f59e0b;
                border: 1px solid #f59e0b40;
            }
            
            .improvement-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1.5rem;
            }
            
            .content-box {
                background: #0f0f0f;
                border: 1px solid #252525;
                border-radius: 8px;
                padding: 1rem;
            }
            
            .content-label {
                font-size: 0.75rem;
                color: #666;
                margin-bottom: 0.5rem;
            }
            
            .content-text {
                font-size: 0.875rem;
                line-height: 1.6;
            }
            
            .improvement-action {
                margin-top: 1rem;
                display: flex;
                gap: 0.75rem;
            }
            
            .improvement-btn {
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
                border-radius: 6px;
                border: 1px solid #252525;
                background: #0f0f0f;
                color: #e8e8e8;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .improvement-btn.primary {
                background: linear-gradient(135deg, #C3E88D20 0%, #82aaff20 100%);
                border-color: #C3E88D40;
                color: #C3E88D;
            }
            
            /* Next Steps */
            .next-steps {
                background: linear-gradient(135deg, #141414 0%, #1a1a1a 100%);
                border: 1px solid #252525;
                border-radius: 16px;
                padding: 2.5rem;
                text-align: center;
            }
            
            .next-steps-title {
                font-size: 1.5rem;
                font-weight: 600;
                margin-bottom: 1rem;
            }
            
            .next-steps-subtitle {
                color: #888;
                margin-bottom: 2rem;
            }
            
            .next-steps-actions {
                display: flex;
                justify-content: center;
                gap: 1rem;
            }
            
            .action-btn {
                padding: 1rem 2rem;
                font-size: 1rem;
                font-weight: 600;
                border-radius: 12px;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .action-btn.primary {
                background: linear-gradient(135deg, #C3E88D 0%, #82aaff 100%);
                color: #0a0a0a;
            }
            
            .action-btn.secondary {
                background: #1a1a1a;
                color: #e8e8e8;
                border: 1px solid #252525;
            }
            
            .action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
            }
        </style>
    </head>
    <body>
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <a href="#" class="back-button">
                    ← 이력서 목록으로
                </a>
                <div class="header-actions">
                    <button class="header-btn">📄 PDF 내보내기</button>
                    <button class="header-btn">📊 상세 리포트</button>
                    <button class="header-btn primary">💾 새 버전으로 저장</button>
                </div>
            </div>
        </header>
        
        <!-- Main Container -->
        <main class="container">
            <!-- Result Header -->
            <section class="result-header">
                <h1 class="result-title">'네이버 지원용 v1' 이력서 분석 리포트</h1>
                <p class="result-subtitle">목표 공고: 네이버웹툰 백엔드 서버 개발자</p>
                <div class="analysis-meta">
                    <div class="meta-item">
                        <span>📅</span>
                        <span>2024.07.31 15:32</span>
                    </div>
                    <div class="meta-item">
                        <span>⏱</span>
                        <span>분석 시간: 14초</span>
                    </div>
                    <div class="meta-item">
                        <span>🔍</span>
                        <span>4차원 심층 분석</span>
                    </div>
                </div>
            </section>
            
            <!-- Overall Score Section -->
            <section class="score-section">
                <div class="score-content">
                    <div class="score-circle">
                        <svg width="200" height="200">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#C3E88D;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#82aaff;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <circle cx="100" cy="100" r="90" class="score-circle-bg"></circle>
                            <circle cx="100" cy="100" r="90" class="score-circle-progress"></circle>
                        </svg>
                        <div class="score-item">
                            <div class="score-item-header">
                                <span class="score-item-title">내용 분석</span>
                                <span class="score-item-value">78/100</span>
                            </div>
                            <div class="score-item-bar">
                                <div class="score-item-fill" style="width: 78%"></div>
                            </div>
                        </div>
                        
                        <div class="score-item">
                            <div class="score-item-header">
                                <span class="score-item-title">맥락 분석</span>
                                <span class="score-item-value">88/100</span>
                            </div>
                            <div class="score-item-bar">
                                <div class="score-item-fill" style="width: 88%"></div>
                            </div>
                        </div>
                        
                        <div class="score-item">
                            <div class="score-item-header">
                                <span class="score-item-title">스토리텔링</span>
                                <span class="score-item-value">82/100</span>
                            </div>
                            <div class="score-item-bar">
                                <div class="score-item-fill" style="width: 82%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Analysis Grid -->
            <section class="analysis-grid">
                <div class="analysis-card">
                    <div class="card-header">
                        <div class="card-icon">💪</div>
                        <h3 class="card-title">강점 분석</h3>
                    </div>
                    <div class="card-content">
                        <ul>
                            <li>MSA 기반 프로젝트 경험을 구체적으로 서술</li>
                            <li>다양한 기술 스택 활용 경험 보유</li>
                            <li>성장 스토리가 일관되게 표현됨</li>
                            <li>프로젝트별 역할과 기여도가 명확함</li>
                        </ul>
                    </div>
                </div>
                
                <div class="analysis-card">
                    <div class="card-header">
                        <div class="card-icon">⚠️</div>
                        <h3 class="card-title">개선 필요</h3>
                    </div>
                    <div class="card-content">
                        <ul>
                            <li>프로젝트 성과에 대한 정량적 표현 부족</li>
                            <li>리더십 경험이나 협업 사례 미흡</li>
                            <li>네이버 핵심 키워드 'Kotlin', 'gRPC' 누락</li>
                            <li>문제 해결 과정의 구체성 부족</li>
                        </ul>
                    </div>
                </div>
                
                <div class="analysis-card">
                    <div class="card-header">
                        <div class="card-icon">🎯</div>
                        <h3 class="card-title">키워드 분석</h3>
                    </div>
                    <div class="card-content">
                        <ul>
                            <li><strong style="color: #C3E88D">매칭됨:</strong> Java, Spring Boot, MSA, Docker</li>
                            <li><strong style="color: #ef4444">누락됨:</strong> Kotlin, gRPC, Kafka, 대용량 트래픽</li>
                            <li><strong style="color: #f59e0b">추가 권장:</strong> 성능 최적화, 모니터링, CI/CD</li>
                        </ul>
                    </div>
                </div>
                
                <div class="analysis-card">
                    <div class="card-header">
                        <div class="card-icon">📊</div>
                        <h3 class="card-title">경쟁력 포지셔닝</h3>
                    </div>
                    <div class="card-content">
                        <ul>
                            <li>동일 경력 대비 상위 35% 수준</li>
                            <li>기술 스택 다양성: 상위 20%</li>
                            <li>정량적 성과 표현: 하위 40%</li>
                            <li>예상 서류 통과율: 65-70%</li>
                        </ul>
                    </div>
                </div>
            </section>
            
            <!-- Improvements Section -->
            <section class="improvements-section">
                <div class="improvements-header">
                    <h2 class="improvements-title">AI 개선 제안</h2>
                    <div class="filter-tabs">
                        <button class="filter-tab active">전체</button>
                        <button class="filter-tab">긴급</button>
                        <button class="filter-tab">프로젝트</button>
                        <button class="filter-tab">기술스택</button>
                    </div>
                </div>
                
                <div class="improvement-item">
                    <div class="improvement-header">
                        <div class="improvement-info">
                            <div class="improvement-label">프로젝트 개선</div>
                            <h4 class="improvement-title">쇼핑몰 프로젝트 - 정량적 성과 추가</h4>
                        </div>
                        <span class="improvement-priority priority-high">긴급</span>
                    </div>
                    <div class="improvement-content">
                        <div class="content-box">
                            <div class="content-label">현재 내용</div>
                            <div class="content-text">"Redis를 도입하여 캐싱을 적용함"</div>
                        </div>
                        <div class="content-box">
                            <div class="content-label">AI 개선 제안</div>
                            <div class="content-text">"반복적인 DB 조회로 인한 지연 시간(500ms)을 개선하기 위해 Redis 캐시를 도입하여, 평균 응답 시간을 150ms로 70% 단축하고 서버 부하를 줄인 경험이 있습니다"</div>
                        </div>
                    </div>
                    <div class="improvement-action">
                        <button class="improvement-btn primary">✨ 제안 적용하기</button>
                        <button class="improvement-btn">다른 예시 보기</button>
                    </div>
                </div>
                
                <div class="improvement-item">
                    <div class="improvement-header">
                        <div class="improvement-info">
                            <div class="improvement-label">키워드 최적화</div>
                            <h4 class="improvement-title">네이버 필수 기술 스택 추가</h4>
                        </div>
                        <span class="improvement-priority priority-medium">중요</span>
                    </div>
                    <div class="improvement-content">
                        <div class="content-box">
                            <div class="content-label">누락된 키워드</div>
                            <div class="content-text">Kotlin, gRPC, Kafka, 대용량 트래픽 처리</div>
                        </div>
                        <div class="content-box">
                            <div class="content-label">추가 방법</div>
                            <div class="content-text">관련 사이드 프로젝트나 학습 경험이 있다면 '기술 스택' 섹션에 추가하고, 실무에서 유사한 경험(예: RabbitMQ → Kafka 학습 중)을 언급하세요</div>
                        </div>
                    </div>
                    <div class="improvement-action">
                        <button class="improvement-btn primary">🎯 키워드 추가하기</button>
                        <button class="improvement-btn">학습 로드맵 보기</button>
                    </div>
                </div>
            </section>
            
            <!-- Next Steps -->
            <section class="next-steps">
                <h2 class="next-steps-title">다음 스텝 제안</h2>
                <p class="next-steps-subtitle">분석 결과를 바탕으로 다음 행동을 추천합니다</p>
                <div class="next-steps-actions">
                    <button class="action-btn primary">🚀 개선사항 적용하고 재분석</button>
                    <button class="action-btn secondary">👥 전문가 리뷰 요청</button>
                    <button class="action-btn secondary">📚 네이버 기술 스택 학습</button>
                </div>
            </section>
        </main>
    </body>
    </html>number">75</div>
                    </div>
                    
                    <div class="score-details">
                        <div class="score-item">
                            <div class="score-item-header">
                                <span class="score-item-title">구조 분석</span>
                                <span class="score-item-value">92/100</span>
                            </div>
                            <div class="score-item-bar">
                                <div class="score-item-fill" style="width: 92%"></div>
                            </div>
                        </div>
                        
                        <div class="score-
    ```
