// reserved for imports

export declare type ValidSelectorTypes = 'Token' | 'User' | 'Macro';

export const getSelectedTokens = (): Token[] => (canvas.tokens.controlled.length === 0) ? ui.notifications.warn('No token is currently selected') : canvas.tokens.controlled;
export const getSelectedToken = (): Token => {
  const tokenArr = getSelectedTokens();
  if (tokenArr.length > 1) {
    ui.notifications.warn('More than 1 target is currently selected');
  }
  const [token] = tokenArr;
  return token;
}
const getSelectedTokenProp = (prop: keyof Token) => getSelectedToken()[prop];
const currentUser = game.user;
const currentChar = getSelectedTokenProp('name')

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

const getActor = (selector: ValidSelectorTypes) => {
  if (selector === 'Token') {
    return getSelectedToken().actor;
  }
  if (selector === 'User') {
    return UserUtils.actor;
  }
  if (selector === 'Macro') {
    // TODO: scope path scoping so TS doesn't yell errors at me
    const allMacros = game.macros.apps[0].macros.filter(macroSlot => macroSlot.macro !== null).map(macro => macro.macro);
    const visibleMacros = allMacros.filter(macro => macro.visible === true);
    const uniqueIds = new Set(...[visibleMacros.map(macro => macro.data.author)]);
    const allUsers = [...game.users]
    return allUsers.filter(user => [...uniqueIds].includes(user.data.id));
  }
}

