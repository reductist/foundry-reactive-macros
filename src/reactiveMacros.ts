/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: P. von Rickenbach
 * Software License: MIT License
 */

// Import TypeScript modules
import { registerSettings } from 'src/module/settings';
import { preloadTemplates } from './module/preloadTemplates.js';

/* ------------------------------------ */
/* Initialize module                    */
/* ------------------------------------ */
Hooks.once('init', async function() {
  console.log('reactive-macros | Initializing reactive-macros');

  // Assign custom classes and constants here


  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();

  // Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup module             */
/* ------------------------------------ */
Hooks.once('setup', function() {
  // Do anything after initialization but before
  // ready
});

/* ------------------------------------ */
/* When ready             */
/* ------------------------------------ */
Hooks.once('ready', function() {
  // Do anything once the module is ready
});

// Add any additional hooks if necessary
