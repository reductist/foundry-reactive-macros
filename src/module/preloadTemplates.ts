export const preloadTemplates = async (): Promise<void> => {
	const templatePaths: Array<string> = [
		// Add paths to "modules/reactive-macros/templates"
	];
	return loadTemplates(templatePaths);
}
