export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to "modules/reactive-macros/templates"
	];

	return loadTemplates(templatePaths);
}
