// reserved for imports

// input constraints
declare type ValidSelectorTypes = 'Token' | 'User' | 'Macro';
declare type ValidActorTypes = 'Token' | 'User';

// token
type SelectedToken = InstanceType<typeof Token>;
interface TokenUtilities {
  getSelectedTokens(this: TokenUtilities): () => Array<SelectedToken>,
  getSelectedToken(this: TokenUtilities): () => SelectedToken,
};
export const TokenUtils: TokenUtilities = {
  getSelectedTokens: function (this: TokenUtilities) {
    return canvas.tokens.controlled;
  },
  getSelectedToken: function (this: TokenUtilities) {
    const tokenArr = this.getSelectedTokens();
    if (tokenArr.length === 1 && Array.isArray(tokenArr)) {
      const [token] = tokenArr;
      return token;
    }
  },
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
const getActor = (selector: ValidActorTypes) => {
  const dispatcher = [
    {
      condition: (selector === 'Token'),
      action: getSelectedToken().actor,
    },
    {
      condition: (selector === 'User'),
      action: UserUtils.actor,
    }
  ];
  dispatcher.forEach((scenario) => {
    if (scenario.condition) {
      return scenario.action;
    }
  });
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