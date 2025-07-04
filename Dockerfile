# Node.js 18.19.0 공식 이미지 사용
FROM node:18.19.0-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드 (필요한 경우)
RUN npm run build

# 포트 노출
EXPOSE 3000

# 애플리케이션 시작
CMD ["npx", "next", "start", "-H", "0.0.0.0"]
