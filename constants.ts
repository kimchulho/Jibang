import { RelationType } from './types';

// Standard Jibang Components
export const JIBANG_CONSTANTS = {
  PREFIX: '현', // Hyun (Manifest) - used for most immediate ancestors
  SUFFIX: '신위', // Shinwi (Spirit Seat)
  DEFAULT_MALE_TITLE: '학생', // Hhaksaeng (Student - default for those without office)
  DEFAULT_MALE_NAME: '부군', // Bugun (Husband/Father honorific)
  DEFAULT_FEMALE_TITLE: '유인', // Yuin (Lady - default title for wife of Hhaksaeng)
  DEFAULT_FEMALE_NAME_SUFFIX: '씨', // Ssi (Clan Name Suffix)
};

// Mapping relations to their Hanja representation
// For couples, we define the base logic. The specific text generation is handled in JibangForm.
export const RELATION_HANJA: Record<RelationType, { label: string; hanja: string; gender: 'M' | 'F' | 'COUPLE' }> = {
  [RelationType.FATHER]: { label: '아버지 (부)', hanja: '고', gender: 'M' },
  [RelationType.MOTHER]: { label: '어머니 (모)', hanja: '비', gender: 'F' },
  [RelationType.GRANDFATHER]: { label: '할아버지 (조부)', hanja: '조고', gender: 'M' },
  [RelationType.GRANDMOTHER]: { label: '할머니 (조모)', hanja: '조비', gender: 'F' },
  [RelationType.GREAT_GRANDFATHER]: { label: '증조할아버지 (증조부)', hanja: '증조고', gender: 'M' },
  [RelationType.GREAT_GRANDMOTHER]: { label: '증조할머니 (증조모)', hanja: '증조비', gender: 'F' },
  [RelationType.GREAT_GREAT_GRANDFATHER]: { label: '고조할아버지 (고조부)', hanja: '고조고', gender: 'M' },
  [RelationType.GREAT_GREAT_GRANDMOTHER]: { label: '고조할머니 (고조모)', hanja: '고조비', gender: 'F' },
  
  // Couple Relations
  [RelationType.COUPLE_PARENTS]: { label: '부모님 (부부 합설)', hanja: '고/비', gender: 'COUPLE' },
  [RelationType.COUPLE_GRANDPARENTS]: { label: '조부모님 (부부 합설)', hanja: '조고/조비', gender: 'COUPLE' },
  [RelationType.COUPLE_GREAT_GRANDPARENTS]: { label: '증조부모님 (부부 합설)', hanja: '증조고/증조비', gender: 'COUPLE' },
  [RelationType.COUPLE_GREAT_GREAT_GRANDPARENTS]: { label: '고조부모님 (부부 합설)', hanja: '고조고/고조비', gender: 'COUPLE' },

  [RelationType.HUSBAND]: { label: '남편 (부)', hanja: '벽', gender: 'M' }, 
  [RelationType.WIFE]: { label: '아내 (처)', hanja: '', gender: 'F' }, 
  [RelationType.SON]: { label: '아들 (자)', hanja: '', gender: 'M' },
  [RelationType.DAUGHTER]: { label: '딸 (녀)', hanja: '', gender: 'F' },
  [RelationType.CUSTOM]: { label: '직접 입력', hanja: '', gender: 'M' },
};

// Commonly used Clans and Family Names for quick selection (Optional usage)
export const COMMON_CLANS = [
  { kor: '김해', hanja: '金海' },
  { kor: '밀양', hanja: '密陽' },
  { kor: '전주', hanja: '全州' },
  { kor: '경주', hanja: '慶州' },
  { kor: '파평', hanja: '坡平' },
  { kor: '안동', hanja: '安東' },
];

export const COMMON_NAMES = [
  { kor: '김', hanja: '金' },
  { kor: '이', hanja: '李' },
  { kor: '박', hanja: '朴' },
  { kor: '최', hanja: '崔' },
  { kor: '정', hanja: '鄭' },
];