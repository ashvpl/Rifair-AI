try {
  const constants = require('next/dist/shared/lib/constants');
  console.log('Successfully loaded constants:', Object.keys(constants).slice(0, 5));
} catch (e) {
  console.error('Failed to load constants:', e.message);
  console.error('Stack:', e.stack);
}
