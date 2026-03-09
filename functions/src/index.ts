import { validateEnv } from './config/env';

// ─── Validate environment on cold start ───
validateEnv();

// ─── Auth Functions ───
export { createUserProfile } from './functions/auth';

// ─── Muse (Avatar) Functions ───
export { createMuseFromPhoto } from './functions/muse';

// ─── Poem Functions ───
export { generatePoem } from './functions/poem';

// ─── Audio Functions ───
export { synthesizePoemAudio } from './functions/audio';

// ─── Video Functions ───
export { generateVideo } from './functions/video';

// ─── Living Page Functions ───
export { createLivingPage } from './functions/livingPage';

// ─── Gallery Functions ───
export { searchLivingPages, togglePageVisibility } from './functions/gallery';

// ─── Export Functions ───
export { createVideoExport, createPDFExport } from './functions/export';

// ─── Collection Functions ───
export { createCollection, addPageToCollection } from './functions/collection';

// ─── Webhooks ───
export { aiWebhook } from './functions/webhooks';

// ─── Monitoring & Dashboard ───
export { getUserDashboard } from './functions/dashboard';
