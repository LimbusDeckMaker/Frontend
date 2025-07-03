#!/usr/bin/env node
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { basename } from 'path';

function decodeFormationCode(code) {
    try {
        // 1단계: Base64 → Gzip
        const gzipBuffer = Buffer.from(code, 'base64');
        
        // 2단계: Gzip → Base64 텍스트
        const base64Text = zlib.gunzipSync(gzipBuffer).toString('utf8');
        console.log('중간 Base64:', base64Text);
        
        // 3단계: Base64 → 최종 바이너리
        const finalBinary = Buffer.from(base64Text, 'base64');
        
        console.log('✅ 최종 바이너리 (' + finalBinary.length + '바이트):');
        console.log('배열:', Array.from(finalBinary));
        console.log('16진수:', finalBinary.toString('hex').match(/.{2}/g).join(' '));
        
        return Array.from(finalBinary);
        
    } catch (error) {
        console.log('❌ 디코딩 실패:', error.message);
        return null;
    }
}

// ESM 환경에서 main 체크
const isMain = (() => {
    const filename = fileURLToPath(import.meta.url);
    return process.argv[1] && basename(process.argv[1]) === basename(filename);
})();

if (isMain) {
    const code = process.argv[2];
    if (!code) {
        console.error('사용법: node decodeTool.js <code>');
        process.exit(1);
    }
    decodeFormationCode(code);
}
