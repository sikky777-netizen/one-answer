# 한 장의 답 PWA

파일 구성:
- index.html : 전체 앱
- manifest.webmanifest : 홈화면 설치 정보
- sw.js : 오프라인 캐시
- icon-192.png / icon-512.png : 앱 아이콘

## GitHub Pages 올리기
1. ZIP을 풀고 파일 5개를 기존 GitHub Pages 저장소 최상위 폴더에 올립니다.
2. index.html이 기존 파일이라면 이 버전으로 교체합니다.
3. GitHub Pages가 켜져 있으면 배포 후 바로 열립니다.
4. HTTPS 환경에서 PWA 설치/공유 기능이 가장 안정적으로 동작합니다.

## 특징
- 외부 AI/API 없음
- 카테고리별 로컬 랜덤 문장 조합
- 수천 개 이상의 조합 가능
- 최근 답변 저장(localStorage)
- PNG 이미지 저장
- Web Share 지원 기기에서 이미지 포함 공유
- PWA 설치 및 오프라인 동작
