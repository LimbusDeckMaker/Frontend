# 나무위키 크롤링 가이드

## 🚀 설치

```bash
npm install
```

## 📖 사용법

### 기본 사용법
```bash
npm run crawling "나무위키_URL"
```

- **캐릭터명(파일명) 인자는 생략**하세요. URL만 입력하면 자동으로 인격명(예: `====# 흑수 - 묘 필두 #====`)을 추출해 파일명으로 저장합니다.
- 여러 인격이 있는 경우, 각 인격별로 따로 URL을 입력해 실행하세요.

### 예시
```bash
# 흑수 묘 파우스트 크롤링 (섹션 URL만 입력)
npm run crawling "https://namu.wiki/w/%ED%8C%8C%EC%9A%B0%EC%8A%A4%ED%8A%B8(Project%20Moon%20%EC%84%B8%EA%B3%84%EA%B4%80)/%EC%9D%B8%EA%B2%8C%EC%9E%84%20%EC%A0%95%EB%B3%B4#s-2.3.7"

# 캐릭터 전체 문서 크롤링 (섹션 없이 전체)
npm run crawling "https://namu.wiki/w/캐릭터페이지"
```

## 📁 출력 위치

크롤링된 데이터는 다음 위치에 저장됩니다:
```
src/data/characters/인격명.txt         # 원본 텍스트
src/data/characters/converted_identityData.json  # AI 변환된 JSON
```

- **인격명.txt**: 크롤링된 원본 텍스트 (인격명 자동 추출)
- **converted_identityData.json**: Claude AI로 변환된 JSON (identityData.json 구조)

## 🔧 크롤링 설정

- **브라우저 모드**: 개발시 `headless: false` (브라우저 창 보임)
- **배포시**: `headless: true`로 변경 가능
- **출력 형식**: 텍스트 + JSON 파일 자동 저장

## 📋 추출되는 데이터

- 기본 정보 (출시일, 획득방법, 소속, 시즌)
- 내성 정보 (찔림/참격/타격)
- 스킬 정보 (Sync 3/4)
- 패시브 스킬
- 게임 키워드

## 🧑‍💻 전체 동작 흐름

1. URL만 입력하면 해당 문서(또는 섹션)의 편집 텍스트를 추출
2. 추출된 텍스트를 인격명 기반 파일명으로 저장
3. Claude AI를 통해 JSON 구조로 자동 변환 및 저장

## 🚨 주의사항

1. 나무위키 서버에 부하를 주지 않도록 적절한 간격으로 사용
2. 크롤링 전 해당 사이트의 이용약관 확인
3. 개인적인 용도로만 사용 권장

---

**문의/개선 요청은 언제든 환영합니다!**
