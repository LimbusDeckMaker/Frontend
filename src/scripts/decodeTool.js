#!/usr/bin/env node
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { basename } from 'path';

/**
 * 바이너리 데이터에서 비트 범위를 추출하는 함수
 * @param {number[]} bytes - 바이트 배열
 * @param {number} startBit - 시작 비트 (1부터 시작)
 * @param {number} endBit - 끝 비트 (포함)
 * @returns {number} 추출된 값
 */
function extractBits(bytes, startBit, endBit) {
    const bitLength = endBit - startBit + 1;
    let result = 0;
    
    for (let i = 0; i < bitLength; i++) {
        const currentBit = startBit + i - 1; // 0-based index
        const byteIndex = Math.floor(currentBit / 8);
        const bitIndex = 7 - (currentBit % 8); // MSB first
        
        if (byteIndex < bytes.length) {
            const bit = (bytes[byteIndex] >> bitIndex) & 1;
            result = (result << 1) | bit;
        }
    }
    
    return result;
}

/**
 * 개별 수감자 데이터를 바이트 배열에 설정하는 함수
 * @param {number[]} bytes - 바이트 배열
 * @param {number} prisonerIndex - 수감자 인덱스 (0부터 시작)
 * @param {object} prisonerData - 수감자 데이터
 */
function setPrisoner(bytes, prisonerIndex, prisonerData) {
    const baseOffset = prisonerIndex * 46;
    
    setBits(bytes, baseOffset + 5, baseOffset + 8, prisonerData.identity || 1);
    setBits(bytes, baseOffset + 9, baseOffset + 12, prisonerData.formationOrder || 0);
    setBits(bytes, baseOffset + 16, baseOffset + 19, prisonerData.zaynEgo || 1);
    setBits(bytes, baseOffset + 23, baseOffset + 26, prisonerData.tethEgo || 1);
    setBits(bytes, baseOffset + 30, baseOffset + 33, prisonerData.hethEgo || 1);
    setBits(bytes, baseOffset + 37, baseOffset + 40, prisonerData.bathEgo || 1);
}

/**
 * 수감자 배열을 덱 편성 코드로 인코딩하는 함수
 * @param {Array} prisonersData - 수감자 데이터 배열
 * @param {number} totalPrisoners - 총 수감자 수 (기본: 12)
 * @returns {string|null} 인코딩된 덱 편성 코드 또는 null
 */
function encodeFormationCode(prisonersData, totalPrisoners = 12) {
    try {
        console.log('🔧 덱 편성 코드 인코딩 시작...\n');
        
        // 총 비트 수 계산 (수감자당 46비트)
        const totalBits = totalPrisoners * 46;
        const totalBytes = Math.ceil(totalBits / 8);
        
        console.log('📊 인코딩 정보:');
        console.log('총 수감자 수:', totalPrisoners);
        console.log('총 비트 수:', totalBits);
        console.log('총 바이트 수:', totalBytes);
        
        // 바이트 배열 초기화
        const bytes = new Array(totalBytes).fill(0);
        
        // 각 수감자 데이터 설정
        for (let i = 0; i < totalPrisoners; i++) {
            const prisonerData = prisonersData[i] || {};
            setPrisoner(bytes, i, prisonerData);
            
            if (prisonerData.formationOrder > 0) {
                const prisonerName = PRISONER_NAMES[i] || `수감자 ${i + 1}`;
                console.log(`\n${prisonerName} 설정:`);
                console.log(`  인격: ${prisonerData.identity || 1}`);
                console.log(`  편성 순서: ${prisonerData.formationOrder}`);
                console.log(`  자인 에고: ${prisonerData.zaynEgo || 1}`);
                console.log(`  테스 에고: ${prisonerData.tethEgo || 1}`);
                console.log(`  헤드 에고: ${prisonerData.hethEgo || 1}`);
                console.log(`  바브 에고: ${prisonerData.bathEgo || 1}`);
            }
        }
        
        console.log('\n🔄 인코딩 과정:');
        console.log('바이트 배열:', bytes);
        console.log('16진수:', Buffer.from(bytes).toString('hex').match(/.{2}/g).join(' '));
        
        // 1단계: 바이너리 → Base64
        const binaryBuffer = Buffer.from(bytes);
        const base64Text = binaryBuffer.toString('base64');
        console.log('1단계: 바이너리 → Base64 완료');
        console.log('중간 Base64:', base64Text);
        
        // 2단계: Base64 → Gzip
        const gzipBuffer = zlib.gzipSync(Buffer.from(base64Text, 'utf8'));
        console.log('2단계: Base64 → Gzip 압축 완료');
        
        // 3단계: Gzip → 최종 Base64
        const finalCode = gzipBuffer.toString('base64');
        console.log('3단계: Gzip → 최종 Base64 완료');
        
        console.log('\n✅ 인코딩 완료!');
        console.log('최종 코드:', finalCode);
        
        return finalCode;
        
    } catch (error) {
        console.log('❌ 인코딩 실패:', error.message);
        return null;
    }
}

/**
 * 편성 데이터를 간단한 형태로 생성하는 헬퍼 함수
 * @param {Array} formationList - 편성 리스트 [수감자인덱스, 인격ID, 자인ID, 테스ID, 헤드ID, 바브ID]
 * @returns {Array} 수감자 데이터 배열
 */
function createFormationData(formationList) {
    const prisonersData = new Array(12).fill(null).map(() => ({}));
    
    formationList.forEach((formation, index) => {
        const [prisonerIndex, identityId, zaynId, tethId, hethId, bathId] = formation;
        if (prisonerIndex >= 0 && prisonerIndex < 12) {
            prisonersData[prisonerIndex] = {
                identity: identityId || 1,
                formationOrder: index + 1,
                zaynEgo: zaynId || 1,
                tethEgo: tethId || 1,
                hethEgo: hethId || 1,
                bathEgo: bathId || 1
            };
        }
    });
    
    return prisonersData;
}

// 수감자 이름 배열 (고정 순서)
const PRISONER_NAMES = [
    '이상', '파우스트', '돈키호테', '로슈', '뫼르소', '홍루', 
    '히스클리프', '이스마엘', '로쟈', '싱클레어', '오티스', '그레고르'
];

// 인격 데이터 (수감자별 인격 ID -> 인격 이름 매핑)
const IDENTITY_DATA = {
    0: { // 이상
        1: '이상 (기본)', // 예시
        2: '이상 인격 2', // 추후 채워넣을 예정
        3: '이상 인격 3',
        4: '이상 인격 4',
        5: '이상 인격 5',
        6: '이상 인격 6',
        // 더 많은 인격들...
    },
    1: { // 파우스트
        1: '파우스트 (기본)',
        2: '파우스트 인격 2',
        3: '파우스트 인격 3',
        // 더 많은 인격들...
    },
    2: { // 돈키호테
        1: '돈키호테 (기본)',
        2: '돈키호테 인격 2',
        // 더 많은 인격들...
    },
    3: { // 로슈
        1: '로슈 (기본)',
        2: '로슈 인격 2',
        // 더 많은 인격들...
    },
    4: { // 뫼르소
        1: '뫼르소 (기본)',
        2: '뫼르소 인격 2',
        // 더 많은 인격들...
    },
    5: { // 홍루
        1: '홍루 (기본)',
        2: '홍루 인격 2',
        // 더 많은 인격들...
    },
    6: { // 히스클리프
        1: '히스클리프 (기본)',
        2: '히스클리프 인격 2',
        // 더 많은 인격들...
    },
    7: { // 이스마엘
        1: '이스마엘 (기본)',
        2: '이스마엘 인격 2',
        // 더 많은 인격들...
    },
    8: { // 로쟈
        1: '로쟈 (기본)',
        2: '로쟈 인격 2',
        // 더 많은 인격들...
    },
    9: { // 싱클레어
        1: '싱클레어 (기본)',
        2: '싱클레어 인격 2',
        // 더 많은 인격들...
    },
    10: { // 오티스
        1: '오티스 (기본)',
        2: '오티스 인격 2',
        // 더 많은 인격들...
    },
    11: { // 그레고르
        1: '그레고르 (기본)',
        2: '그레고르 인격 2',
        // 더 많은 인격들...
    }
};

// 에고 데이터 (수감자별 에고 ID -> 에고 이름 매핑)
const EGO_DATA = {
    0: { // 이상
        1: '이상 기본 에고',
        2: '이상 에고 2',
        3: '이상 에고 3',
        // 더 많은 에고들...
    },
    1: { // 파우스트
        1: '파우스트 기본 에고',
        2: '파우스트 에고 2',
        // 더 많은 에고들...
    },
    // 나머지 수감자들...
};

/**
 * 인격 이름을 가져오는 함수
 * @param {number} prisonerIndex - 수감자 인덱스 (0부터 시작)
 * @param {number} identityId - 인격 ID
 * @returns {string} 인격 이름
 */
function getIdentityName(prisonerIndex, identityId) {
    const prisonerIdentities = IDENTITY_DATA[prisonerIndex];
    if (prisonerIdentities && prisonerIdentities[identityId]) {
        return prisonerIdentities[identityId];
    }
    return `인격 ${identityId}`;
}

/**
 * 에고 이름을 가져오는 함수
 * @param {number} prisonerIndex - 수감자 인덱스 (0부터 시작)
 * @param {number} egoId - 에고 ID
 * @returns {string} 에고 이름
 */
function getEgoName(prisonerIndex, egoId) {
    const prisonerEgos = EGO_DATA[prisonerIndex];
    if (prisonerEgos && prisonerEgos[egoId]) {
        return prisonerEgos[egoId];
    }
    return `에고 ${egoId}`;
}

/**
 * 개별 수감자 데이터를 파싱하는 함수
 * @param {number[]} bytes - 바이트 배열
 * @param {number} prisonerIndex - 수감자 인덱스 (0부터 시작)
 * @returns {object} 수감자 데이터
 */
function parsePrisoner(bytes, prisonerIndex) {
    const baseOffset = prisonerIndex * 46;
    
    return {
        prisonerIndex: prisonerIndex + 1,
        prisonerName: PRISONER_NAMES[prisonerIndex] || `수감자 ${prisonerIndex + 1}`,
        identity: extractBits(bytes, baseOffset + 5, baseOffset + 8),
        formationOrder: extractBits(bytes, baseOffset + 9, baseOffset + 12),
        zaynEgo: extractBits(bytes, baseOffset + 16, baseOffset + 19),
        tethEgo: extractBits(bytes, baseOffset + 23, baseOffset + 26),
        hethEgo: extractBits(bytes, baseOffset + 30, baseOffset + 33),
        bathEgo: extractBits(bytes, baseOffset + 37, baseOffset + 40)
    };
}

/**
 * 덱 편성 코드를 디코딩하는 메인 함수
 * @param {string} code - 인코딩된 덱 편성 코드
 * @returns {object|null} 디코딩된 데이터 또는 null
 */
function decodeFormationCode(code) {
    try {
        console.log('🔍 덱 편성 코드 디코딩 시작...\n');
        
        // 1단계: Base64 → Gzip
        const gzipBuffer = Buffer.from(code, 'base64');
        console.log('1단계: Base64 → Gzip 완료');
        
        // 2단계: Gzip → Base64 텍스트
        const base64Text = zlib.gunzipSync(gzipBuffer).toString('utf8');
        console.log('2단계: Gzip 압축 해제 완료');
        console.log('중간 Base64:', base64Text);
        
        // 3단계: Base64 → 최종 바이너리
        const finalBinary = Buffer.from(base64Text, 'base64');
        const bytes = Array.from(finalBinary);
        
        console.log('\n📊 바이너리 데이터 분석:');
        console.log('총 바이트 수:', finalBinary.length);
        console.log('총 비트 수:', finalBinary.length * 8);
        console.log('16진수:', finalBinary.toString('hex').match(/.{2}/g).join(' '));
        console.log('배열:', bytes);
        
        // 총 비트 수로 수감자 수 계산
        const totalBits = finalBinary.length * 8;
        const maxPrisoners = Math.floor(totalBits / 46);
        
        console.log('\n👥 수감자 데이터 분석:');
        console.log('최대 수감자 수:', maxPrisoners);
        
        // 각 수감자 데이터 파싱
        const prisoners = [];
        for (let i = 0; i < maxPrisoners; i++) {
            const prisonerData = parsePrisoner(bytes, i);
            prisoners.push(prisonerData);
            
            console.log(`\n${prisonerData.prisonerName} (${i + 1}번째):`);
            console.log(`  인격: ${getIdentityName(i, prisonerData.identity)} (ID: ${prisonerData.identity})`);
            console.log(`  편성 순서: ${prisonerData.formationOrder} ${prisonerData.formationOrder === 0 ? '(미편성)' : ''}`);
            console.log(`  자인 에고: ${getEgoName(i, prisonerData.zaynEgo)} (ID: ${prisonerData.zaynEgo})`);
            console.log(`  테스 에고: ${getEgoName(i, prisonerData.tethEgo)} (ID: ${prisonerData.tethEgo})`);
            console.log(`  헤드 에고: ${getEgoName(i, prisonerData.hethEgo)} (ID: ${prisonerData.hethEgo})`);
            console.log(`  바브 에고: ${getEgoName(i, prisonerData.bathEgo)} (ID: ${prisonerData.bathEgo})`);
        }
        
        return {
            totalBytes: finalBinary.length,
            totalBits: totalBits,
            maxPrisoners: maxPrisoners,
            prisoners: prisoners,
            rawData: bytes
        };
        
    } catch (error) {
        console.log('❌ 디코딩 실패:', error.message);
        return null;
    }
}

/**
 * 편성된 수감자들만 필터링하여 표시하는 함수
 * @param {object} decodedData - 디코딩된 데이터
 */
function showFormation(decodedData) {
    if (!decodedData) return;
    
    const formedPrisoners = decodedData.prisoners
        .filter(p => p.formationOrder > 0)
        .sort((a, b) => a.formationOrder - b.formationOrder);
    
    console.log('\n🎯 현재 편성:');
    if (formedPrisoners.length === 0) {
        console.log('편성된 수감자가 없습니다.');
        return;
    }
    
    formedPrisoners.forEach((prisoner, index) => {
        console.log(`${index + 1}. ${prisoner.prisonerName} (편성 순서: ${prisoner.formationOrder})`);
        console.log(`   인격: ${getIdentityName(prisoner.prisonerIndex - 1, prisoner.identity)}`);
        console.log(`   자인: ${getEgoName(prisoner.prisonerIndex - 1, prisoner.zaynEgo)}, 테스: ${getEgoName(prisoner.prisonerIndex - 1, prisoner.tethEgo)}, 헤드: ${getEgoName(prisoner.prisonerIndex - 1, prisoner.hethEgo)}, 바브: ${getEgoName(prisoner.prisonerIndex - 1, prisoner.bathEgo)}`);
    });
}

/**
 * 바이너리 데이터를 비트 단위로 시각화하는 함수
 * @param {number[]} bytes - 바이트 배열
 * @param {number} maxBytes - 표시할 최대 바이트 수
 */
function visualizeBits(bytes, maxBytes = 10) {
    console.log('\n🔍 비트 시각화 (처음 ' + Math.min(maxBytes, bytes.length) + '바이트):');
    
    for (let i = 0; i < Math.min(maxBytes, bytes.length); i++) {
        const byte = bytes[i];
        const binary = byte.toString(2).padStart(8, '0');
        const hex = byte.toString(16).padStart(2, '0').toUpperCase();
        console.log(`바이트 ${i}: ${binary} (0x${hex}, ${byte})`);
    }
}

// ESM 환경에서 main 체크
const isMain = (() => {
    const filename = fileURLToPath(import.meta.url);
    return process.argv[1] && basename(process.argv[1]) === basename(filename);
})();

if (isMain) {
    const command = process.argv[2];
    const code = process.argv[3];
    const showBits = process.argv.includes('--bits');
    const showFormationOnly = process.argv.includes('--formation');
    
    if (command === 'decode') {
        if (!code) {
            console.error('사용법: node decodeTool.js decode <code> [--bits] [--formation]');
            console.error('  --bits: 비트 시각화 표시');
            console.error('  --formation: 편성된 수감자만 표시');
            process.exit(1);
        }
        
        const result = decodeFormationCode(code);
        
        if (result) {
            if (showBits) {
                visualizeBits(result.rawData);
            }
            
            if (showFormationOnly) {
                showFormation(result);
            }
        }
    } else if (command === 'encode') {
        // 예시 편성 데이터 (실제 사용 시 사용자 입력으로 대체)
        const exampleFormation = [
            [0, 2, 1, 1, 1, 1], // 이상: 인격2, 기본에고들
            [6, 1, 1, 1, 2, 1], // 히스클리프: 기본인격, 헤드에고2
            [2, 3, 1, 1, 1, 1], // 돈키호테: 인격3, 기본에고들
        ];
        
        const formationData = createFormationData(exampleFormation);
        const encodedCode = encodeFormationCode(formationData);
        
        if (encodedCode) {
            console.log('\n🔍 검증을 위한 디코딩:');
            decodeFormationCode(encodedCode);
        }
    } else {
        console.error('사용법:');
        console.error('  디코딩: node decodeTool.js decode <code> [--bits] [--formation]');
        console.error('  인코딩: node decodeTool.js encode');
        console.error('');
        console.error('옵션:');
        console.error('  --bits: 비트 시각화 표시');
        console.error('  --formation: 편성된 수감자만 표시');
        process.exit(1);
    }
}

// 함수들을 export (다른 모듈에서 사용 가능)
export { 
    decodeFormationCode, 
    encodeFormationCode, 
    createFormationData,
    showFormation, 
    visualizeBits, 
    getIdentityName, 
    getEgoName, 
    IDENTITY_DATA, 
    EGO_DATA 
};