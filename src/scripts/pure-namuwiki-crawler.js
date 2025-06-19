// Monaco Editor 클립보드 복사 방식 텍스트 추출기
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MonacoClipboardExtractor {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async initialize() {
        console.log('🚀 Monaco 클립보드 추출기 시작 중...');
        this.browser = await puppeteer.launch({
            headless: false, // 클립보드 접근을 위해 반드시 false
            slowMo: 100,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-blink-features=AutomationControlled',
                '--exclude-switches=enable-automation',
                '--disable-extensions-file-access-check',
                '--disable-plugins-discovery',
                '--no-first-run',
                '--enable-clipboard-read-write', // 클립보드 권한
                '--enable-experimental-web-platform-features'
            ]
        });

        this.page = await this.browser.newPage();
        
        // 클립보드 권한 부여
        const context = this.browser.defaultBrowserContext();
        await context.overridePermissions('https://namu.wiki', [
            'clipboard-read',
            'clipboard-write'
        ]);
        
        // 자동화 감지 우회
        await this.page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            delete navigator.__proto__.webdriver;
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
            Object.defineProperty(navigator, 'languages', {
                get: () => ['ko-KR', 'ko']
            });
        });

        await this.page.setUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );
        
        await this.page.setViewport({ width: 1366, height: 768 });
        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        });
    }

    // CAPTCHA 감지 및 처리
    async handleCaptchaIfExists() {
        try {
            console.log('🔍 CAPTCHA 확인 중...');
            
            const captchaSelectors = [
                'iframe[src*="recaptcha"]',
                '.g-recaptcha',
                '[class*="captcha"]',
                '[id*="captcha"]',
                '.captcha-container',
                '#recaptcha'
            ];

            let captchaFound = false;
            for (const selector of captchaSelectors) {
                const element = await this.page.$(selector);
                if (element) {
                    captchaFound = true;
                    console.log(`🤖 CAPTCHA 감지됨: ${selector}`);
                    break;
                }
            }

            if (captchaFound) {
                console.log('⏰ CAPTCHA를 수동으로 해결해주세요...');
                console.log('📱 "나는 로봇이 아닙니다"를 클릭하고 완료될 때까지 기다립니다.');
                
                let attempts = 0;
                const maxAttempts = 60;
                
                while (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    let stillExists = false;
                    for (const selector of captchaSelectors) {
                        const element = await this.page.$(selector);
                        if (element) {
                            const isVisible = await element.isIntersectingViewport();
                            if (isVisible) {
                                stillExists = true;
                                break;
                            }
                        }
                    }
                    
                    if (!stillExists) {
                        console.log('✅ CAPTCHA 해결됨!');
                        return true;
                    }
                    
                    attempts++;
                    if (attempts % 10 === 0) {
                        console.log(`⏰ CAPTCHA 대기 중... ${attempts}초 경과`);
                    }
                }
                
                console.log('⚠️ CAPTCHA 해결 타임아웃. 계속 진행합니다...');
                return false;
            }
            
            console.log('✅ CAPTCHA 없음');
            return true;
            
        } catch (error) {
            console.log('CAPTCHA 확인 중 오류:', error.message);
            return true;
        }
    }

    // 안전한 페이지 로드
    async safeNavigate(url, waitTime = 3000) {
        try {
            console.log(`🌐 페이지 로딩: ${url}`);
            
            await this.page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
            });

            await new Promise(resolve => setTimeout(resolve, waitTime));
            await this.handleCaptchaIfExists();
            await new Promise(resolve => setTimeout(resolve, 200));
            
            return true;
            
        } catch (error) {
            console.error(`페이지 로드 실패: ${error.message}`);
            return false;
        }
    }

    // 편집 링크 찾기
    async findEditLinks() {
        try {
            const editLinks = await this.page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a'));
                return links
                    .filter(link => link.href && link.href.includes('/edit/'))
                    .map(link => ({
                        href: link.href,
                        text: link.textContent.trim(),
                        classes: link.className,
                        id: link.id
                    }));
            });

            console.log(`📝 편집 링크 ${editLinks.length}개 발견:`);
            editLinks.forEach((link, i) => {
                console.log(`  ${i + 1}: "${link.text}" -> ${link.href}`);
            });

            return editLinks;
        } catch (error) {
            console.error('편집 링크 찾기 실패:', error);
            return [];
        }
    }

    // Monaco 에디터 로딩 대기
    async waitForEditor() {
        console.log('🎯 에디터 로딩 대기 중...');
        
        try {
            // 에디터가 로드되고 포커스가 가능할 때까지 대기
            await this.page.waitForFunction(() => {
                // Monaco 에디터 확인
                const monacoEditor = document.querySelector('.monaco-editor');
                if (monacoEditor) {
                    console.log('Monaco 에디터 발견');
                    return true;
                }
                
                // 일반 textarea 확인
                const textarea = document.querySelector('textarea[name="text"]');
                if (textarea) {
                    console.log('Textarea 에디터 발견');
                    return true;
                }
                
                // 기타 에디터 요소들
                const otherEditors = document.querySelector('.inputarea, #text, .ace_text-input');
                if (otherEditors) {
                    console.log('다른 에디터 발견');
                    return true;
                }
                
                return false;
            }, { timeout: 15000 });
            
            console.log('✅ 에디터 로드 완료');
            
            // 추가 안정화 시간
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            return true;
            
        } catch (error) {
            console.log('⚠️ 에디터 대기 타임아웃', error?.status);
            return false;
        }
    }

    // 에디터에 포커스하고 전체 선택 후 복사
    async extractViaClipboard() {
        try {
            console.log('📋 클립보드 방식으로 텍스트 추출 시작...');
            
            // 1. 에디터 영역 찾기 및 포커스
            const focused = await this.page.evaluate(() => {
                console.log('에디터 포커스 시도...');
                
                // 포커스 가능한 요소들 우선순위별로 시도
                const focusTargets = [
                    '.monaco-editor .inputarea',
                    '.monaco-editor textarea',
                    'textarea[name="text"]',
                    '.inputarea',
                    '#text',
                    '.ace_text-input',
                    '.monaco-editor',
                    'textarea'
                ];
                
                for (const selector of focusTargets) {
                    const element = document.querySelector(selector);
                    if (element) {
                        try {
                            element.focus();
                            element.click();
                            console.log(`포커스 성공: ${selector}`);
                            return true;
                        } catch (e) {
                            console.log(`포커스 실패: ${selector}`, e.message);
                        }
                    }
                }
                
                // 마지막으로 body에 포커스
                document.body.focus();
                document.body.click();
                return false;
            });

            console.log(`포커스 결과: ${focused ? '성공' : '실패(body로 대체)'}`);
            
            // 2. 잠시 대기 후 포커스 재확인
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 3. 전체 선택 (Ctrl+A 또는 Cmd+A)
            console.log('📝 전체 선택 (Ctrl+A / Cmd+A)...');
            const isMac = process.platform === 'darwin';
            
            if (isMac) {
                await this.page.keyboard.down('Meta'); // Cmd 키
                await this.page.keyboard.press('a');
                await this.page.keyboard.up('Meta');
            } else {
                await this.page.keyboard.down('Control'); // Ctrl 키
                await this.page.keyboard.press('a');
                await this.page.keyboard.up('Control');
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 4. 복사 (Ctrl+C 또는 Cmd+C)
            console.log('📋 클립보드로 복사 (Ctrl+C / Cmd+C)...');
            
            if (isMac) {
                await this.page.keyboard.down('Meta');
                await this.page.keyboard.press('KeyC');
                await this.page.keyboard.up('Meta');
                await this.page.waitForTimeout(200);
                await this.page.keyboard.down('Meta');
                await this.page.keyboard.press('KeyV');
                await this.page.keyboard.up('Meta');
            } else {
                await this.page.keyboard.down('Control'); // Ctrl 키
                await this.page.keyboard.press('KeyC');
                await this.page.keyboard.up('Control');
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 5. 클립보드에서 텍스트 읽기
            console.log('📖 클립보드에서 텍스트 읽기...');
            
            const clipboardText = await this.page.evaluate(async () => {
                try {
                    // Clipboard API 사용
                    if (navigator.clipboard && navigator.clipboard.readText) {
                        const text = await navigator.clipboard.readText();
                        console.log(`클립보드 API로 텍스트 읽기 성공: ${text.length}자`);
                        return text;
                    }
                    
                    // 대체 방법: execCommand (deprecated이지만 fallback으로 사용)
                    const textarea = document.createElement('textarea');
                    document.body.appendChild(textarea);
                    textarea.focus();
                    textarea.select();
                    
                    const result = document.execCommand('paste');
                    const text = textarea.value;
                    document.body.removeChild(textarea);
                    
                    if (result && text) {
                        console.log(`execCommand로 텍스트 읽기 성공: ${text.length}자`);
                        return text;
                    }
                    
                    console.log('클립보드 읽기 실패');
                    return '';
                    
                } catch (error) {
                    console.log('클립보드 읽기 오류:', error.message);
                    return '';
                }
            });

            if (clipboardText && clipboardText.length > 50) {
                console.log(`✅ 클립보드 텍스트 추출 성공: ${clipboardText.length}자`);
                console.log('📄 텍스트 미리보기 (처음 500자):');
                console.log('─'.repeat(50));
                console.log(clipboardText.substring(0, 500));
                console.log('─'.repeat(50));
                
                return clipboardText;
            } else {
                console.log('❌ 클립보드에서 유효한 텍스트를 가져오지 못했습니다.');
                
                // 백업: 직접 DOM에서 추출 시도
                console.log('🔄 백업 방법으로 DOM에서 직접 추출...');
                return await this.fallbackExtraction();
            }
            
        } catch (error) {
            console.error('클립보드 추출 중 오류:', error);
            console.log('🔄 백업 방법으로 DOM에서 직접 추출...');
            return await this.fallbackExtraction();
        }
    }

    // 백업 추출 방법
    async fallbackExtraction() {
        return await this.page.evaluate(() => {
            console.log('백업 추출 방법 시도...');
            
            // Monaco API 시도
            if (window.monaco && window.monaco.editor) {
                const editors = window.monaco.editor.getEditors();
                if (editors && editors.length > 0) {
                    const text = editors[0].getValue();
                    if (text && text.length > 10) {
                        console.log(`Monaco API 백업 성공: ${text.length}자`);
                        return text;
                    }
                }
            }
            
            // Textarea 시도
            const textarea = document.querySelector('textarea[name="text"]');
            if (textarea && textarea.value) {
                console.log(`Textarea 백업 성공: ${textarea.value.length}자`);
                return textarea.value;
            }
            
            console.log('모든 백업 방법 실패');
            return '';
        });
    }

    // 텍스트를 파일로 저장 (새로운 경로 구조: src/scripts/raw/)
    async saveTextToFile(text, filename = null) {
    try {
    if (!text || text.length === 0) {
    console.log('❌ 저장할 텍스트가 없습니다.');
    return null;
    }

    // 캐릭터 인격 이름 추출
    let personaName = null;
    const match = text.match(/====#\s*([^#\n]+)\s*#====/); 
    if (match) {
    personaName = match[1].replace(/\s+/g, '_');
    } else {
    // 첫 줄에서 추출 시도 (예비)
    const firstLine = text.split('\n')[0].trim();
    if (firstLine.length > 0) {
    personaName = firstLine.replace(/\s+/g, '_').slice(0, 30);
    }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const finalFilename = filename || (personaName ? `${personaName}.txt` : `namuwiki_extract_${timestamp}.txt`);
    
    // 새로운 경로: src/scripts/raw/
    const outputDir = path.join(process.cwd(), 'src/scripts/raw/');
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filePath = path.join(outputDir, finalFilename);
    fs.writeFileSync(filePath, text, 'utf8');
    
    console.log(`💾 텍스트가 저장되었습니다: ${filePath}`);
    console.log(`📊 저장된 텍스트 크기: ${text.length}자`);
    console.log(`📁 저장 경로: src/scripts/raw/${finalFilename}`);
        
    return filePath;
    
    } catch (error) {
            console.error('❌ 파일 저장 오류:', error);
            return null;
        }
    }

    // findSectionEditLink 개선: section=XX 추출
    async findSectionEditLink(sectionAnchor) {
        return await this.page.evaluate((sectionAnchor) => {
            // 섹션 앵커 찾기
            const anchor = document.querySelector(`a[id="s-${sectionAnchor}"]`);
            if (!anchor) return null;

            // 1. 앵커의 부모에서 [편집] 링크 찾기
            let node = anchor.parentElement;
            while (node && node !== document.body) {
                const editLink = Array.from(node.querySelectorAll('a[href*="/edit/"]')).find(a =>
                    (a.textContent.includes('편집') || a.getAttribute('rel') === 'nofollow') &&
                    a.href.includes('section=')
                );
                if (editLink) return editLink.href;
                node = node.parentElement;
            }

            // 2. 앵커의 다음 형제에서 [편집] 링크 찾기
            let sibling = anchor.nextElementSibling;
            while (sibling) {
                if (sibling.matches('a[href*="/edit/"]') &&
                    (sibling.textContent.includes('편집') || sibling.getAttribute('rel') === 'nofollow') &&
                    sibling.href.includes('section=')) {
                    return sibling.href;
                }
                sibling = sibling.nextElementSibling;
            }

            // 3. fallback: 전체에서 section= 포함된 [편집] 링크
            const fallback = Array.from(document.querySelectorAll(`a[href*="/edit/"][href*="section="]`)).find(a =>
                (a.textContent.includes('편집') || a.getAttribute('rel') === 'nofollow') && a.href.includes('section=')
            );
            return fallback ? fallback.href : null;
        }, sectionAnchor);
    }

    // 메인 추출 함수
    async extractFromUrl(url, filename = null, sectionAnchor = null) {
        try {
            // 1. 원본 페이지 로드
            const loaded = await this.safeNavigate(url);
            if (!loaded) {
                throw new Error('페이지 로드 실패');
            }

            let targetEditUrl;
            if (sectionAnchor) {
                // 섹션 편집 링크 찾기
                targetEditUrl = await this.findSectionEditLink(sectionAnchor);
                if (!targetEditUrl) {
                    throw new Error(`섹션(${sectionAnchor}) 편집 링크를 찾을 수 없습니다`);
                }
                console.log(`📝 섹션(${sectionAnchor}) 편집 페이지로 이동: ${targetEditUrl}`);
            } else {
                // 기존 전체 문서 편집 링크
                const editLinks = await this.findEditLinks();
                if (editLinks.length === 0) {
                    throw new Error('편집 링크를 찾을 수 없습니다');
                }
                targetEditUrl = editLinks[0].href;
                console.log(`📝 편집 페이지로 이동: ${targetEditUrl}`);
            }

            // 2. 편집 페이지로 이동
            const editLoaded = await this.safeNavigate(targetEditUrl, 5000);
            if (!editLoaded) {
                throw new Error('편집 페이지 로드 실패');
            }

            // 3. 에디터 로딩 대기
            const editorReady = await this.waitForEditor();
            if (!editorReady) {
                console.log('⚠️ 에디터 로딩이 완전하지 않지만 계속 진행합니다...');
            }

            // 4. 클립보드 방식으로 텍스트 추출
            const extractedText = await this.extractViaClipboard();
            if (!extractedText) {
                throw new Error('텍스트 추출 실패');
            }

            // 5. 파일로 저장
            const savedPath = await this.saveTextToFile(extractedText, filename);

            return {
                text: extractedText,
                filePath: savedPath,
                length: extractedText.length
            };

        } catch (error) {
            console.error('❌ 추출 실패:', error.message);
            throw error;
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('\n🔚 브라우저 종료');
        }
    }
}

// CLI 메인 함수
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('❌ 사용법: npm run crawling <나무위키 URL> [파일명]');
        console.log('예시: npm run crawling "https://namu.wiki/w/...#s-2.3.7" "meursault_data"');
        console.log('');
        console.log('💡 주의사항:');
        console.log('  - 브라우저가 열린 상태에서 작업됩니다 (클립보드 접근 필요)');
        console.log('  - macOS에서는 Cmd+A, Cmd+C 사용');
        console.log('  - Windows/Linux에서는 Ctrl+A, Ctrl+C 사용');
        console.log('');
        console.log('📁 파일 경로:');
        console.log('  - 추출된 텍스트: src/scripts/raw/');
        console.log('  - 변환된 JSON: src/scripts/converted/');
        process.exit(1);
    }

    let url = args[0];
    const filename = args[1] ? `${args[1]}.txt` : null;
    let sectionAnchor = null;
    // URL에서 #s-2.3.7 등 섹션 앵커 자동 추출
    const hashMatch = url.match(/#s-([\d.]+)/);
    if (hashMatch) {
        sectionAnchor = hashMatch[1];
        url = url.replace(/#s-[\d.]+/, ''); // URL에서 앵커 제거
    }

    const extractor = new MonacoClipboardExtractor();
    
    try {
        await extractor.initialize();
        
        console.log(`🎯 URL: ${url}`);
        if (filename) {
            console.log(`📄 파일명: ${filename}`);
        }
        if (sectionAnchor) {
            console.log(`🔎 섹션 앵커: ${sectionAnchor}`);
        }
        
        console.log('\n⚠️  브라우저에서 클립보드 권한을 요청할 수 있습니다. 허용해주세요.');
        
        const result = await extractor.extractFromUrl(url, filename, sectionAnchor);
        
        console.log('\n✅ 추출 완료!');
        console.log(`📊 추출된 텍스트: ${result.length}자`);
        console.log(`💾 저장 경로: ${result.filePath}`);
        
        // 간단한 통계
        const lines = result.text.split('\n').length;
        const words = result.text.split(/\s+/).filter(word => word.length > 0).length;
        
        console.log(`📈 통계:`);
        console.log(`  - 줄 수: ${lines}`);
        console.log(`  - 단어 수: ${words}`);
        console.log(`  - 문자 수: ${result.length}`);
        console.log(`📁 파일 위치: src/scripts/raw/`);
        
        // 추출 후 자동 변환 (AI 파서 사용)
        if (result && result.filePath) {
            try {
                console.log('\n🤖 추출된 텍스트를 AI 파서로 JSON 변환 중...');
                console.log(`📁 입력 파일: ${result.filePath}`);
                
                const parseScript = path.join(__dirname, 'parse_identity_ai.js');
                execSync(`node "${parseScript}" "${result.filePath}"`, { stdio: 'inherit' });
                
                console.log('\n✅ AI 변환 완료!');
                console.log('📂 결과 파일 위치:');
                console.log('  - Raw 텍스트: src/scripts/raw/');
                console.log('  - 변환된 JSON: src/scripts/converted/');
                console.log('\n💡 다음 단계:');
                console.log('1. src/scripts/converted/ 폴더에서 결과 JSON 확인');
                
            } catch (e) {
                console.error('❌ AI JSON 변환 중 오류:', e.message);
                console.log('\n🔧 수동 변환 방법:');
                console.log(`npm run parse-identity-ai "${result.filePath}"`);
            }
        }
        
    } catch (error) {
        console.error('❌ 추출 실패:', error.message);
        process.exit(1);
    } finally {
        await extractor.close();
    }
}

// 직접 실행 시 메인 함수 호출
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}

export default MonacoClipboardExtractor;