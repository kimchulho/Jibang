
export enum RelationType {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  GRANDFATHER = 'GRANDFATHER',
  GRANDMOTHER = 'GRANDMOTHER',
  GREAT_GRANDFATHER = 'GREAT_GRANDFATHER',
  GREAT_GRANDMOTHER = 'GREAT_GRANDMOTHER',
  GREAT_GREAT_GRANDFATHER = 'GREAT_GREAT_GRANDFATHER',
  GREAT_GREAT_GRANDMOTHER = 'GREAT_GREAT_GRANDMOTHER',
  HUSBAND = 'HUSBAND',
  WIFE = 'WIFE',
  SON = 'SON',
  DAUGHTER = 'DAUGHTER',
  
  // Couple (Hapseol) Types
  COUPLE_PARENTS = 'COUPLE_PARENTS',
  COUPLE_GRANDPARENTS = 'COUPLE_GRANDPARENTS',
  COUPLE_GREAT_GRANDPARENTS = 'COUPLE_GREAT_GRANDPARENTS',
  COUPLE_GREAT_GREAT_GRANDPARENTS = 'COUPLE_GREAT_GREAT_GRANDPARENTS',

  CUSTOM = 'CUSTOM'
}

export interface JibangData {
  relation: RelationType;
  // Official title (e.g., 학생 Hhaksaeng for no public office) - Kept for internal logic if needed, but UI uses full text now
  title: string; 
  // For women: Clan name (Bon-gwan) e.g., Kimhae
  // For children: Name
  clan: string;
  // For women: Surname e.g., Kim
  familyName: string;
  
  // For Second Wife (Tertiary)
  clanTertiary?: string;
  familyNameTertiary?: string;

  // For specialized cases or overrides
  customText?: string;
  
  // Primary Text (Male / Single)
  koreanFullText: string;
  hanjaFullText: string;

  // Secondary Text (Female / First Wife in Couple)
  koreanFullTextSecondary?: string;
  hanjaFullTextSecondary?: string;

  // Tertiary Text (Second Wife / Jaechwibi in Couple)
  koreanFullTextTertiary?: string;
  hanjaFullTextTertiary?: string;
}

export interface HanjaMap {
  [key: string]: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}