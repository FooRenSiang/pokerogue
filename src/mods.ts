import BattleScene, { starterColors } from "./battle-scene";
import { Stat, getStatName as getDataStatName } from "./data/pokemon-stat";
import { allAbilities } from "./data/ability";
import { speciesEggMoves } from "./data/egg-moves";
import { Moves } from "./enums/moves";
import { allMoves } from "./data/move";
import { pokemonEvolutions } from "./data/pokemon-evolutions";
import { LevelMoves } from "./data/pokemon-level-moves";
import PokemonSpecies, { PokemonSpeciesForm, getPokemonSpecies, getPokemonSpeciesForm, speciesStarters } from "./data/pokemon-species";
import { Type } from "./data/type";
import * as Types from "./data/type";
import { Button } from "./enums/buttons";
import { PlayerPokemon, PokemonMove } from "./field/pokemon";
import { GameModes } from "./game-mode";
import i18next from "i18next";
import { achvs } from "./system/achv";
import { AbilityAttr, DexAttr, GameData } from "./system/game-data";
import StarterSelectUiHandler from "./ui/starter-select-ui-handler";
import UI, { Mode } from "./ui/ui";
import * as Utils from "./utils";
import { EggTier } from "./enums/egg-type";
import { Species } from "./enums/species";
import { pokemonFormChanges } from "./data/pokemon-forms";
import { TextStyle, addTextObject } from "./ui/text";
import { WeatherType } from "./data/weather";
import { TrainerType } from "./enums/trainer-type";
import Trainer, { TrainerVariant } from "./field/trainer";
import { trainerConfigs } from "./data/trainer-config";
import { starterSelectUiHandler } from "./locales/en/starter-select-ui-handler";
import { Scene } from "phaser";
import { EggSourceType } from "./enums/egg-source-types";
import { IEggOptions } from "./data/egg";

export class Mods {

  //SETTINGS
  public startingLevel: integer;

  public freeReroll: integer;

  public alwaysCatch: integer;

  public maxLuck: integer

  public infiniteBalls: boolean;

  public hiddenAbilityModifier: integer;
  public shinyModifier: integer;

  public catchTrainerPokemon: boolean;
  public catchTrainerPokemonRestrictions: boolean;

  public equalEggMoves: boolean;

  public infiniteVouchers: boolean;

  public overrideEggHatchWaves: boolean;

  public overrideEggRarityIndex: integer;

  public eggPoolWeight: integer;

  public formChangeRarity: boolean;

  public candyCostMultiplier: integer;

  public regenPokeChance: integer;

  public unlimitedstarterpts: boolean;

  public pokerusPandemic: boolean;

  test() {
    return "test";
  }

  /**
   * Create a random team
   */
  async randomTeam(uiHandler: StarterSelectUiHandler, ui: UI, scene: BattleScene, genSpecies: PokemonSpecies[][]) {
    let loopCount = 0;

    while (uiHandler.tryUpdateValue(0.1) && loopCount < 200) {
      loopCount++;
      uiHandler.blockInput = true;
      const delay = 10;

      const gen = Utils.randInt(8, 0);
      const cursor = Utils.randInt(80, 0);

      if (!!genSpecies[gen][cursor]) {
        console.log(
          "Loop: " +
            loopCount +
            ": " +
            uiHandler.tryUpdateValue(scene.gameData.getSpeciesStarterValue(genSpecies[gen][cursor].speciesId)) +
            ", " +
            scene.gameData.getSpeciesStarterValue(genSpecies[gen][cursor].speciesId) +
            "|" +
            gen +
            ", " +
            cursor
        );
      }

      if (
        !!genSpecies[gen][cursor] &&
        genSpecies[gen][cursor] &&
        scene.gameData.dexData[genSpecies[gen][cursor].speciesId].caughtAttr &&
        uiHandler.tryUpdateValue(scene.gameData.getSpeciesStarterValue(genSpecies[gen][cursor].speciesId))
      ) {
        //Moves the gen cursor to the correct generation
        const gensToMove = Math.abs(gen - uiHandler.getGenCursorWithScroll());
        uiHandler.setGenMode(true);
        for (let i = 0; i < gensToMove; i++) {
          uiHandler.blockInput = false;
          if (gen > uiHandler.getGenCursorWithScroll()) {
            console.log("increasing");
            uiHandler.processInput(Button.DOWN);
          } else {
            console.log("decreasing");
            uiHandler.processInput(Button.UP);
          }

          uiHandler.blockInput = true;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        //Moves the cursor
        uiHandler.setGenMode(false);
        uiHandler.setCursor(cursor);

        //Tries to add the Pokémon
        await new Promise((resolve) => setTimeout(resolve, delay));
        uiHandler.blockInput = false;
        ui.processInput(Button.ACTION);
        uiHandler.blockInput = true;

        await new Promise((resolve) => setTimeout(resolve, delay));
        uiHandler.blockInput = false;
        ui.processInput(Button.ACTION);
        uiHandler.blockInput = true;

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    uiHandler.tryUpdateValue(0);
    uiHandler.blockInput = false;
  }
  getMonotype(selectedPokemon: PokemonSpeciesForm[]): Type[] {
    let type = Array.from({ length: 19 }, (_, i) => i - 1);
    for (const pokemon of selectedPokemon) {
      const evolutionArray = this.getEvolutions(pokemon);

      console.log("Pokemon" + pokemon);
      let newTypes: Type[] = [];
      for (const evo of evolutionArray) {
        const type1: Type = evo.type1;
        const type2: Type = evo.type2;
        console.log("Type1: " + type1);
        console.log("Type2: " + type2);
        newTypes = [...newTypes, type1, type2];
      }
      type = type.filter((value) => newTypes.includes(value));
    }

    console.log("GetMonotype: " + type);
    return type;
  }
  getEvolutions(pokemon: PokemonSpeciesForm): PokemonSpeciesForm[] {
    let output = [pokemon];
    if (pokemonEvolutions[pokemon.speciesId]) {
      for (const evolution of pokemonEvolutions[pokemon.speciesId]) {
        output = [...output, ...this.getEvolutions(getPokemonSpecies(evolution.speciesId))];
      }
    }
    return output;
  }
  isOfMonotype(pokemon: PokemonSpeciesForm, monoType: Type[], gameMode: GameModes): boolean {
    if (gameMode == GameModes.MONOTYPE && monoType) {
      let rightType = false;
      for (let t = 0; t < monoType.length; t++) {
        rightType = rightType || pokemon.isOfType(monoType[t]);
      }
      return rightType;
    }
    return true;
  }
  teamMonotype(starterGens: integer[], starterCursors: integer[], starterAttr: bigint[], genSpecies: PokemonSpeciesForm[][], gameData: GameData, lastSpecies?: PokemonSpeciesForm): Type[] {
    let currentSpecies: PokemonSpeciesForm[] = [];
    if (starterCursors.length > 0) {
      for (let i = 0; i < starterCursors.length; i++) {
        currentSpecies[i] = getPokemonSpeciesForm(genSpecies[starterGens[i]][starterCursors[i]].speciesId, gameData.getFormIndex(starterAttr[i]));
        console.log("CurrentSpecies DexAttr: " + starterAttr[i] + ", "+ currentSpecies[i].type1	+ ", "+ currentSpecies[i].type2);
      }
    }
    currentSpecies = lastSpecies ? [...currentSpecies, lastSpecies] : currentSpecies;

    const monotype = this.getMonotype(currentSpecies);
    return monotype;
  }

  /**
   * Adds egg moves to learnable moves
   */
  getLearnableMoves(scene: BattleScene, species: PokemonSpecies, fusionSpecies: PokemonSpecies, moveset: PokemonMove[], levelMoves: LevelMoves): Moves[] {
    const learnableMoves = levelMoves
      .map((lm) => lm[1])
      .filter((lm) => !moveset.filter((m) => m.moveId === lm).length)
      .filter((move: Moves, i: integer, array: Moves[]) => array.indexOf(move) === i);
    const isFusionSpecies = fusionSpecies ? 1 : 0;
    for (let speciesIndex = 0; speciesIndex <= isFusionSpecies; speciesIndex++) {
      const speciesId = speciesIndex < 1 ? species.getRootSpeciesId() : fusionSpecies.getRootSpeciesId();
      for (let moveIndex = 0; moveIndex < 4; moveIndex++) {
        if (
          scene.gameData.starterData[speciesId].eggMoves & Math.pow(2, moveIndex) &&
          moveset.filter((m) => m.moveId != speciesEggMoves[species.getRootSpeciesId()][moveIndex]).length == moveset.length
        ) {
          learnableMoves[learnableMoves.length] = speciesEggMoves[speciesId][moveIndex];
        }
      }
    }
    return learnableMoves;
  }

  /**
   * 1 Wave egg hatch
   */
  setOverrideEggHatchWaves(value: integer, scene: BattleScene) {
    if (value == 1) {
      this.overrideEggHatchWaves = true;
      if (scene instanceof BattleScene && scene.gameData != undefined) {
        scene.gameData.eggs.forEach((egg) => {
          egg.hatchWaves = 1;
        });
      }
    } else {
      this.overrideEggHatchWaves = false;
    }
  }

  /**
   * Rarer eggs
   */
  overrideEggRarity(sourceType: EggSourceType): EggTier {
    const tierValueOffset = sourceType === EggSourceType.GACHA_LEGENDARY ? 1 : 0;
    const tierValue = Utils.randInt(256);
    switch (this.overrideEggRarityIndex) {
    case 98:
      return EggTier.GREAT;
    case 99:
      return EggTier.ULTRA;
    case 100:
      return EggTier.MASTER;
    default:
      return tierValue >= (52 + tierValueOffset) * (this.overrideEggRarityIndex + 1)
        ? EggTier.COMMON
        : tierValue >= (8 + tierValueOffset) * (this.overrideEggRarityIndex + 1)
          ? EggTier.GREAT
          : tierValue >= (1 + tierValueOffset) * (this.overrideEggRarityIndex + 1)
            ? EggTier.ULTRA
            : EggTier.MASTER;
    }
  }

  /**
   * Fast Egg hatch animation
   */
  fastHatchAnimation(
    scene: BattleScene,
    pokemon: PlayerPokemon,
    eggMoveIndex: integer,
    eggContainer: Phaser.GameObjects.Container,
    pokemonSprite: Phaser.GameObjects.Sprite,
    pokemonShinySparkle: Phaser.GameObjects.Sprite
  ): Promise<void> {
    const isShiny = pokemon.isShiny();
    if (pokemon.species.subLegendary) {
      scene.validateAchv(achvs.HATCH_SUB_LEGENDARY);
    }
    if (pokemon.species.legendary) {
      scene.validateAchv(achvs.HATCH_LEGENDARY);
    }
    if (pokemon.species.mythical) {
      scene.validateAchv(achvs.HATCH_MYTHICAL);
    }
    if (isShiny) {
      scene.validateAchv(achvs.HATCH_SHINY);
    }

    return new Promise((resolve) => {
      this.revealHatchSprite(scene, pokemon, eggContainer, pokemonSprite, pokemonShinySparkle);
      scene.ui.showText(
        `A ${pokemon.name} hatched!`,
        100,
        () => {
          scene.gameData.updateSpeciesDexIvs(pokemon.species.speciesId, pokemon.ivs);
          scene.gameData.setPokemonCaught(pokemon, true, true).then(() => {
            scene.gameData
              .setEggMoveUnlocked(pokemon.species, eggMoveIndex)
              .then(() => {
                scene.ui.showText(null, 0);
              })
              .then(() => resolve());
          });
        },
        null,
        true,
        null
      );
    });
  }
  revealHatchSprite(
    scene: BattleScene,
    pokemon: PlayerPokemon,
    eggContainer: Phaser.GameObjects.Container,
    pokemonSprite: Phaser.GameObjects.Sprite,
    pokemonShinySparkle: Phaser.GameObjects.Sprite
  ) {
    pokemon.cry();

    eggContainer.setVisible(false);
    pokemonSprite.play(pokemon.getSpriteKey(true));
    pokemonSprite.setPipelineData("ignoreTimeTint", true);
    pokemonSprite.setPipelineData("spriteKey", pokemon.getSpriteKey());
    pokemonSprite.setPipelineData("shiny", pokemon.shiny);
    pokemonSprite.setPipelineData("variant", pokemon.variant);
    pokemonSprite.setVisible(true);

    if (pokemon.isShiny()) {
      pokemonShinySparkle.play(`sparkle${pokemon.variant ? `_${pokemon.variant + 1}` : ""}`);
      scene.playSound("sparkle");
    }
  }

  /**
   * More uncaught eggs
   */
  generateWeightedEgg(speciesPool: Species[], maxStarterValue: integer, minStarterValue: integer, scene: BattleScene): PokemonSpecies {
    const percentage = 1;
    let uncaughtPool = this.uncaughtSpeciesPool(speciesPool, scene, percentage);

    if (!uncaughtPool.length) {
      uncaughtPool = speciesPool;
    }

    let totalWeight = 0;
    const speciesWeights = [];
    for (const speciesId of uncaughtPool) {
      let weight = Math.floor((((maxStarterValue - speciesStarters[speciesId]) / (maxStarterValue - minStarterValue + 1)) * 1.5 + 1) * 100);
      const species = getPokemonSpecies(speciesId);
      if (species.isRegional()) {
        weight = Math.floor(weight / (species.isRareRegional() ? 8 : 2));
      }
      speciesWeights.push(totalWeight + weight);
      totalWeight += weight;
    }

    let species: Species;

    const rand = Utils.randSeedInt(totalWeight);
    for (let s = 0; s < speciesWeights.length; s++) {
      if (rand < speciesWeights[s]) {
        species = uncaughtPool[s];
        break;
      }
    }

    return getPokemonSpecies(species);
  }
  uncaughtSpeciesPool(speciesPool: Species[], scene: BattleScene, percentage: integer) {
    return speciesPool.filter((species) => !scene.gameData.dexData[species].caughtAttr || Math.random() > percentage);
  }

  /**
   * Egg moves candy unlock store
   */
  showEggMovesUnlock(
    scene: BattleScene,
    ui: UI,
    lastSpecies: PokemonSpecies,
    candyCount: any,
    uiHandler: StarterSelectUiHandler,
    pokemonCandyCountText: Phaser.GameObjects.Text
  ) {
    const options = [];

    for (let index = 0; index < 4; index++) {
      const eggMoveUnlocked = scene.gameData.starterData[lastSpecies.speciesId].eggMoves & Math.pow(2, index);
      if (!eggMoveUnlocked) {
        options.push({
          label: `x${this.unlockEggMovePrice(index, lastSpecies)} Unlock ${this.getEggMoveName(lastSpecies, index)}`,
          handler: () => {
            if (candyCount >= this.unlockEggMovePrice(index, lastSpecies)) {
              this.unlockEggMove(scene, ui, lastSpecies, uiHandler, pokemonCandyCountText, index);
            }
            return false;
          },
          item: "candy",
          itemArgs: starterColors[lastSpecies.speciesId],
        });
      }
    }

    options.push({
      label: i18next.t("menu:cancel"),
      handler: () => {
        ui.setMode(Mode.STARTER_SELECT);
        return true;
      },
    });
    ui.setModeWithoutClear(Mode.OPTION_SELECT, {
      options: options,
      yOffset: 47,
    });
  }
  protected unlockEggMove(
    scene: BattleScene,
    ui: UI,
    lastSpecies: PokemonSpecies,
    uiHandler: StarterSelectUiHandler,
    pokemonCandyCountText: Phaser.GameObjects.Text,
    index: integer
  ) {
    scene.gameData.setEggMoveUnlocked(lastSpecies, index);
    scene.gameData.starterData[lastSpecies.speciesId].candyCount -= this.unlockEggMovePrice(index, lastSpecies);

    pokemonCandyCountText.setText(`x${scene.gameData.starterData[lastSpecies.speciesId].candyCount}`);
    uiHandler.setSpeciesDetails(lastSpecies, undefined, undefined, undefined, undefined, undefined, undefined);

    scene.gameData.saveSystem().then((success) => {
      if (!success) {
        return scene.reset(true);
      }
    });
    ui.setMode(Mode.STARTER_SELECT);
    return true;
  }
  protected unlockEggMovePrice(index: integer, species: PokemonSpecies): integer {
    const baseCost = speciesStarters[species.speciesId] > 5 ? 3 : speciesStarters[species.speciesId] > 3 ? 4 : 5;
    const rareMoveAddition = index > 2 ? 1 : 0;

    return Math.round((baseCost + rareMoveAddition) * this.candyCostMultiplier);
  }
  getEggMoveName(species: PokemonSpecies, index: integer) {
    const hasEggMoves = species && speciesEggMoves.hasOwnProperty(species.speciesId);
    const eggMove = hasEggMoves ? allMoves[speciesEggMoves[species.speciesId][index]] : null;
    return eggMove.name;
  }

  /**
   * Shiny unlock store
   */
  showShiniesUnlock(
    scene: BattleScene,
    ui: UI,
    lastSpecies: PokemonSpecies,
    candyCount: any,
    uiHandler: StarterSelectUiHandler,
    pokemonCandyCountText: Phaser.GameObjects.Text
  ) {
    const options = [];

    for (let rarity = 1; rarity < 4; rarity++) {
      const shinyVariant = this.getShinyRarity(rarity);
      if (!(scene.gameData.dexData[lastSpecies.speciesId].caughtAttr & shinyVariant)) {
        options.push({
          label: `x${this.unlockShinyPrice(rarity, lastSpecies)} Unlock ${this.getShinyRarityName(rarity)}`,
          handler: () => {
            if (candyCount >= this.unlockShinyPrice(rarity, lastSpecies)) {
              this.unlockShiny(scene, ui, lastSpecies, uiHandler, pokemonCandyCountText, rarity);
            }
            return false;
          },
          item: "candy",
          itemArgs: starterColors[lastSpecies.speciesId],
        });
      }
    }

    options.push({
      label: i18next.t("menu:cancel"),
      handler: () => {
        ui.setMode(Mode.STARTER_SELECT);
        return true;
      },
    });
    ui.setModeWithoutClear(Mode.OPTION_SELECT, {
      options: options,
      yOffset: 47,
    });
  }
  protected unlockShiny(
    scene: BattleScene,
    ui: UI,
    lastSpecies: PokemonSpecies,
    uiHandler: StarterSelectUiHandler,
    pokemonCandyCountText: Phaser.GameObjects.Text,
    rarity: integer
  ) {
    while (rarity > 0) {
      scene.gameData.dexData[lastSpecies.speciesId].caughtAttr |= this.getShinyRarity(rarity);
      rarity--;
    }
    scene.gameData.starterData[lastSpecies.speciesId].candyCount -= this.unlockShinyPrice(rarity, lastSpecies);
    pokemonCandyCountText.setText(`x${scene.gameData.starterData[lastSpecies.speciesId].candyCount}`);

    uiHandler.setSpecies(lastSpecies);
    uiHandler.updateInstructions();
    uiHandler.setSpeciesDetails(lastSpecies, undefined, undefined, undefined, undefined, undefined, undefined);

    scene.gameData.saveSystem().then((success) => {
      if (!success) {
        return scene.reset(true);
      }
    });
    ui.setMode(Mode.STARTER_SELECT);
    return true;
  }
  protected unlockShinyPrice(rarity: integer, species: PokemonSpecies): integer {
    const basePokemonValue = speciesStarters[species.speciesId] > 3 ? speciesStarters[species.speciesId] + 1 : speciesStarters[species.speciesId];

    const baseCost = 50 - 5 * (basePokemonValue - 1);

    return Math.ceil(Math.round(baseCost * ((1 + rarity) / 2)) * this.candyCostMultiplier);
  }
  protected getShinyRarity(rarity: integer): bigint {
    if (rarity == 3) {
      return DexAttr.VARIANT_3;
    }
    if (rarity == 2) {
      return DexAttr.VARIANT_2;
    }
    return DexAttr.SHINY;
  }
  protected getShinyRarityName(rarity: integer): String {
    if (rarity == 3) {
      return "epic shiny";
    }
    if (rarity == 2) {
      return "rare shiny";
    }
    return "common shiny";
  }

  /**
   * Ability unlock store
   */
  showAbilityUnlock(
    scene: BattleScene,
    ui: UI,
    lastSpecies: PokemonSpecies,
    candyCount: any,
    uiHandler: StarterSelectUiHandler,
    pokemonCandyCountText: Phaser.GameObjects.Text
  ) {
    const options = [];
    const abilityAttr = scene.gameData.starterData[lastSpecies.speciesId].abilityAttr;

    const allAbilityAttr = [];
    switch (lastSpecies.getAbilityCount()) {
    case 2:
      allAbilityAttr.push(AbilityAttr.ABILITY_HIDDEN);
      break;
    case 3:
      allAbilityAttr.push(AbilityAttr.ABILITY_HIDDEN);
      allAbilityAttr.push(AbilityAttr.ABILITY_2);
      break;
    }
    allAbilityAttr.push(AbilityAttr.ABILITY_1);

    const unlockedAbilityAttr = [abilityAttr & AbilityAttr.ABILITY_1, abilityAttr & AbilityAttr.ABILITY_2, abilityAttr & AbilityAttr.ABILITY_HIDDEN].filter(
      (a) => a
    );
    const lockedAbilityAttr = allAbilityAttr.filter((item) => !unlockedAbilityAttr.includes(item));

    for (let abilityIndex = 0; abilityIndex < lastSpecies.getAbilityCount(); abilityIndex++) {
      if (!(abilityAttr & unlockedAbilityAttr[abilityIndex])) {
        const selectedAbility = lockedAbilityAttr.pop();
        options.push({
          label: `x${this.unlockAbilityPrice(selectedAbility, lastSpecies)} Unlock ${this.getAbilityName(selectedAbility, lastSpecies)}`,
          handler: () => {
            if (candyCount >= 0) {
              this.unlockAbility(scene, ui, lastSpecies, uiHandler, pokemonCandyCountText, selectedAbility);
            }
            return false;
          },
          item: "candy",
          itemArgs: starterColors[lastSpecies.speciesId],
        });
      }
    }

    options.push({
      label: i18next.t("menu:cancel"),
      handler: () => {
        ui.setMode(Mode.STARTER_SELECT);
        return true;
      },
    });
    ui.setModeWithoutClear(Mode.OPTION_SELECT, {
      options: options,
      yOffset: 47,
    });
  }
  protected unlockAbility(
    scene: BattleScene,
    ui: UI,
    lastSpecies: PokemonSpecies,
    uiHandler: StarterSelectUiHandler,
    pokemonCandyCountText: Phaser.GameObjects.Text,
    selectedAttr: number
  ) {
    scene.gameData.starterData[lastSpecies.speciesId].abilityAttr = scene.gameData.starterData[lastSpecies.speciesId].abilityAttr | selectedAttr;

    scene.gameData.starterData[lastSpecies.speciesId].candyCount -= this.unlockAbilityPrice(selectedAttr, lastSpecies);
    pokemonCandyCountText.setText(`x${scene.gameData.starterData[lastSpecies.speciesId].candyCount}`);

    uiHandler.setSpecies(lastSpecies);
    uiHandler.updateInstructions();
    uiHandler.setSpeciesDetails(lastSpecies, undefined, undefined, undefined, undefined, undefined, undefined);

    scene.gameData.saveSystem().then((success) => {
      if (!success) {
        return scene.reset(true);
      }
    });
    ui.setMode(Mode.STARTER_SELECT);
    return true;
  }
  protected unlockAbilityPrice(abilityIndex: integer, species: PokemonSpecies): integer {
    const basePokemonValue = speciesStarters[species.speciesId];
    const isHA = abilityIndex == 4 ? 1 : 0;

    const baseCost = 20 - 2.5 * (basePokemonValue - 1);

    return Math.ceil(baseCost * (1 + isHA)) * this.candyCostMultiplier;
  }
  getAbilityName(selectedAbilityIndex: integer, species: PokemonSpecies): String {
    const abilityId = selectedAbilityIndex == 1 ? species.ability1 : selectedAbilityIndex == 2 ? species.ability2 : species.abilityHidden;
    return allAbilities[abilityId].name;
  }

  /**
   * IV improvement store
   */
  showIVsUnlock(
    scene: BattleScene,
    ui: BattleScene["ui"],
    lastSpecies: PokemonSpecies,
    candyCount: any,
    uiHandler: StarterSelectUiHandler,
    pokemonCandyCountText: Phaser.GameObjects.Text
  ) {
    const options = [];

    for (let stat = 0; stat < 6; stat++) {
      if (scene.gameData.dexData[lastSpecies.speciesId].ivs[stat] < 31) {
        options.push({
          label: `x${this.improveIVPrice(lastSpecies)} Improve ${this.getStatName(stat)}`,
          handler: () => {
            if (candyCount >= this.improveIVPrice(lastSpecies)) {
              this.improveIV(scene, ui, lastSpecies, uiHandler, pokemonCandyCountText, stat);
            }
            return false;
          },
          item: "candy",
          itemArgs: starterColors[lastSpecies.speciesId],
        });
      }
    }

    options.push({
      label: i18next.t("menu:cancel"),
      handler: () => {
        ui.setMode(Mode.STARTER_SELECT);
        return true;
      },
    });
    ui.setModeWithoutClear(Mode.OPTION_SELECT, {
      options: options,
      yOffset: 47,
    });
  }
  protected improveIV(
    scene: BattleScene,
    ui: BattleScene["ui"],
    lastSpecies: PokemonSpecies,
    uiHandler: StarterSelectUiHandler,
    pokemonCandyCountText: Phaser.GameObjects.Text,
    stat: number
  ) {
    const IVs = scene.gameData.dexData[lastSpecies.speciesId].ivs;
    IVs[stat] = Math.min(IVs[stat] + 5, 31);

    scene.gameData.updateSpeciesDexIvs(lastSpecies.speciesId, IVs);

    scene.gameData.starterData[lastSpecies.speciesId].candyCount -= this.improveIVPrice(lastSpecies);
    pokemonCandyCountText.setText(`x${scene.gameData.starterData[lastSpecies.speciesId].candyCount}`);

    uiHandler.setSpecies(lastSpecies);
    uiHandler.updateInstructions();
    uiHandler.setSpeciesDetails(lastSpecies, undefined, undefined, undefined, undefined, undefined, undefined);

    scene.gameData.saveSystem().then((success) => {
      if (!success) {
        return scene.reset(true);
      }
    });
    ui.setMode(Mode.STARTER_SELECT);
    return true;
  }
  protected improveIVPrice(species: PokemonSpecies, modifier?: number): integer {
    return Math.round((speciesStarters[species.speciesId] > 5 ? 3 : speciesStarters[species.speciesId] > 3 ? 4 : 5) * this.candyCostMultiplier);
  }
  protected getStatName(statIndex: integer): String {
    return getDataStatName(statIndex as Stat);
  }

  regenerateCompletedPokemon(species: Species, scene: BattleScene): boolean {
    let regen = false;

    if (Utils.randInt(100) <= this.regenPokeChance) {
      const dexEntry = scene.gameData.dexData[getPokemonSpecies(species).getRootSpeciesId()];
      const abilityAttr = scene.gameData.starterData[getPokemonSpecies(species).getRootSpeciesId()].abilityAttr;
      const genderRatio = getPokemonSpecies(species).malePercent;

      const gendersUncaught = !(
        (dexEntry.caughtAttr & DexAttr.MALE && dexEntry.caughtAttr & DexAttr.FEMALE) ||
        genderRatio == null ||
        (genderRatio === 0 && dexEntry.caughtAttr & DexAttr.FEMALE) ||
        (genderRatio === 100 && dexEntry.caughtAttr & DexAttr.MALE)
      );
      const formsUncaught = !!getPokemonSpecies(species)
        .forms.filter((f) => !f.formKey || !pokemonFormChanges[species]?.find((fc) => fc.formKey))
        .map((_, f) => !(dexEntry.caughtAttr & scene.gameData.getFormAttr(f)))
        .filter((f) => f).length;
      const abilitiesUncaught = !!(
        getPokemonSpecies(species).getAbilityCount() -
        [abilityAttr & AbilityAttr.ABILITY_1, abilityAttr & AbilityAttr.ABILITY_2, abilityAttr & AbilityAttr.ABILITY_HIDDEN].filter((a) => a).length
      );

      regen = !(gendersUncaught || formsUncaught || abilitiesUncaught);
    }

    return regen;
  }

  /**
   * Weather UI
   */
  initializeWeatherText(scene: BattleScene): Phaser.GameObjects.Text {
    let weatherText: Phaser.GameObjects.Text;
    weatherText = addTextObject(scene, scene.game.canvas.width / 6 - 2, 0, "", TextStyle.MONEY);
    weatherText.setOrigin(1, 0);

    return weatherText;
  }
  updateWeatherText(scene: BattleScene) {
    if (scene.arena) {
      const weatherType = scene.arena.weather?.weatherType;
      let turnsLeft = scene.arena.weather?.turnsLeft;
      turnsLeft = turnsLeft > 0 ? turnsLeft : null;
      scene.weatherText.setText(`${this.getWeatherName(weatherType)} ${turnsLeft}`);
      if (weatherType == undefined) {
        scene.weatherText.setText("Clear");
      }
    } else {
      scene.weatherText.setText("Clear");
    }

    scene.weatherText.setVisible(true);
  }
  getWeatherName(weatherType: WeatherType): String {
    switch (weatherType) {
    case WeatherType.NONE:
      return "Clear";
    case WeatherType.SUNNY:
      return "Sun";
    case WeatherType.RAIN:
      return "Rain";
    case WeatherType.SANDSTORM:
      return "Sandstorm";
    case WeatherType.HAIL:
      return "Hail";
    case WeatherType.SNOW:
      return "Snow";
    case WeatherType.FOG:
      return "Fog";
    case WeatherType.HEAVY_RAIN:
      return "Heavy Rain";
    case WeatherType.HARSH_SUN:
      return "Harsh Sun";
    case WeatherType.STRONG_WINDS:
      return "Strong Winds";
    }
  }

  /**
   * Pandemic Mode
   */
  setOverridePokerus(value: integer) {
    if (value == 1) {
      this.pokerusPandemic = true;
    } else {
      this.pokerusPandemic = false;
    }
  }
}

export function getBossType(monotype?: Type[]): Type {
  const allTypes = Array.from({ length: 18 }, (_, i) => i);
  if (monotype) {
    const monotypeIndex = Utils.randSeedInt(monotype.length, 0);
    let outputTypes = [];

    for (const t of allTypes) {
      if (Types.getTypeDamageMultiplier(t, monotype[monotypeIndex]) > 1) {
        outputTypes = [...outputTypes, t];
      }
      if (Types.getTypeDamageMultiplier(monotype[monotypeIndex], t) < 1) {
        outputTypes = [...outputTypes, t];
      }
    }
    console.log("getBossType: " + outputTypes);

    const output = Utils.randSeedItem(outputTypes);
    console.log(output);
    return output;
  }

  return  Utils.randSeedItem(allTypes);
}

export function getRandomMonotypeTrainerFunc(trainerPool: (TrainerType | TrainerType[])[]): GetTrainerFunc {
  return (scene: BattleScene) => {
    let party = [];
    for (const pokemon of scene.getParty()) {
      party = [...party, pokemon.species];
    }
    console.log("Generating Gymleader: "+ scene.mods.getMonotype(party));
    const index = getBossType(scene.mods.getMonotype(party));
    const trainerTypes: TrainerType[] = [];
    for (const trainerPoolEntry of trainerPool) {
      const trainerType = Array.isArray(trainerPoolEntry)
        ? Utils.randSeedItem(trainerPoolEntry)
        : trainerPoolEntry;
      trainerTypes.push(trainerType);
    }
    // If the trainer type has a double variant, there's a 33% chance of it being a double battle
    if (trainerConfigs[trainerTypes[index]].trainerTypeDouble) {
      return new Trainer(scene, trainerTypes[index], Utils.randSeedInt(3) ? TrainerVariant.DOUBLE : TrainerVariant.DEFAULT);
    }
    return new Trainer(scene, trainerTypes[index], TrainerVariant.DEFAULT);
  };
}
export function getMonotypeTrainerFunc(trainerPool: TrainerType[][]): GetTrainerFunc {
  return (scene: BattleScene) => {
    let party = [];
    for (const pokemon of scene.getParty()) {
      party = [...party, pokemon.species];
    }
    console.log("Generating Gymleader: "+ scene.mods.getMonotype(party));
    const monotype = scene.mods.getMonotype(party);
    const trainerTypes: TrainerType[] = [];
    for (const trainerPoolEntry of trainerPool[monotype[Utils.randSeedInt(monotype.length)] as number]) {
      const trainerType = trainerPoolEntry;
      trainerTypes.push(trainerType);
    }
    const rand = Utils.randSeedInt(trainerTypes.length);
    console.log("TEST: "+ rand + ", " + trainerTypes.length);
    // If the trainer type has a double variant, there's a 33% chance of it being a double battle
    if (trainerConfigs[trainerTypes[rand]].trainerTypeDouble) {
      return new Trainer(scene, trainerTypes[rand], Utils.randSeedInt(3) ? TrainerVariant.DOUBLE : TrainerVariant.DEFAULT);
    }
    return new Trainer(scene, trainerTypes[rand], TrainerVariant.DEFAULT);
  };
}
type GetTrainerFunc = (scene: BattleScene) => Trainer;
