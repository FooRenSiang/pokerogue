import BattleScene from "../battle-scene";

export enum Setting {
  Infinite_Pokeballs = "INFINITE_BALLS",
  Catch_Trainer_Pokemon = "CATCH_TRAINER_POKEMON",
  Hidden_Ability_Chance = "HIDDEN_ABILITY",
  Shiny_Chance = "SHINY",
  Equal_Egg_Move_Chance = "EGG_MOVES",
  Infinite_Gacha_Vouchers = "INFINITE_VOUCHERS",
  Quick_Egg_Hatch = "WAVE_EGG_HATCH",
  Egg_Rarity = "EGG_RARITY",
  New_Starters_From_Eggs = "EGG_POOL_OVERRIDE",
  Candy_Cost_Multiplier = "CANDY_COST_MULTIPLIER",
  Regen_Complete_Pokemon = "REGEN_POKEMON",
  Pandemic_Mode = "PANDEMIC_MODE"
}

export interface SettingOptions {
  [key: string]: string[];
}

export interface SettingDefaults {
  [key: string]: integer;
}

export const settingOptions: SettingOptions = {
  [Setting.Infinite_Pokeballs]: ["On", "Off"],
  [Setting.Catch_Trainer_Pokemon]: ["On", "NoRestrictions", "Off"],
  [Setting.Hidden_Ability_Chance]: ["1x", "2x", "4x", "6x", "64x", "256x"],
  [Setting.Shiny_Chance]: ["1x", "2x", "4x", "6x", "256x", "2048x"],
  [Setting.Equal_Egg_Move_Chance]: ["On", "Off"],
  [Setting.Infinite_Gacha_Vouchers]: ["On", "Off"],
  [Setting.Quick_Egg_Hatch]: ["On", "Off"],
  [Setting.Egg_Rarity]: ["1x", "2x", "3x", "Great", "Ultra", "Master"],
  [Setting.New_Starters_From_Eggs]: ["25%", "50%", "75%", "100%"],
  [Setting.Candy_Cost_Multiplier]: ["1.5x", "1x", "0.5x", "0x"],
  [Setting.Regen_Complete_Pokemon]: ["25%", "50%", "75%", "100%"],
  [Setting.Pandemic_Mode]: ["On", "Off"],
};

export const settingDefaults: SettingDefaults = {
  [Setting.Infinite_Pokeballs]: 1,
  [Setting.Catch_Trainer_Pokemon]: 0,
  [Setting.Hidden_Ability_Chance]: 0,
  [Setting.Shiny_Chance]: 0,
  [Setting.Equal_Egg_Move_Chance]: 0,
  [Setting.Infinite_Gacha_Vouchers]: 0,
  [Setting.Quick_Egg_Hatch]: 1,
  [Setting.Egg_Rarity]: 0,
  [Setting.New_Starters_From_Eggs]: 1,
  [Setting.Candy_Cost_Multiplier]: 1,
  [Setting.Regen_Complete_Pokemon]: 1,
  [Setting.Pandemic_Mode]: 1,
};

export const reloadSettings: Setting[] = [];

export function setSetting(scene: BattleScene, setting: Setting, value: integer): boolean {
  switch (setting) {
  case Setting.Infinite_Pokeballs:
    scene.mods.infiniteBalls = value == 0 ? true : false;
    break;
  case Setting.Catch_Trainer_Pokemon:
    scene.mods.catchTrainerPokemon = value == 2 ? false : true;
    scene.mods.catchTrainerPokemonRestrictions = value == 1 ? false : true;
    break;
  case Setting.Hidden_Ability_Chance:
    scene.mods.hiddenAbilityModifier = 1 / parseFloat(settingOptions[setting][value].replace("x", ""));
    break;
  case Setting.Shiny_Chance:
    scene.mods.shinyModifier = parseFloat(settingOptions[setting][value].replace("x", ""));
    break;
  case Setting.Equal_Egg_Move_Chance:
    scene.mods.equalEggMoves = value == 0 ? true : false;
    break;
  case Setting.Infinite_Gacha_Vouchers:
    scene.mods.infiniteVouchers = value == 0 ? true : false;
    break;
  case Setting.Quick_Egg_Hatch:
    scene.mods.setOverrideEggHatchWaves(value, scene);
    break;
  case Setting.Egg_Rarity:
    scene.mods.overrideEggRarityIndex = value;
    break;
  case Setting.New_Starters_From_Eggs:
    scene.mods.eggPoolWeight = parseFloat(settingOptions[setting][value].replace("%", "")) / 100;
    break;
  case Setting.Candy_Cost_Multiplier:
    scene.mods.candyCostMultiplier = parseFloat(settingOptions[setting][value].replace("x", ""));
    break;
  case Setting.Regen_Complete_Pokemon:
    scene.mods.regenPokeChance = parseFloat(settingOptions[setting][value].replace("%", "")) / 100;
    break;
  case Setting.Pandemic_Mode:
    scene.mods.setOverridePokerus(value);
  }
  scene.mods.test();
  return true;
}
