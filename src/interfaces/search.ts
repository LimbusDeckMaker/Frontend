// Interfaces for getSearch response

export interface SearchResponse {
  searchSinnerId: number;
  identityListInfoDto: IdentityInfo[];
  egoListInfoDto: EgoInfo[];
}

export interface IdentityInfo {
  sinnerName: string;
  identityName: string;
  season: number;
  grade: number;
  keyword: string[];
  afterProfileImage: string;
  afterZoomImage: string | null;
  beforeZoomImage: string;
  identitySkillLevelInfos: SkillLevelInfo[];
}

export interface SkillLevelInfo {
  level: number;
  identitySkillInfos: SkillInfo[];
}

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

export interface EgoInfo {
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

export interface PassiveInfo {
  name: string;
  content: string;
}

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
