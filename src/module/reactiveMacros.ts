// reserved for imports

// input constraints
declare type ValidSelectorTypes = 'Token' | 'User' | 'Macro';
declare type ValidActorTypes = 'Token' | 'User';


// token
const GenericActor = (function<T>(arg: new (...args: any[])=> T) : T{ return null as any})(Actor);
const GenericToken = (function<T>(arg: new (...args: any[])=> T) : T{ return null as any})(Token);
interface GenericToken {
  actor: typeof GenericActor;
}
interface TokenUtilities {
  getSelectedTokens(this: TokenUtilities): () => Array<typeof GenericToken>,
  getSelectedToken(this: TokenUtilities): () => typeof GenericToken,
  getSelectedTokenActor(this: TokenUtilities): () => typeof GenericActor,
  updateTokenImage: (path:string) => void, 
};
const updateTokenImage = async (path: string): Promise<void> => await canvas.tokens.controlled[0].update({ img: path });
export const TokenUtils: TokenUtilities = {
  getSelectedTokens: function (this: TokenUtilities) {
    return canvas.tokens.controlled;
  },
  getSelectedToken: function (this: TokenUtilities) {
    if (canvas.tokens.controlled.length !== 1) {
      return ui.notifications.error('More than 1 token is currently selected')
    }
    return canvas.token.controlled[0]['actor'];
  },
  getSelectedTokenActor: function (this: TokenUtilities) {
    return canvas.tokens.controlled[0]['actor'];
  },
  updateTokenImage: function (imgpath: string) {
    try {
      updateTokenImage(imgpath);
    } catch(e) {
      ui.notifications.error(`An error occurred: ${e}`);
    }
  }
}

// user
export const UserUtils = {
  user: () => game.user,
  name: () => game.user.name,
  id: () => game.user.id,
  data: () => game.user.data,
  actor: () => game.user.character,
  isActive: () => game.user.active,
  isGM: () => game.user.isGM,
  targets: () => game.user.targets,
};


// actor
export const getActor = (selector: ValidActorTypes) => {
  const selectorLower = selector.toLowerCase();
  const actorArr: Actor[] = [];
  const dispatcher = [
    {
      condition: (selectorLower === 'token'),
      action: canvas.tokens.controlled[0],
    },
    {
      condition: (selectorLower === 'user'),
      action: UserUtils.actor(),
    }
  ];
  dispatcher.forEach((scenario) => {
    if (scenario.condition) {
      actorArr.push(scenario.action);
    }
  });
  const [actor] = actorArr;
  return actor;
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