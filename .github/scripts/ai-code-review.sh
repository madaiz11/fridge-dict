#!/usr/bin/env bash
set -euo pipefail

PR_NUMBER="${1:?Usage: ai-code-review.sh <pr_number>}"
DIFF_FILE="${2:-pr.diff}"
REPO="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY required}"

if [ ! -s "$DIFF_FILE" ] || [ "$(wc -l < "$DIFF_FILE")" -eq 0 ]; then
  echo "ไม่มีไฟล์ที่ตรงเงื่อนไขให้รีวิว"
  exit 0
fi

PROMPT="บทบาท: คุณคือ Senior Software Engineer และ Security Auditor ที่มีความเชี่ยวชาญสูงและทำงานเนี๊ยบที่สุด
เป้าหมาย: รีวิว Code Diff ต่อไปนี้อย่างตรงไปตรงมา และเน้นจุดที่อาจพังในอนาคต

ข้อกำหนดในการรีวิว:
1. Logic & Bugs: ตรวจสอบตรรกะที่ผิดพลาด, Edge cases ที่ลืมคิด (เช่น null, empty, error handling)
2. Security: ตรวจหาช่องโหว่ เช่น SQL Injection, XSS, Hardcoded Secrets
3. Performance: จุดไหนที่เขียนแล้วช้า (เช่น N+1 query, loop ซ้อน loop ที่ไม่จำเป็น), Big O Notation, Space Complexity, Time Complexity, Memory Leak, Bottleneck
4. Clean Code: 
    DRY, KISS, YAGNI, 
    การตั้งชื่อ (Meaningful Names),
    การจัดการฟังก์ชัน (ต้องสั้น, ทำอย่างเดียว, พารามิเตอร์น้อย),
    คอมเมนต์ (โค้ดควรอธิบายตัวเอง, คอมเมนต์อธิบายเหตุผล),
    การจัดการข้อผิดพลาด (ใช้ Exception แทน Error Code, อย่า catch แล้วปล่อยให้บล็อกว่างไว้เฉยๆ)
5. Best Practices: ตรวจสอบมาตรฐาน TypeScript/Node.js และ monorepo (pnpm)

รูปแบบการตอบกลับ:
- ถ้าโค้ดดีอยู่แล้ว ข้ามไปเลยไม่ต้องพูดถึง
- ระบุ 'ชื่อไฟล์' และ 'บรรทัด' พร้อมเหตุผลที่มันไม่ดีและตัวอย่างโค้ดที่ควรจะเป็น
- ตอบเป็นภาษาไทยที่กระชับ ตรงประเด็น ไม่ต้องเกริ่นนำ"

jq -n --arg prompt "$PROMPT" --arg diff "$(cat "$DIFF_FILE")" '{
  "model": "stepfun/step-3.5-flash:free",
  "messages": [
    {"role": "system", "content": $prompt},
    {"role": "user", "content": $diff}
  ]
}' > payload.json

RESPONSE_FILE=$(mktemp)
HTTP_CODE=$(curl -s -w "%{http_code}" -o "$RESPONSE_FILE" \
  --connect-timeout 10 --max-time 60 \
  -X POST "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer ${OPENROUTER_API_KEY:?OPENROUTER_API_KEY required}" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://github.com/$REPO" \
  -H "X-Title: GitHub Actions Reviewer" \
  -d @payload.json) || true

if [ "$HTTP_CODE" != "200" ]; then
  echo "::error::OpenRouter API failed (HTTP $HTTP_CODE). Check Action logs."
  REVIEW_RESULT="เกิดข้อผิดพลาดในการเรียกใช้ OpenRouter API (HTTP $HTTP_CODE) กรุณาเช็ค Action Logs"
else
  REVIEW_RESULT=$(jq -r '.choices[0].message.content // empty' "$RESPONSE_FILE")
  if [ -z "$REVIEW_RESULT" ]; then
    REVIEW_RESULT="เกิดข้อผิดพลาดในการเรียกใช้ OpenRouter API กรุณาเช็ค Action Logs"
  fi
fi
rm -f "$RESPONSE_FILE"

if [ ${#REVIEW_RESULT} -gt 64000 ]; then
  REVIEW_RESULT="${REVIEW_RESULT:0:64000}... (truncated, GitHub comment limit 64KB)"
fi

echo "$REVIEW_RESULT" > review_comment.md
gh pr review "$PR_NUMBER" --request-changes --body-file review_comment.md
