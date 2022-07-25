import { CharacterData } from "../Commons/CharacterTypes";

export interface NpcSingleActionScript {
  script_id: number;
  script: Array<object>;
}

export interface NpcActionData {
  start_script_id: number;
  all_action_script: Array<NpcSingleActionScript>;
}

export interface NpcScript {
  init_data: CharacterData;
  action_data: NpcActionData;
}
