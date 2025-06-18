import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { parseWithEnhancedAI, validateParsedData } from './ai_parser.js';

dotenv.config();

console.log('🎯 강화된 Identity 데이터 파서 v2.0');
console.log('API_KEY 설정됨:', process.env.ANTHROPIC_API_KEY ? '✅' : '❌');

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ API 키가 설정되지 않았습니다.');
  console.error('방법 1: 환경변수 설정 - export ANTHROPIC_API_KEY="sk-ant-..."');
  console.error('방법 2: .env 파일에 ANTHROPIC_API_KEY="sk-ant-..." 추가');
  process.exit(1);
}

if (process.argv.length < 3) {
  console.log('❌ 사용법: npm run parse-identity-ai <추출 텍스트 파일 경로>');
  console.log('예시: npm run parse-identity-ai src/scripts/raw/meursault_data.txt');
  console.log('📁 권장 경로:');
  console.log('  - 입력: src/scripts/raw/');
  console.log('  - 출력: src/scripts/converted/');
  process.exit(1);
}

const inputPath = process.argv[2];

// 출력 경로를 scripts/converted/ 하위로 설정
const inputFileName = path.basename(inputPath, path.extname(inputPath));
const outputPath = path.join(path.dirname(import.meta.url.replace('file://', '')), 'converted', `${inputFileName}_converted.json`);

if (!fs.existsSync(inputPath)) {
  console.error('❌ 입력 파일이 존재하지 않습니다:', inputPath);
  process.exit(1);
}

/**
 * 텍스트 전처리
 * @param {string} rawText - 원본 텍스트
 * @returns {string} - 전처리된 텍스트
 */
function preprocessText(rawText) {
  let processedText = rawText;
  
  // 이야기 섹션 제거 (파싱에 불필요)
  const storyIdx = processedText.indexOf('이야기');
  if (storyIdx !== -1) {
    processedText = processedText.slice(0, storyIdx);
    console.log('📝 "이야기" 섹션 제거됨');
  }
  
  // 기타 불필요한 섹션 제거
  const unnecessarySections = ['각주', '참고 문헌', '외부 링크', '분류'];
  unnecessarySections.forEach(section => {
    const idx = processedText.indexOf(section);
    if (idx !== -1) {
      processedText = processedText.slice(0, idx);
      console.log(`📝 "${section}" 섹션 제거됨`);
    }
  });
  
  return processedText.trim();
}

/**
 * 파싱 결과 저장 및 검증
 * @param {Object} result - AI 파싱 결과
 * @param {string} outputPath - 출력 파일 경로
 */
function saveAndValidateResult(result, outputPath) {
  if (!result.success) {
    // 실패한 경우 Raw 응답 저장
    const rawPath = outputPath.replace('.json', '_raw.txt');
    if (result.rawResponse) {
      fs.writeFileSync(rawPath, result.rawResponse, 'utf8');
      console.error('❌ 파싱 실패. Raw 응답을 저장했습니다:', rawPath);
    }
    console.error('오류:', result.error);
    throw new Error('AI 파싱 실패');
  }

  // 성공한 경우 JSON 저장
  fs.writeFileSync(outputPath, JSON.stringify(result.data, null, 2), 'utf8');
  
  console.log('\n✅ AI 변환 완료!');
  console.log('💾 저장 경로:', outputPath);
  
  // 데이터 검증
  console.log('\n🔍 데이터 검증 중...');
  const validation = validateParsedData(result.data);
  
  console.log('\n📊 변환 결과 요약:');
  console.log('캐릭터명:', validation.summary.characterName);
  console.log('출시일:', validation.summary.birthDate);
  console.log('스킬 개수:', validation.summary.skillCount);
  console.log('강화 스킬:', validation.summary.enhancementSkills.length > 0 ? validation.summary.enhancementSkills.join(', ') : '없음');
  console.log('패시브 개수:', validation.summary.passiveCount);
  
  // 검증 결과
  if (validation.isValid) {
    console.log('\n✅ 데이터 검증 통과!');
  } else {
    console.log('\n⚠️ 데이터 검증 이슈 발견:');
    validation.issues.forEach(issue => console.log('  -', issue));
  }
  
  // 스킬 구조 상세 검증
  if (result.data.sync3?.skill1) {
    console.log('\n🔍 스킬 구조 검증 (skill1):');
    const skill = result.data.sync3.skill1;
    console.log('- skilltype:', skill.skilltype || '❌');
    console.log('- skill:', skill.skill || '❌');
    console.log('- 코인 개수:', skill.coin || '❌');
    console.log('- 가중치:', skill.weight || '❌');
    console.log('- 코인위력:', skill.coinpower || '❌');
    console.log('- hit 객체:', skill.hit ? '✅' : '❌');
    if (skill.hit) {
      const hitCount = Object.values(skill.hit).filter(v => v && v.trim()).length;
      console.log('  - 효과 개수:', hitCount);
    }
  }
}

// 메인 실행
(async () => {
  try {
    console.log('\n🚀 텍스트 → 강화된 JSON 변환 시작');
    console.log('📁 입력 파일:', inputPath);
    console.log('📁 출력 파일:', outputPath);
    
    // 1. 텍스트 읽기 및 전처리
    console.log('\n📖 텍스트 파일 읽는 중...');
    const rawText = fs.readFileSync(inputPath, 'utf8');
    const processedText = preprocessText(rawText);
    
    console.log('📝 전송할 텍스트 길이:', processedText.length);
    console.log('📄 텍스트 미리보기:', processedText.substring(0, 200) + '...');
    
    // 2. AI 파싱
    console.log('\n🤖 AI 파싱 시작...');
    const result = await parseWithEnhancedAI(processedText);
    
    // 3. 결과 저장 및 검증
    saveAndValidateResult(result, outputPath);
    
    console.log('\n🎉 모든 작업 완료!');
    console.log('\n💡 다음 단계:');
    console.log('1. 생성된 JSON 파일 확인 (src/scripts/converted/)');
    console.log('2. hit 객체의 효과 데이터 세부 조정');
    console.log('3. 강화 스킬이 있다면 EnhancementSkill 배열에 추가');
    console.log('4. 최종 데이터를 src/data/characters/ 폴더로 복사');
    
  } catch (error) {
    console.error('\n❌ 변환 실패:', error.message);
    console.error('\n🔧 문제 해결 방법:');
    console.error('1. API 키 확인');
    console.error('2. 입력 텍스트 파일 내용 확인');
    console.error('3. 네트워크 연결 상태 확인');
    process.exit(1);
  }
})();