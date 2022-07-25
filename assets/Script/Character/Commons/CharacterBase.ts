import { CharacterData } from "./CharacterTypes";

class CharacterBase {
  characterData: CharacterData;
  constructor(characterData: CharacterData) {
    this.characterData = characterData;
  }
}

export default CharacterBase;
