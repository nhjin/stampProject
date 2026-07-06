# Stamp-a-Day 📮

매일 사진 한 장을 "우표"로 만들어 월별 그리드에 붙여가는 비주얼 일기 앱.
전체 기획은 [stamp-diary-prompt.md](./stamp-diary-prompt.md) 참조.

## 실행

```bash
npm install
npm start          # Expo Dev Server (Expo Go 또는 dev build)
npm run android
npm run ios
```

## 구조

```
src/
├── app/                  # expo-router 화면
│   ├── index.tsx         #   월별 스탬프 보드 (메인)
│   ├── create.tsx        #   스탬프 만들기 플로우 (modal)
│   ├── stamp/[id].tsx    #   상세 뷰
│   └── settings.tsx      #   설정
├── components/
│   ├── StampFrame.tsx    # 톱니 우표 프레임 (SVG Path + ClipPath) — 핵심 정체성
│   └── StampCell.tsx     # 그리드 셀 (빈/채움/미래/오늘 상태)
├── data/                 # repository 계층 (v2 서버 동기화 대비 추상화)
│   ├── db.ts             #   SQLite 초기화 + 마이그레이션
│   ├── StampRepository.ts#   인터페이스
│   └── LocalStampRepository.ts
├── lib/
│   ├── dates.ts          # 'YYYY-MM-DD' 날짜 키 유틸
│   └── images.ts         # 이미지 2벌 저장 (1200px full / 300px thumb, 상대경로)
├── store/useStampStore.ts# zustand
└── constants/            # 색상 / 문자열(i18n 대비) / 레이아웃 상수
```

## 마일스톤 진행 상황

- [x] **M1 — 뼈대**: Expo 셋업, 라우팅, StampFrame, 데이터 계층
- [x] **M2 — 코어 루프**: 사진 선택 → 4:5 크롭(중앙 자동) → 붙이기 + 저장
- [ ] **M3 — 완성도**: 상세 뷰 액션(수정/교체/삭제), 붙이기 애니메이션
- [ ] **M4 — 마무리**: 리마인더 알림, 설정, 온보딩, 아이콘/스플래시
- [ ] **M5 — 배포**: EAS Build, TestFlight/내부 테스트
