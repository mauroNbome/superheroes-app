export interface Hero {
  id: number;
  name: string;
  superpower: string;
  alterEgo: string;
  firstAppearance: Date;
  isActive: boolean;
}

export interface HeroCreateRequest {
  name: string;
  superpower: string;
  alterEgo: string;
  firstAppearance: Date;
  isActive: boolean;
}

export interface HeroUpdateRequest extends Partial<HeroCreateRequest> {
  id: number;
} 