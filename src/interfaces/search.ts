// @/interfaces/search.ts

// getSearch API의 응답 타입
export interface SearchResponse {
  searchSinnerId: number;
  identityListInfoDto: IdentityListInfoDto[];
  egoListInfoDto: EgoInfoDto[];
}

// 인격(Identity) 정보 DTO
export interface IdentityListInfoDto {
  sinnerName: string;
  identityId: number;
  identityName: string;
  season: number;
  grade: number;
  keyword: string[];
  afterProfileImage: string;
  afterZoomImage: string | null;
  beforeZoomImage: string;
  identitySkillLevelInfos: SkillLevelInfo[];
}

// 스킬 레벨별 정보
export interface SkillLevelInfo {
  level: number;
  identitySkillInfos: SkillInfo[];
}

// 개별 스킬 정보
export interface SkillInfo {
  skillName: string;
  skillType: string;
  resource: string | Record<string, number>;
  effect: string;
  activeCond?: string;
  atkWeight?: number;
  coinNum?: number;
  coinPower?: number;
  skillPower?: number;
  coin1Effect?: string;
  coin2Effect?: string;
  coin3Effect?: string;
  coin4Effect?: string;
  coin5Effect?: string;
  nomalEffect?: string;
  atkType?: string;
  power?: string;
  skillNum?: string;
}

// E.G.O 정보 DTO
export interface EgoInfoDto {
  id: number;
  character: string;
  name: string;
  image: string;
  zoomImage: string;
  corImage: string;
  grade: string;
  season: number;
  resistance: string[];
  keyword: string[];
  passive: PassiveInfo;
  releaseDate: string;
  obtainingMethod: string;
  cost: number[];
  egoskills: EgoSkill[];
  egoCorSkills: EgoSkill[];
}

// E.G.O 패시브 정보
export interface PassiveInfo {
  name: string;
  content: string;
}

// E.G.O 스킬 정보
export interface EgoSkill {
  name: string;
  power: string;
  mentalConsume: number;
  atkType: string;
  resource: string;
  skillPower: number;
  coinPower: number;
  coinNum: number;
  atkWeight: number;
  construeLevel: number;
  normalEffect: string;
  coin1Effect?: string;
  coin2Effect?: string;
  coin3Effect?: string;
  coin4Effect?: string;
  coin5Effect?: string;
}
