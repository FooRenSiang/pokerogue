import { loggedInUser } from "./account";
import BattleScene from "./battle-scene";
import { Species } from "./enums/species";
import PokemonSpecies, {
  getPokemonSpecies,
  speciesStarters,
} from "./data/pokemon-species";
import { AES, enc } from "crypto-js";
import { Setting, setSetting, settingDefaults } from "./system/mod-settings";

/**
 * ONLY FOR OFFLINE! If you use the rogueserver then this will not work!
 * Check game-data and follow the implementation there if you want to make this online compatible (look for promises and "bypass login" codeblocks)
 */
const saveKey = "rQ69zeDm31cTqycu"; //decoupled from the gameData incase the key is set to secret in the future

export enum ModDataType {
  SYSTEM,
  SETTINGS,
}

export interface SaveData {
  starterData: StarterData;
}

export interface StarterData {
  [key: integer]: StarterDataEntry;
}

export interface StarterDataEntry {
  monotypeWinCount: integer;
}

function decrypt(data: string): string {
  return ((data: string) => AES.decrypt(data, saveKey).toString(enc.Utf8))(data);
}

function encrypt(data: string): string {
  return ((data: string) => AES.encrypt(data, saveKey))(data);
}

/**
 * MOD DATA
 */
export class ModData {
  private scene: BattleScene;
  public starterData: StarterData;

  constructor(scene: BattleScene) {
    this.scene = scene;
    this.starterData = {};
    this.loadSettings();
    this.initStarterData();
  }


  public saveSystem() {
    const mData = this.getSaveData();

    const maxIntAttrValue = Math.pow(2, 31);
    const modData = JSON.stringify(mData, (k: any, v: any) =>
      typeof v === "bigint"
        ? v <= maxIntAttrValue
          ? Number(v)
          : v.toString()
        : v
    );

    console.log("Saving mod Data");
    console.log(this.getSaveData());
    localStorage.setItem(`modData_${loggedInUser.username}`, encrypt(modData));
  }

  public loadSystem() {
    console.log("Loading Mod Data");
    if (!localStorage.getItem(`modData_${loggedInUser.username}`)) {
      return false;
    }
    this.initSystem(
      decrypt(localStorage.getItem(`modData_${loggedInUser.username}`))
    );
  }

  initSystem(modDataStr: string) {
    try {
      const modData = this.parseSaveData(modDataStr);

      console.log(this.getSaveData());
      localStorage.setItem(
        `modData_${loggedInUser.username}`,
        encrypt(modDataStr)
      );

      const initStarterData = !modData.starterData;

      if (initStarterData) {
        this.initStarterData();
      } else {
        this.starterData = modData.starterData;
      }
      //this.test();
    } catch (err) {
      console.error(err);
    }
  }

  test() {
    //console.log("TEST: test");
    //this.incrementMonoTypeWins(getPokemonSpecies(Species.BULBASAUR));
  }

  initStarterData(): void {
    const modStarterData: StarterData = {};

    const starterSpeciesIds = Object.keys(speciesStarters).map(
      (k) => parseInt(k) as Species
    );

    for (const speciesId of starterSpeciesIds) {
      modStarterData[speciesId] = {
        monotypeWinCount: 0,
      };
    }

    this.starterData = modStarterData;
  }

  getSaveData(): SaveData {
    return {
      starterData: this.starterData,
    };
  }

  parseSaveData(dataStr: string): SaveData {
    return JSON.parse(dataStr) as SaveData;
  }

  incrementMonoTypeWins(species: PokemonSpecies, forStarter: boolean = false ): integer {
    const speciesIdToIncrement: Species = species.getRootSpeciesId(forStarter);

    if (!this.starterData[speciesIdToIncrement].monotypeWinCount) {
      this.starterData[speciesIdToIncrement].monotypeWinCount = 0;
    }

    return ++this.starterData[speciesIdToIncrement].monotypeWinCount;
  }

  public saveSetting(setting: Setting, valueIndex: integer): boolean {
    console.log("SAVE MOD SETTINGS");
    let settings: object = {};
    if (localStorage.hasOwnProperty("mod-settings")) {
      settings = JSON.parse(localStorage.getItem("mod-settings"));
    }

    setSetting(this.scene, setting as Setting, valueIndex);

    Object.keys(settingDefaults).forEach((s) => {
      if (s === setting) {
        settings[s] = valueIndex;
      }
    });

    localStorage.setItem("mod-settings", JSON.stringify(settings));

    return true;
  }

  private loadSettings(): boolean {
    console.log("Saving mod Settings");
    Object.values(Setting)
      .map((setting) => setting as Setting)
      .forEach((setting) =>
        setSetting(this.scene, setting, settingDefaults[setting])
      );

    if (!localStorage.hasOwnProperty("mod-settings")) {
      return false;
    }

    const settings = JSON.parse(localStorage.getItem("mod-settings"));

    for (const setting of Object.keys(settings)) {
      setSetting(this.scene, setting as Setting, settings[setting]);
    }
  }
}
