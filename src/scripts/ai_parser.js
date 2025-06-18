import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  throw new Error('❌ ANTHROPIC_API_KEY가 설정되지 않았습니다.');
}

/**
 * Claude AI를 호출하여 텍스트를 강화된 JSON 구조로 변환
 * @param {string} text - 변환할 텍스트
 * @returns {Promise<Object>} - 파싱된 JSON 객체
 */
export async function parseWithEnhancedAI(text) {
  const prompt = `아래 나무위키 텍스트를 분석하여 게임 캐릭터의 정보를 추출하고, 강화된 구조의 JSON으로 변환해줘. 

요구사항:
1. 반드시 코드블록(\`\`\`json ... \`\`\`) 안에 완전한 JSON만 반환
2. 다음 구조를 따를 것:

스킬 구조 예시:
{
  "skilltype": "공격", // "공격" 또는 "수비"
  "skill": "s1", // "s1", "s2", "s3", "def"
  "coin": 2, // 코인 개수
  "name": "스킬명",
  "level": "56(+4)", // 레벨 표기
  "type": "타격", // 공격 타입
  "prop": "우울", // 죄악 속성 (한글로)
  "power": 3, // 기본 위력
  "coinpower": 4, // 코인 위력 (+ 없이 숫자만)
  "weight": 1, // 코인 가중치 (보통 1, 특별한 경우 다를 수 있음)
  "hit": {
    "start": "스킬 시전 시 효과",
    "h1": "첫 번째 코인 적중 시 효과",
    "h2": "두 번째 코인 적중 시 효과",
    "h3": "세 번째 코인 적중 시 효과",
    "h4": "네 번째 코인 적중 시 효과",
    "h5": "다섯 번째 코인 적중 시 효과",
    "end": "스킬 종료 시 효과"
  }
}

전체 JSON 구조:
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
    "skill1": { 위의 스킬 구조 },
    "skill2": { 위의 스킬 구조 },
    "skill3": { 위의 스킬 구조 },
    "def": { 위의 스킬 구조 (skilltype: "수비", skill: "def") },
    "EnhancementSkill1": [{ 강화 스킬1 배열 }], // 강화 스킬이 있는 경우만
    "EnhancementSkill2": [{ 강화 스킬2 배열 }], // 강화 스킬이 있는 경우만
    "EnhancementSkill3": [{ 강화 스킬3 배열 }], // 강화 스킬이 있는 경우만
    "EnhancementDef": [{ 강화 수비스킬 배열 }], // 강화 수비스킬이 있는 경우만
    "pass1": [패시브1 배열],
    "pass2": [패시브2 배열]
  },
  "sync4": { sync3와 동일 구조 },
  "keyword": ["키워드", "배열"]
}

중요 사항:
- 강화 스킬이 있으면 EnhancementSkill1, EnhancementSkill2, EnhancementSkill3, EnhancementDef 필드 추가
- 강화 스킬은 배열 형태로, 여러 개의 강화 버전이 있을 수 있음
- hit 객체의 h1~h5는 해당 코인이 없으면 빈 문자열("")로 설정
- weight는 일반적으로 1이지만, 특별한 가중치가 있으면 해당 값 사용
- prop은 죄악 속성을 한글로 (우울, 분노, 탐식, 나태, 질투, 오만, 색욕)
- 스킬 효과는 가능한 한 자세히 파싱해서 hit 객체에 분배
- 코인별 효과가 명확하게 구분되어 있으면 해당 h1, h2 등에 배치
- [사용시], [적중시], [회피시] 등의 조건도 정확히 파싱

텍스트:
${text}`;

  try {
    console.log('🤖 Claude AI 호출 중...');
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        timeout: 300000
      }
    );

    console.log('✅ AI 응답 받음');
    const text = response.data.content[0].text;
    
    console.log('📋 Claude 응답:');
    console.log('─'.repeat(50));
    console.log(text);
    console.log('─'.repeat(50));

    let jsonString = text;
    
    // JSON 코드블록 추출
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
      return {
        success: true,
        data: parsedJson,
        rawResponse: text
      };
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError.message);
      return {
        success: false,
        error: parseError.message,
        rawResponse: text
      };
    }
    
  } catch (error) {
    console.error('❌ AI 호출 실패:', error.message);
    
    if (error.response) {
      console.error('상태 코드:', error.response.status);
      console.error('상태 메시지:', error.response.statusText);
      console.error('응답 데이터:', error.response.data);
      
      switch (error.response.status) {
        case 401:
          console.error('💡 해결방법: API 키가 잘못되었습니다.');
          break;
        case 403:
          console.error('💡 해결방법: API 권한이 없거나 할당량이 초과되었습니다.');
          break;
        case 429:
          console.error('💡 해결방법: 요청 한도 초과. 잠시 후 다시 시도하세요.');
          break;
        case 500:
          console.error('💡 해결방법: 서버 오류. 잠시 후 다시 시도하세요.');
          break;
      }
    }
    
    return {
      success: false,
      error: error.message,
      rawResponse: null
    };
  }
}

/**
 * AI 파싱 결과 검증
 * @param {Object} jsonData - 검증할 JSON 데이터
 * @returns {Object} - 검증 결과
 */
export function validateParsedData(jsonData) {
  const issues = [];
  const summary = {
    characterName: jsonData.name || '❌ 없음',
    birthDate: jsonData.birth || '❌ 없음',
    skillCount: 0,
    enhancementSkills: [],
    passiveCount: 0
  };

  // 스킬 개수 확인
  if (jsonData.sync3) {
    const skills = Object.keys(jsonData.sync3).filter(k => k.startsWith('skill') || k === 'def');
    summary.skillCount = skills.length;
    
    // 각 스킬 구조 검증
    skills.forEach(skillKey => {
      const skill = jsonData.sync3[skillKey];
      if (skill) {
        if (!skill.skilltype) issues.push(`${skillKey}: skilltype 누락`);
        if (!skill.skill) issues.push(`${skillKey}: skill 누락`);
        if (typeof skill.coin !== 'number') issues.push(`${skillKey}: coin이 숫자가 아님`);
        if (!skill.hit) issues.push(`${skillKey}: hit 객체 누락`);
        if (typeof skill.coinpower !== 'number') issues.push(`${skillKey}: coinpower가 숫자가 아님`);
        if (typeof skill.weight !== 'number') issues.push(`${skillKey}: weight가 숫자가 아님`);
      }
    });
    
    // 강화 스킬 확인
    const enhancementKeys = Object.keys(jsonData.sync3).filter(k => k.startsWith('Enhancement'));
    summary.enhancementSkills = enhancementKeys;
    
    // 패시브 개수
    summary.passiveCount = (jsonData.sync3.pass1?.length || 0) + (jsonData.sync3.pass2?.length || 0);
  }

  return {
    summary,
    issues,
    isValid: issues.length === 0
  };
}