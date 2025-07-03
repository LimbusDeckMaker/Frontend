# 림버스 컴퍼니 덱편성코드 도구 (Formation Script)

림버스 컴퍼니의 덱편성코드를 디코딩하고 인코딩할 수 있는 JavaScript 도구입니다.

## 📋 개요

림버스 컴퍼니의 덱편성코드는 다음과 같은 구조로 암호화되어 있습니다:
- **암호화 방식**: Base64 → Gzip → Base64 (3단계)
- **데이터 구조**: 560비트 (70바이트), 수감자당 46비트
- **수감자 순서**: 이상, 파우스트, 돈키호테, 로슈, 뫼르소, 홍루, 히스클리프, 이스마엘, 로쟈, 싱클레어, 오티스, 그레고르

### 비트 구조 (수감자당 46비트)

```
0000**00010000**000**0001**000**0000**000**0000**000**0000**000000
```

- **5~8비트**: 인격 ID (기본 인격 = 1)
- **9~12비트**: 편성 순서 (미편성 = 0)
- **16~19비트**: 자인 에고 ID (기본 에고 = 1)
- **23~26비트**: 테스 에고 ID (기본 에고 = 1)
- **30~33비트**: 헤드 에고 ID (기본 에고 = 1)
- **37~40비트**: 바브 에고 ID (기본 에고 = 1)

## 🚀 설치 및 실행

### 필요 조건
- Node.js (ESM 지원)
- `zlib` 모듈 (Node.js 내장)

### 파일 위치
```
/Users/naron/Desktop/Frontend/src/scripts/decodeTool.js
```

## 💡 사용 방법

### 1. 덱편성코드 디코딩

```bash
# 기본 디코딩
node src/scripts/decodeTool.js decode "H4sIAAAAAAAA..."

# 편성된 수감자만 표시
node src/scripts/decodeTool.js decode "H4sIAAAAAAAA..." --formation

# 비트 시각화 포함
node src/scripts/decodeTool.js decode "H4sIAAAAAAAA..." --bits

# 모든 옵션 사용
node src/scripts/decodeTool.js decode "H4sIAAAAAAAA..." --bits --formation
```

### 2. 덱편성코드 인코딩

```bash
# 예시 데이터로 인코딩
node src/scripts/decodeTool.js encode
```

### 3. 프로그래밍 방식으로 사용

```javascript
import { 
    decodeFormationCode, 
    encodeFormationCode, 
    createFormationData 
} from './src/scripts/decodeTool.js';

// 디코딩
const result = decodeFormationCode("H4sIAAAAAAAA...");
console.log(result.prisoners);

// 인코딩
const formationData = createFormationData([
    [0, 2, 1, 1, 1, 1], // 이상: 인격2, 기본에고들
    [6, 1, 1, 1, 2, 1], // 히스클리프: 기본인격, 헤드에고2
    [2, 3, 1, 1, 1, 1], // 돈키호테: 인격3, 기본에고들
]);
const encodedCode = encodeFormationCode(formationData);
```

## 📊 출력 예시

### 디코딩 결과
```
🔍 덱 편성 코드 디코딩 시작...

📊 바이너리 데이터 분석:
총 바이트 수: 70
총 비트 수: 560
16진수: 08 40 84 21 08 42 10 84 21 08 42 10 84 21 08 42

👥 수감자 데이터 분석:
최대 수감자 수: 12

이상 (1번째):
  인격: 이상 인격 2 (ID: 2)
  편성 순서: 1
  자인 에고: 이상 기본 에고 (ID: 1)
  테스 에고: 이상 에고 3 (ID: 3)
  헤드 에고: 이상 기본 에고 (ID: 1)
  바브 에고: 이상 기본 에고 (ID: 1)

파우스트 (2번째):
  인격: 파우스트 (기본) (ID: 1)
  편성 순서: 0 (미편성)
  ...
```

### 편성 요약 (--formation 옵션)
```
🎯 현재 편성:
1. 이상 (편성 순서: 1)
   인격: 이상 인격 2
   자인: 이상 기본 에고, 테스: 이상 에고 3, 헤드: 이상 기본 에고, 바브: 이상 기본 에고
2. 히스클리프 (편성 순서: 2)
   인격: 히스클리프 (기본)
   자인: 히스클리프 기본 에고, 테스: 히스클리프 기본 에고, 헤드: 히스클리프 에고 2, 바브: 히스클리프 기본 에고
```

## 🔧 고급 사용법

### 편성 데이터 형식
```javascript
// [수감자인덱스, 인격ID, 자인ID, 테스ID, 헤드ID, 바브ID]
const formationList = [
    [0, 2, 1, 1, 1, 1],  // 이상을 인격2로 1번 슬롯에 편성
    [6, 1, 1, 1, 2, 1],  // 히스클리프를 기본인격으로 2번 슬롯에 편성 (헤드에고2)
    [2, 3, 1, 1, 1, 1],  // 돈키호테를 인격3으로 3번 슬롯에 편성
];
```

### 수감자 인덱스 참조
```javascript
const PRISONER_NAMES = [
    '이상',      // 0
    '파우스트',   // 1
    '돈키호테',   // 2
    '로슈',      // 3
    '뫼르소',    // 4
    '홍루',      // 5
    '히스클리프', // 6
    '이스마엘',   // 7
    '로쟈',      // 8
    '싱클레어',   // 9
    '오티스',    // 10
    '그레고르'    // 11
];
```

### 인격/에고 데이터 관리
```javascript
// 인격 데이터 추가 예시
IDENTITY_DATA[0][2] = "이상 - 가시관의 십자가";
IDENTITY_DATA[0][3] = "이상 - 붉은 안개";

// 에고 데이터 추가 예시
EGO_DATA[0][2] = "이상 - 참회의 가시";
EGO_DATA[0][3] = "이상 - 붉은 안개";
```

## 🛠️ 개발자 정보

### 주요 함수들
- `decodeFormationCode(code)`: 덱편성코드 디코딩
- `encodeFormationCode(prisonersData)`: 덱편성코드 인코딩
- `createFormationData(formationList)`: 편성 데이터 생성
- `showFormation(decodedData)`: 편성 요약 표시
- `visualizeBits(bytes)`: 비트 시각화
- `getIdentityName(prisonerIndex, identityId)`: 인격 이름 조회
- `getEgoName(prisonerIndex, egoId)`: 에고 이름 조회

### 데이터 구조
- `IDENTITY_DATA`: 수감자별 인격 데이터
- `EGO_DATA`: 수감자별 에고 데이터
- `PRISONER_NAMES`: 수감자 이름 배열

## 📝 할 일 목록

- [ ] 모든 수감자의 인격 데이터 추가 (노가다 작업)
- [ ] 모든 수감자의 에고 데이터 추가 (노가다 작업)
- [ ] 웹 UI 인터페이스 구현
- [ ] 편성 검증 기능 추가
- [ ] 편성 최적화 제안 기능

## 🔍 문제해결

### 자주 발생하는 오류

1. **"Invalid character in base64 string"**
   - 덱편성코드에 잘못된 문자가 포함된 경우
   - 코드를 다시 복사해서 시도해보세요

2. **"gunzip failed"**
   - 잘못된 형식의 덱편성코드
   - 게임에서 올바른 덱편성코드를 복사했는지 확인하세요

3. **"Cannot read properties of undefined"**
   - 수감자 데이터가 부족한 경우
   - `IDENTITY_DATA` 또는 `EGO_DATA`에 해당 데이터를 추가하세요

### 디버깅 도구
```bash
# 비트 시각화로 데이터 구조 확인
node src/scripts/decodeTool.js decode "코드" --bits

# 편성 데이터만 간단히 확인
node src/scripts/decodeTool.js decode "코드" --formation
```

---

**작성자**: 림버스 컴퍼니 플레이어  
**최종 수정일**: 2025-07-03  
**버전**: 1.0.0