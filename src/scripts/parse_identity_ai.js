import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ⚠️ 여기에 실제 API 키를 입력하세요
const API_KEY = process.env.ANTHROPIC_API_KEY;

console.log('API_KEY 설정됨:', API_KEY ? '✅' : '❌');

if (!API_KEY) {
  console.error('❌ API 키가 설정되지 않았습니다.');
  console.error('방법 1: 환경변수 설정 - export ANTHROPIC_API_KEY="sk-ant-..."');
  console.error('방법 2: 코드에서 직접 설정 - const API_KEY = "sk-ant-...";');
  process.exit(1);
}

if (process.argv.length < 3) {
  console.log('❌ 사용법: node parse_identity_ai.js <추출 텍스트 파일 경로>');
  process.exit(1);
}

const inputPath = process.argv[2];
const outputPath = path.join(path.dirname(inputPath), 'converted_identityData.json');

if (!fs.existsSync(inputPath)) {
  console.error('❌ 입력 파일이 존재하지 않습니다:', inputPath);
  process.exit(1);
}

const rawText = fs.readFileSync(inputPath, 'utf8');

let sendText = rawText;
const storyIdx = rawText.indexOf('이야기');
if (storyIdx !== -1) {
  sendText = rawText.slice(0, storyIdx);
}

console.log('📝 전송할 텍스트 길이:', sendText.length);
console.log('📄 텍스트 미리보기:', sendText.substring(0, 200) + '...');

const prompt = `아래 나무위키 텍스트를 분석하여 게임 캐릭터의 정보를 추출하고, identityData.json과 동일한 구조의 JSON으로 변환해줘. 

요구사항:
1. 반드시 코드블록(\`\`\`json ... \`\`\`) 안에 완전한 JSON만 반환
2. 다음 구조를 따를 것:
{
  "birth": "YYYY/MM/DD",
  "name": "캐릭터 풀네임",
  "character": "캐릭터 이름",
  "sync": 4,
  "rank": 3,
  "resistance": ["타격내성", "참격취약", "찔림보통"],
  "get": "획득방법",
  "position": "소속",
  "season": "시즌번호",
  "sync3": {
    "life": "체력",
    "speed": "속도",
    "defend": "방어력",
    "skill1": { 스킬1 정보 },
    "skill2": { 스킬2 정보 },
    "skill3": { 스킬3 정보 },
    "def": { 수비스킬 정보 },
    "pass1": [패시브1 배열],
    "pass2": [패시브2 배열]
  },
  "sync4": { sync3와 동일 구조 },
  "keyword": ["키워드", "배열"]
}

텍스트:
${sendText}`;

async function callClaude(prompt) {
  try {
    console.log('🚀 Claude API 호출 중...');
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514', // 최신 Claude 4 모델
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        timeout: 300000 // 300초 타임아웃
      }
    );

    console.log('✅ API 응답 받음');
    const data = response.data;
    const text = data.content[0].text;
    
    console.log('📋 Claude 응답:');
    console.log('─'.repeat(50));
    console.log(text);
    console.log('─'.repeat(50));

    let jsonString = text;
    
    // 코드블록이 있으면 그 안만 추출
    const match = text.match(/```json\s*([\s\S]+?)```/);
    if (match) {
      jsonString = match[1].trim();
      console.log('📦 JSON 코드블록 추출됨');
    } else {
      console.log('⚠️ JSON 코드블록이 없어서 전체 응답을 파싱 시도');
    }

    try {
      const parsedJson = JSON.parse(jsonString);
      console.log('✅ JSON 파싱 성공');
      return parsedJson;
    } catch (parseError) {
      // 파싱 실패 시, 응답 전체를 파일로 저장해서 직접 확인
      const rawPath = outputPath.replace('.json', '_raw.txt');
      fs.writeFileSync(rawPath, text, 'utf8');
      console.error('❌ JSON 파싱 실패. Raw 응답을 저장했습니다:', rawPath);
      console.error('파싱 에러:', parseError.message);
      throw parseError;
    }
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API 응답 오류:');
      console.error('상태 코드:', error.response.status);
      console.error('상태 메시지:', error.response.statusText);
      console.error('응답 데이터:', error.response.data);
      
      // 구체적인 오류 메시지 제공
      switch (error.response.status) {
        case 401:
          console.error('💡 해결방법: API 키가 잘못되었습니다. 올바른 API 키를 확인하세요.');
          break;
        case 403:
          console.error('💡 해결방법: API 권한이 없거나 할당량이 초과되었습니다.');
          break;
        case 404:
          console.error('💡 해결방법: 모델명이나 엔드포인트가 잘못되었을 수 있습니다.');
          console.error('    - 모델명 확인: claude-sonnet-4-20250514');
          console.error('    - 엔드포인트 확인: https://api.anthropic.com/v1/messages');
          break;
        case 429:
          console.error('💡 해결방법: 요청 한도 초과. 잠시 후 다시 시도하세요.');
          break;
        case 500:
          console.error('💡 해결방법: 서버 오류. 잠시 후 다시 시도하세요.');
          break;
        default:
          console.error('💡 예상치 못한 오류입니다.');
      }
    } else if (error.request) {
      console.error('❌ 네트워크 오류: 요청이 전송되지 않았습니다.');
      console.error('💡 해결방법: 인터넷 연결을 확인하세요.');
    } else {
      console.error('❌ 요청 설정 오류:', error.message);
    }
    throw error;
  }
}

// 메인 실행
(async () => {
  try {
    console.log('🎯 텍스트 → JSON 변환 시작');
    console.log('📁 입력 파일:', inputPath);
    console.log('📁 출력 파일:', outputPath);
    
    const json = await callClaude(prompt);
    
    // JSON 저장
    fs.writeFileSync(outputPath, JSON.stringify(json, null, 2), 'utf8');
    
    console.log('\n✅ AI 변환 완료!');
    console.log('💾 저장 경로:', outputPath);
    
    // 간단한 검증
    console.log('\n📊 변환 결과 검증:');
    console.log('캐릭터명:', json.name || '❌ 없음');
    console.log('출시일:', json.birth || '❌ 없음');
    console.log('스킬 개수:', Object.keys(json.sync3 || {}).filter(k => k.startsWith('skill')).length);
    console.log('패시브 개수:', (json.sync3?.pass1?.length || 0) + (json.sync3?.pass2?.length || 0));
    
  } catch (error) {
    console.error('\n❌ 변환 실패:', error.message);
    process.exit(1);
  }
})();