export interface ArkhamInvestigatorCard {
  pack_code: string | undefined;
  pack_name: string;
  type_code: "investigator";
  type_name: string;
  faction_code: string;
  faction_name: string;
  position: number;
  exceptional: boolean;
  myriad: boolean;
  code: string;
  name: string;
  real_name: string;
  subname: string;
  text: string;
  real_text: string;
  quantity: number;
  skill_willpower: number;
  skill_intellect: number;
  skill_combat: number;
  skill_agility: number;
  health: number;
  health_per_investigator: boolean;
  sanity: number;
  deck_limit: number;
  real_slot: string;
  traits: string;
  real_traits: string;
  deck_requirements: DeckRequirements;
  deck_options: DeckOption[];
  flavor: string;
  illustrator: string;
  is_unique: boolean;
  permanent: boolean;
  double_sided: boolean;
  back_text: string;
  back_flavor: string;
  octgn_id: string;
  url: string;
  imagesrc?: string;
  backimagesrc?: string;
  duplicated_by?: string[];
  alternated_by?: string[];
}

export interface DeckRequirements {
  size: number;
  card: {
    [starterCardCode: string]: {
      [linkedCardCode: string]: string;
    };
  };
  random: RandomDeckRequirement[];
}

export interface RandomDeckRequirement {
  target: string; // e.g., "subtype"
  value: string; // e.g., "basicweakness"
}

export interface DeckOption {
  faction: string[];
  level: {
    min: number;
    max: number;
  };
}
