import { Role } from "./CharacterEnum";

export interface CharacterData {
  id: string;
  name: string;
  roldId: Role | null;
  animation?: CharacterAnimation;
}

export interface CharacterAnimation {
  animationFileName: string;
}
