export type HookCopy = {
  badge?:         string;
  heading?:       string;
  headingAccent?: string;
  subtext?:       string;
  cta?:           string;
  hookImage?:     string;   // path đến ảnh hero — component dùng làm fallback '/face-map-hook.svg'
};

export type MinigameCopy = {
  intro?:    { heading?: string; subtext?: string; cta?: string };
  wheel?:    { heading?: string; subtext?: string };
  faceMap?:  { heading?: string; subtext?: string };
  scanning?: { heading?: string };
};

export type PayoffCopy = {
  resultCard?: {
    concern?:  string;
    positive?: string;
  };
};

export type RecipeCopy = {
  hook?:     HookCopy;
  minigame?: MinigameCopy;
  payoff?:   PayoffCopy;
};
