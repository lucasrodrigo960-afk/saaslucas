
export interface EditorialDocument {
  title: string;
  subtitle: string;
  positionPhrase: string;
  architecture: {
    feeling: string;
    pain: string;
    authority: string;
  };
  days: DayPlan[];
  immersion?: ImmersionBlock;
  observation: string;
}

export interface CarouselSlide {
  slideNumber: number;
  visualDescription: string;
  imageSuggestion: string;
  textOnCard: string;
}

export interface ReelsScene {
  sceneNumber: number;
  visualAction: string;
  audioSpeech: string;
}

export interface ReelsScript {
  hook: string;
  scenes: ReelsScene[];
  cta: string;
}

export interface DayPlan {
  day: string;
  format: string;
  theme: string;
  strategicIntent: string;
  creativeDirection: string;
  carouselSlides?: CarouselSlide[];
  reelsScript?: ReelsScript;
  staticPostInfo?: {
    visualComposition: string;
    imageSuggestion: string;
    headlineOnCard: string;
  };
  visualElements: {
    cards?: string;
    reels?: string;
    stories?: string;
  };
  caption: string;
  viewerPsychology: string;
  approachStrategy: string;
  storySuggestions: string[];
  executionNotes?: string;
}

export interface ImmersionBlock {
  title: string;
  concept: string;
  steps: {
    visualStep: string;
    imageRef: string;
    cardText: string;
    objective: string;
    expectedResult: string;
  }[];
  caption: string;
  reelsCover: string;
  approachStrategy: string;
}
