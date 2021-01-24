// reserved for imports

// input constraints
declare type ValidActorSelectorTypes = 'Token' | 'token' | 'User' | 'user';

// tokens
interface TokenUtilities {
  getSelectedTokens(this: TokenUtilities): Array<Token>;
  getSelectedToken(this: TokenUtilities): void | Token;
  getSelectedTokenActor(this: TokenUtilities): void | Actor;
  updateTokenImage: (path: string) => void;
}

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
export const getActor = (selector: ValidActorSelectorTypes): Actor => {
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
  return actor;
};

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
export const ActorUtils = {
  getAbilityScores: (): Abilities => getActor('user').data.data.abilities,
  getAttributes: (): Attributes => getActor('user').data.data.attributes,
  getBonuses: (): Bonuses => getActor('user').data.data.bonuses,
  getResources: (): Resources => getActor('user').data.data.resources,
  getSkills: (): any => getActor('user').data.data.skills,
  getSpells: (): any => getActor('user').data.data.spells,
};

// user
interface CharUser extends User {
  charname: string;
}
interface UserData {
  name: () => string;
  charname: () => string;
  id: () => string;
  data: () => EntityData;
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

// macros

interface HotbarMacro extends Macro {
  cssClass: string;
  icon: string;
  key: number;
  slot: number;
  macro: any;
  [key: string]: unknown;
}
interface Hotbar {
  macros: Macro[];
}

const getHotbarMacros = (): Macro[] => {
  const test = (m: { macro: { visible: boolean; } | null; }) => m.macro !== null && m.macro.visible === true;
  const [hb, ] = (game.macros.apps) as unknown as Hotbar[];
  const macros: HotbarMacro[] = hb.macros as HotbarMacro[];
  return macros.filter(test);
};

export const MacroUtils = {
  getHotbarMacros,
};

interface MacroParamObject {
  slot: number;
  macroNumber: number;
  name: string;
  condition: boolean;
}

const macroProxy = (macroPage: number, macroNumber: number) => {
  const dataPath = UserUtils.actor().data.data.attributes.hp;
  const trigger = 5;
  const adjustedNumber = macroNumber - 1;
  const selector = document.getElementById('macro-list');
  const handler = {
    get (target, key) {
      if (key === 'isProxy') {
        return true;
      }
      const prop = target[key];
      if (typeof prop === 'undefined') {
        return;
      }
      if (!prop.isProxy && typeof prop === 'object') {
        target[key] = new Proxy(prop, handler);
      }
      return target[key];
    },
    set (target, key, value) {
      target[key] = value;
      if (value <= trigger) {
        selector?.children[macroNumber].click();
        console.log('Setting', target, `.${key} to equal`, value);
        return true;
      }
    }
  };
  return new Proxy(dataPath, handler);
};

async function createHotbarMacro ({ slot, macroNumber, name, condition }: MacroParamObject): Promise<void> {
  const command = `game.user.getHotbarMacros()[${macroNumber}].macro.execute()`;
  // eslint-disable-next-line
  const macroName = name || `_${UserUtils.charname()}`;
  const macro = await Macro.create({
    name: macroName,
    type: 'script',
    command: command,
    flags: { 'dnd5e.itemMacro': true }
  }, { displaySheet: true });
  const assignMacro = async (macro: PromiseLike<Macro>) => await macro.then(
    m => game.user.assignHotbarMacro(m, slot)
  );
}

// TODO: this use case doesn't make sense here but move to Macro section
// if (selector === 'Macro') {
//   // TODO: scope path scoping so TS doesn't yell errors at me
//   const allMacros = game.macros.apps[0].macros.filter(macroSlot => macroSlot.macro !== null).map(macro => macro.macro);
//   const visibleMacros = allMacros.filter(macro => macro.visible === true);
//   const uniqueIds = new Set(...[visibleMacros.map(macro => macro.data.author)]);
//   const allUsers = [...game.users]
//   return allUsers.filter(user => [...uniqueIds].includes(user.data.id));
// }

// dialog
export const rmDialog = new Dialog({
  title: 'Reactive Macros',
  content: '<p>Select macro(s) to auto-trigger and a corresponding trigger condition</p>',
  buttons: {
    one: {
      icon: '<i class="fas fa-check"></i>',
      label: 'Option One',
      callback: () => console.log('Chose One')
    },
    two: {
      icon: '<i class="fas fa-times"></i>',
      label: 'Option Two',
      callback: () => console.log('Chose Two')
    }
  },
  default: 'two',
  close: (html: HTMLElement | JQuery<HTMLElement>) => console.log(`This always is logged no matter which option is chosen ${html}`)
}).render(true);
