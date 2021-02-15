// reserved for imports

// input constraints
declare type ValidActorSelectorTypes = 'Token' | 'token' | 'User' | 'user';
// type extensions
type SimpleSpread<L, R> = R & Pick<L, Exclude<keyof L, keyof R>>;
interface TokenUtilities {
  getSelectedTokens(this: TokenUtilities): Array<Token>;
  getSelectedToken(this: TokenUtilities): void | Token;
  getSelectedTokenActor(this: TokenUtilities): void | Actor;
  updateTokenImage: (path: string) => void;
}
interface AbilityScore {
  checkBonus: number;
  dc: number
  mod: number
  prof: number
  proficient: number
  save: number
  saveBonus: number
  value: number
}
interface Abilities {
  cha: AbilityScore;
  con: AbilityScore;
  dex: AbilityScore;
  int: AbilityScore;
  str: AbilityScore;
  Wis: AbilityScore;
}
interface Attributes {
  ac: {value: number};
  death: {success: number, failure: number};
  encumbrance: {value: number, max: number, pct: number, encumbered: boolean};
  exhaustion: number;
  hd: number;
  hp: {value: number, bonus: number, mod: number, prof: number, total: number};
  init: {value: number, bonus: number, mod: number, prof: number, total: number};
  inspiration: boolean;
  movement: {burrow: number, climb: number, fly: number, hover: boolean, swim: number, units: string, walk: number};
  prof: number;
  senses: {darkvision: number, blindsight: number, tremorsense: number, truesight: number, units: string};
  spellcasting: string;
  spelldc: number;
}
interface Bonuses {
  abilities: {check: string, save: string, skill: string};
  msak: {attack: string, damage: string};
  mwak: {attack: string, damage: string};
  rsak: {attack: string, damage: string};
  rwak: {attack: string, damage: string};
  spell: {dc: string};
}
interface Resources {
  primary: {value: null | number, max: null | number, sr: boolean, lr: boolean, label: ''}
  secondary: {value: null | number, max: null | number, sr: boolean, lr: boolean, label: ''}
  tertiary: {value: null | number, max: null | number, sr: boolean, lr: boolean, label: ''}
}
interface ActorData {
  data: {
    data: {
      abilities: Abilities;
      attributes: Attributes;
      bonuses: Bonuses;
      resources: Resources;
      skills: any;
      spells: any;
    }
  }
}
interface ActorInstance extends SimpleSpread<Actor, ActorData> {
  [key: string]: any;
}
// tokens
export const TokenUtils: TokenUtilities = {
  getSelectedTokens: function (this: TokenUtilities) {
    return canvas.tokens.controlled;
  },
  getSelectedToken: function (this: TokenUtilities) {
    if (canvas.tokens.controlled.length !== 1) {
      return ui.notifications.error('More than 1 token is currently selected');
    }
    const [token] = this.getSelectedTokens();
    return token;
  },
  getSelectedTokenActor: function (this: TokenUtilities) {
    const token = this.getSelectedToken();
    if (token) {
      return token?.actor;
    }
  },
  updateTokenImage: async function (imgpath: string) {
    try {
      const token = this.getSelectedToken();
      if (token) {
        return await token.update({ img: imgpath });
      }
    } catch (e) {
      return ui.notifications.error(`An error occurred: ${e}`);
    }
  },
};

// actor
export const getActor = (selector: ValidActorSelectorTypes): ActorInstance | any | null => {
  const selectorLower = selector.toLowerCase();
  const actorArr: Actor[] = [];
  const getUserActor = () => game.user.character;
  const dispatcher = [
    {
      condition: selectorLower === 'token',
      action: TokenUtils.getSelectedTokenActor(),
    },
    {
      condition: selectorLower === 'user',
      action: getUserActor(),
    },
  ];
  dispatcher.forEach((scenario) => {
    if (scenario.condition && scenario.action !== null && scenario.action !== undefined) {
      actorArr.push(scenario.action);
    }
  });
  const [actor] = actorArr;
  return (actor) || null;
};

export const ActorUtils = (fn: 'getAbilityScores' | 'getAttributes' | 'getBonuses' | 'getResources' | 'getSkills' | 'getSpells'): ActorData | null => {
  const thisActor = getActor('user') ?? null;
  if (thisActor === null || thisActor === undefined) {
    ui.notifications.error('No Actor is currently defined for current user.');
    return null;
  } else {
    const actorData = {
      getAbilityScores: (): Abilities => thisActor.data.data.abilities,
      getAttributes: (): Attributes => thisActor.data.data.attributes,
      getBonuses: (): Bonuses => thisActor.data.data.bonuses,
      getResources: (): Resources => thisActor.data.data.resources,
      getSkills: (): any => thisActor.data.data.skills,
      getSpells: (): any => thisActor.data.data.spells,
    };
    return actorData[fn]();
  }
};

// user
interface CharUser extends User {
  charname: string;
}
interface UserData {
  name: () => string;
  charname: () => string;
  id: () => string;
  data: () => any;
  actor: () => Actor;
  isActive: () => boolean;
  isGM: () => boolean;
  targets: () => Set<Token>;
}

export const UserUtils: UserData = {
  name: () => game.user.name,
  charname: () => (game.user as CharUser).charname,
  id: () => game.user.id,
  data: () => game.user.data,
  actor: () => game.user.character,
  isActive: () => game.user.active,
  isGM: () => game.user.isGM,
  targets: () => game.user.targets,
};

// Active Effects

const getPlayerCharacters = () => {
  const playerTable: ActorInstance|Actor[] = [];
  canvas.tokens.placeables.forEach((token: Token) => {
    if (token.actor === null) {
      return;
    }
    const actor = game.actors.get(token.actor.data._id);
    if (actor.hasPlayerOwner) {
      playerTable.push(actor);
    }
  });
  return playerTable;
};

const checkEffectById = (actorId: string, effectId: string): boolean => {
  const players = getPlayerCharacters();
  const matched: string[] = [];
  players.forEach((char) => char.effects.forEach((_, key) => {
    if (key === effectId) {
      matched.push(char.id);
    }
  }));
  return !!(matched.includes(actorId));
};

const checkRange = (t1: Token, t2: Token): number => {
  const extractCoords = (token: Token) => {
    const x: number = token.data.x;
    const y: number = token.data.y;
    return {
      x: x,
      y: y,
    };
  };
  const { x: x1, y: y1 } = extractCoords(t1);
  const { x: x2, y: y2 } = extractCoords(t2);
  const xDist = Math.abs(x1 - x2);
  const yDist = Math.abs(y1 - y2);
  const dist = Math.max(xDist, yDist);
  return dist / canvas.scene.data.grid * canvas.scene.data.gridDistance;
};

const createActiveEffect = (actor: ActorInstance, name: string, keyPath: string, value: number) => {
  const activeEffect = actor.effects.find(i => i.data.label === name);
  if (activeEffect !== null) {
    const changes = activeEffect.data.changes;
    changes[0].value = value;
    activeEffect.update({ changes });
  } else {
    const effectData = {
      label: name,
      icon: '',
      changes: [{
        key: keyPath,
        mode: 2,
        value: value,
        priority: '20'
      }]
    };
    actor.createEmbeddedEntity('ActiveEffect', effectData);
  }
};

function updateActor() {
  const playerTable = getPlayerCharacters();
  for (let i = 0; i < playerTable.length; i++) {
    const actor2 = playerTable[i][0];
    let token2 = playerTable[i][1];
    let save = newSave(actor2, playerTable)
    let actor = game.actors.get(actor2._id)
    console.log("Aura update")
    createActiveEffect(actor, save)
  }
  return;
}

Hooks.on("updateToken", (scene, token, update, flags, id) => {
  let movement = getProperty(update, "x") || getProperty(update, "y");
  if (movement !== undefined) {
    updateActor();
  }
})