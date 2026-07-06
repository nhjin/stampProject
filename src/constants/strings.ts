/** 한국어 우선. 추후 i18n 대비 문자열 상수 분리 */
export const Strings = {
  appName: 'Stamp-a-Day',
  board: {
    monthTitle: (year: number, month: number) => `${year}년 ${month}월`,
    emptyStateTitle: '첫 우표를 붙여보세요',
    emptyStateBody: '오늘 칸을 눌러 사진 한 장으로 우표를 만들 수 있어요.',
  },
  create: {
    title: '우표 만들기',
    pickFromCamera: '카메라로 촬영',
    pickFromAlbum: '앨범에서 선택',
    memoPlaceholder: '한 줄 메모 (선택)',
    attach: '붙이기',
    retake: '다른 사진으로',
  },
  detail: {
    editMemo: '메모 수정',
    replacePhoto: '사진 교체',
    delete: '삭제',
    deleteConfirmTitle: '우표를 떼어낼까요?',
    deleteConfirmBody: '이 날의 우표와 메모가 삭제됩니다.',
    cancel: '취소',
  },
  settings: {
    title: '설정',
    reminder: '매일 리마인더',
    reminderTime: '알림 시간',
    totalStamps: '모은 우표',
    backupPlaceholder: '백업 (준비 중)',
    appVersion: '앱 버전',
  },
  notification: {
    title: 'Stamp-a-Day',
    body: '오늘의 우표를 붙일 시간이에요 📮',
  },
} as const;
