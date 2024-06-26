import { vitaminTransfer } from "#app/modifier/modifier.js";
import BattleScene from "../../battle-scene";
import type { Setting } from "./settings";

type SettingOption = {
  value: string,
  label: string
};

const OFF_ON: SettingOption[] = [
  {
    value: "Off",
    label: "Off"
  },
  {
    value: "On",
    label: "On"
  }
];

export const SettingKeys = {
  INFINITE_BALLS: "INFINITE_BALLS", //Done
  CATCH_TRAINER_POKEMON: "CATCH_TRAINER_POKEMON", //Done
  HIDDEN_ABILITY: "HIDDEN_ABILITY", //Done
  SHINY: "SHINY", //Done
  EQUAL_EGG_MOVES: "EQUAL_EGG_MOVES", //Done
  INFINITE_VOUCHERS: "INFINITE_VOUCHERS", //Done
  WAVE_EGG_HATCH: "WAVE_EGG_HATCH", //Done
  EGG_RARITY: "EGG_RARITY", //Done
  EGG_SPECIES_PITTY: "EGG_SPECIES_PITTY", //Done
  CANDY_COST_MULTIPLIER: "CANDY_COST_MULTIPLIER", //Done
  REGEN_POKEMON: "REGEN_POKEMON", //Done

  // RIze2kNight
  STARTING_LEVEL: "STARTING_LEVEL",
  FREE_REROLL: "FREE_REROLL",
  ALWAYS_CATCH: "ALWAYS_CATCH",
  MAX_LUCK: "MAX_LUCK",
  FORM_CHANGE_RARITY: "FORM_CHANGE_RARITY",
  UNLIMITED_STARTER_POINTS: "UNLIMITED_STARTER_POINTS",
  VITAMIN_TRANSFER: "VITAMIN_TRANSFER",
  PANDEMIC_MODE: "PANDEMIC_MODE",
};

export const ModSetting: Array<Setting> = [
  {
    key: SettingKeys.STARTING_LEVEL,
    label: "Starting Level",
    options: [
      {value: "0", label: "Off"},
      {value: "1", label: "1"},
      {value: "5", label: "5"},
      {value: "10", label: "10"},
      {value: "20", label: "20"},
    ],
    default: 1,
    type: null
  },
  {
    key: SettingKeys.FREE_REROLL,
    label: "Free Reroll",
    options: OFF_ON,
    default: 0,
    type: null
  },
  {
    key: SettingKeys.ALWAYS_CATCH,
    label: "Always Catch",
    options: OFF_ON,
    default: 0,
    type: null
  },
  {
    key: SettingKeys.MAX_LUCK,
    label: "Max Luck",
    options: OFF_ON,
    default: 0,
    type: null
  },
  {
    key: SettingKeys.SHINY,
    label: "Shiny Chance",
    options: [
      {
        value: "1",
        label: "1x"
      },
      {
        value: "2",
        label: "2x"
      },
      {
        value: "6",
        label: "6x"
      },
      {
        value: "256",
        label: "256x"
      },
      {
        value: "768",
        label: "768x"
      },
      {
        value: "2048",
        label: "2048x"
      },
    ],
    default: 0,
    type: null
  },
  {
    key: SettingKeys.HIDDEN_ABILITY,
    label: "Hidden Ability Chance",
    options: [
      {
        value: "1",
        label: "1x"
      },
      {
        value: "2",
        label: "2x"
      },
      {
        value: "4",
        label: "4x"
      },
      {
        value: "6",
        label: "6x"
      },
      {
        value: "64",
        label: "64x"
      },
      {
        value: "256",
        label: "256x"
      },
    ],
    default: 0,
    type: null
  },
  {
    key: SettingKeys.INFINITE_VOUCHERS,
    label: "Infinite Gacha Vouchers",
    options: OFF_ON,
    default: 0,
    type: null
  },
  {
    key: SettingKeys.INFINITE_BALLS,
    label: "Infinite Pokeballs",
    options: OFF_ON,
    default: 0,
    type: null
  },
  {
    key: SettingKeys.CATCH_TRAINER_POKEMON,
    label: "Catch Trainer Pokémon",
    options: [
      {
        value: "0",
        label: "Off"
      },
      {
        value: "1",
        label: "On"
      },
      {
        value: "2",
        label: "No Restriction"
      }
    ],
    default: 0,
    type: null
  },
  {
    key: SettingKeys.EQUAL_EGG_MOVES,
    label: "Equal Egg Move Chance",
    options: OFF_ON,
    default: 0,
    type: null
  },
  {
    key: SettingKeys.WAVE_EGG_HATCH,
    label: "One Wave Egg Hatch",
    options: OFF_ON,
    default: 0,
    type: null
  },
  {
    key: SettingKeys.EGG_RARITY,
    label: "Increased Egg Rarity",
    options: [
      {
        value: "1",
        label: "1x"
      },
      {
        value: "2",
        label: "2x"
      },
      {
        value: "3",
        label: "3x"
      },
      {
        value: "4",
        label: "Great"
      },
      {
        value: "5",
        label: "Ultra"
      },
      {
        value: "6",
        label: "Master"
      },
    ],
    default: 0,
    type: null
  },
  {
    key: SettingKeys.EGG_SPECIES_PITTY,
    label: "Egg Species Pitty After",
    options: [
      {
        value: "0",
        label: "0"
      },
      {
        value: "3",
        label: "3"
      },
      {
        value: "6",
        label: "6"
      },
      {
        value: "9",
        label: "9"
      },
    ],
    default: 3,
    type: null
  },
  {
    key: SettingKeys.CANDY_COST_MULTIPLIER,
    label: "Candy Cost Multiplier",
    options: [
      {
        value: "1.5",
        label: "1.5x"
      },
      {
        value: "1",
        label: "1x"
      },
      {
        value: "0.5",
        label: "0.5x"
      },
      {
        value: "0.25",
        label: "0.25x"
      },
      {
        value: "0",
        label: "0x"
      },
    ],
    default: 1,
    type: null
  },
  {
    key: SettingKeys.REGEN_POKEMON,
    label: "Regen Complete Pokémon",
    options: [
      {
        value: "25",
        label: "25%"
      },
      {
        value: "50",
        label: "50%"
      },
      {
        value: "75",
        label: "75%"
      },
      {
        value: "100",
        label: "100%"
      },
    ],
    default: 0,
    type: null
  },
  {
    key: SettingKeys.FORM_CHANGE_RARITY,
    label: "Form Change Rarity",
    options: [
      {value: "0", label: "Default"},
      {value: "1", label: "Rebalanced"},
    ],
    default: 1,
    type: null
  },
  {
    key: SettingKeys.UNLIMITED_STARTER_POINTS,
    label: "Unlimited Starter Points",
    options: OFF_ON,
    default: 0,
    type: null
  },
  {
    key: SettingKeys.VITAMIN_TRANSFER,
    label: "Vitamin Transfer",
    options: OFF_ON,
    default: 0,
    type: null
  },
  {
    key: SettingKeys.PANDEMIC_MODE,
    label: "Pandemic Mode",
    options: OFF_ON,
    default: 0,
    requireReload: true,
    type: null
  },
];

/**
 * Return the index of a Setting
 * @param key SettingKey
 * @returns index or -1 if doesn't exist
 */
export function settingIndex(key: string) {
  return ModSetting.findIndex(s => s.key === key);
}

/**
 * Resets all settings to their defaults
 * @param scene current BattleScene
 */
export function resetSettings(scene: BattleScene) {
  ModSetting.forEach(s => setModSetting(scene, s.key, s.default));
}

/**
 * Updates a setting for current BattleScene
 * @param scene current BattleScene
 * @param setting string ideally from SettingKeys
 * @param value value to update setting with
 * @returns true if successful, false if not
 */
export function setModSetting(scene: BattleScene, setting: string, value: number): boolean {
  const index: number = settingIndex(setting);
  if (index === -1) {
    return false;
  }

  switch (ModSetting[index].key) {
  case SettingKeys.INFINITE_BALLS:
    scene.mods.infiniteBalls = ModSetting[index].options[value].value === "On";
    break;
  case SettingKeys.CATCH_TRAINER_POKEMON:
    const trainerValue = parseInt(ModSetting[index].options[value].value);
    scene.mods.catchTrainerPokemon = trainerValue > 0;
    scene.mods.catchTrainerPokemonRestrictions = trainerValue === 1;
    break;
  case SettingKeys.HIDDEN_ABILITY:
    scene.mods.hiddenAbilityModifier = parseInt(ModSetting[index].options[value].value);
    break;
  case SettingKeys.SHINY:
    scene.mods.shinyModifier = parseInt(ModSetting[index].options[value].value);
    break;
  case SettingKeys.EQUAL_EGG_MOVES:
    scene.mods.equalEggMoves = ModSetting[index].options[value].value === "On";
    break;
  case SettingKeys.INFINITE_VOUCHERS:
    scene.mods.infiniteVouchers = ModSetting[index].options[value].value === "On";
    break;
  case SettingKeys.WAVE_EGG_HATCH:
    scene.mods.overrideEggHatchWaves = ModSetting[index].options[value].value === "On";
    break;
  case SettingKeys.EGG_RARITY:
    let eggRarityMult = parseInt(ModSetting[index].options[value].value);
    switch (eggRarityMult) {
    case 4:
      eggRarityMult = 5;
      break;
    case 5:
      eggRarityMult = 32;
      break;
    case 6:
      eggRarityMult = 256;
    }
    scene.mods.overrideEggRarityIndex = eggRarityMult;
    console.log(scene.mods.overrideEggRarityIndex);
    break;
  case SettingKeys.EGG_SPECIES_PITTY:
    scene.mods.eggSpeciesPitty = parseInt(ModSetting[index].options[value].value);
    break;
  case SettingKeys.CANDY_COST_MULTIPLIER:
    scene.mods.candyCostMultiplier = parseFloat(ModSetting[index].options[value].value);
    break;
  case SettingKeys.REGEN_POKEMON:
    scene.mods.regenPokeChance = parseInt(ModSetting[index].options[value].value);
    break;

  // RIze2kNight
  case SettingKeys.STARTING_LEVEL:
    scene.mods.startingLevel = parseInt(ModSetting[index].options[value].value);
    break;
  case SettingKeys.FREE_REROLL:
    scene.mods.freeReroll = ModSetting[index].options[value].value === "On"? 0 : 1;
    break;
  case SettingKeys.ALWAYS_CATCH:
    scene.mods.alwaysCatch = ModSetting[index].options[value].value === "On";
    break;
  case SettingKeys.MAX_LUCK:
    scene.mods.maxLuck = ModSetting[index].options[value].value === "On";
    break;
  case SettingKeys.FORM_CHANGE_RARITY:
    const formChangeCheck = parseInt(ModSetting[index].options[value].value);
    scene.mods.formChangeRarity = formChangeCheck === 1;
    break;
  case SettingKeys.UNLIMITED_STARTER_POINTS:
    scene.mods.unlimitedStarterPts = ModSetting[index].options[value].value === "On";
    break;
  case SettingKeys.VITAMIN_TRANSFER:
    vitaminTransfer(ModSetting[index].options[value].value === "On");
    break;
  case SettingKeys.PANDEMIC_MODE:
    scene.mods.pandemicMode = ModSetting[index].options[value].value === "On";
    break;
  }
  return true;
}
