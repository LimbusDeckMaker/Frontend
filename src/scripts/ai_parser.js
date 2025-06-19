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

패시브 예시:
[
  {
    "name": "파흡자환 [破吸自桓]",
    "prop": "탐식",
    "poss": 5,
    "posstype": "보유",
    "passdescription": "자신의 공격 스킬로 대상 처치 시 대상의 파열만큼 호흡을 얻음 (적 1명당 최대 3, 턴 당 최대 1회)\n- 위 효과로 호흡을 3까지 얻었다면, 대상의 파열 횟수만큼 자신의 호흡 횟수 증가 (적 1명당 최대 2, 턴 당 최대 1회)\n\n합 진행 시 합을 진행하는 적보다 공격 레벨이 높으면, 합 위력 +1\n합 진행 시 합을 진행하는 적보다 공격 레벨이 높으면, 기본 공격 스킬로 부여하는 파열 위력 또는 파열 횟수 +1 (턴 당 2회 발동)"
  },
  {
    "name": "시동 [始動]",
    "prop": "없음",
    "poss": null,
    "posstype": null,
    "passdescription": "전투에서 퇴각할 때, 아군에게 편성 순서 순으로 다음 턴에 공격 레벨 증가 1 부여\n- 부여 대상 수: 자신의 시[始] 수치\n- 부여 대상이 가씨 가문이면, 대신 다음 턴에 공격 레벨 증가 2 부여\n- 다음 턴에 복귀, 대기 해제되는 인격에게는 부여되지 않음\n\n대기 해제 또는 복귀로 등장한 턴에 자신이 대[待]를 얻고, 전투 시작시 스킬 순서상 가장 먼저 '적격 - 시[始]'를 무작위 대상에게 사용함"
  }
]

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
- 만약 "4동기화 시 변경점" 섹션이 있으면, 반드시 해당 내용을 반영하여 sync4의 각 스킬/스탯/효과를 수정하거나 추가할 것.
- 예를 들어, "1스킬: '자신의 속도가 대상보다 3 이상 높으면, 코인 위력 +1' 추가"가 있으면, sync4.skill1.hit.start 등에 해당 효과를 반드시 추가.
- "추가", "변경", "삭제" 등 키워드를 보고 sync3와 sync4의 차이점을 반영해서 sync4를 완성할 것.
- "4동기화 시 변경점"의 각 항목은 반드시 sync4의 해당 스킬/스탯/효과에 적용되어야 하며, 단순 참고 정보로만 남기지 말 것.

텍스트:
${text}

- hit 객체의 각 필드는 조건([사용시], [적중시], [합 승리시], [크리티컬 적중시] 등)이 있으면 반드시 조건 텍스트를 포함해서 작성하고, 조건이 없는 효과는 생략해도 됨.
- 효과가 여러 개일 경우 온점(마침표)로 구분하지 말고 반드시 개행문자(\n)로 구분할 것.
- 예시:
  "hit": {
    "start": "[사용시] 효과1\n[사용시] 효과2",
    "h1": "[적중시] 효과1",
    "h2": "[적중시] 효과2\n[크리티컬 적중시] 효과3",
    "end": "[합 승리시] 효과1"
  }
`;

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