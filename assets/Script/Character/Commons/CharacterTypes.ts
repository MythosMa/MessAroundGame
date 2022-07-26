import { ROLE } from "./CharacterEnum";

export interface CharacterData {
  id: string;
  name: string;
  roldId: ROLE | null;
  animation?: CharacterAnimation;
}

export interface CharacterAnimation {
  animationFileName: string;
}
