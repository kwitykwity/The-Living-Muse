"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDashboard = exports.addPageToCollection = exports.createCollection = exports.createPDFExport = exports.createVideoExport = exports.togglePageVisibility = exports.searchLivingPages = exports.createLivingPage = exports.generateVideo = exports.synthesizePoemAudio = exports.generatePoem = exports.createMuseFromPhoto = exports.createUserProfile = void 0;
const env_1 = require("./config/env");
// ─── Validate environment on cold start ───
(0, env_1.validateEnv)();
// ─── Auth Functions ───
var auth_1 = require("./functions/auth");
Object.defineProperty(exports, "createUserProfile", { enumerable: true, get: function () { return auth_1.createUserProfile; } });
// ─── Muse (Avatar) Functions ───
var muse_1 = require("./functions/muse");
Object.defineProperty(exports, "createMuseFromPhoto", { enumerable: true, get: function () { return muse_1.createMuseFromPhoto; } });
// ─── Poem Functions ───
var poem_1 = require("./functions/poem");
Object.defineProperty(exports, "generatePoem", { enumerable: true, get: function () { return poem_1.generatePoem; } });
// ─── Audio Functions ───
var audio_1 = require("./functions/audio");
Object.defineProperty(exports, "synthesizePoemAudio", { enumerable: true, get: function () { return audio_1.synthesizePoemAudio; } });
// ─── Video Functions ───
var video_1 = require("./functions/video");
Object.defineProperty(exports, "generateVideo", { enumerable: true, get: function () { return video_1.generateVideo; } });
// ─── Living Page Functions ───
var livingPage_1 = require("./functions/livingPage");
Object.defineProperty(exports, "createLivingPage", { enumerable: true, get: function () { return livingPage_1.createLivingPage; } });
// ─── Gallery Functions ───
var gallery_1 = require("./functions/gallery");
Object.defineProperty(exports, "searchLivingPages", { enumerable: true, get: function () { return gallery_1.searchLivingPages; } });
Object.defineProperty(exports, "togglePageVisibility", { enumerable: true, get: function () { return gallery_1.togglePageVisibility; } });
// ─── Export Functions ───
var export_1 = require("./functions/export");
Object.defineProperty(exports, "createVideoExport", { enumerable: true, get: function () { return export_1.createVideoExport; } });
Object.defineProperty(exports, "createPDFExport", { enumerable: true, get: function () { return export_1.createPDFExport; } });
// ─── Collection Functions ───
var collection_1 = require("./functions/collection");
Object.defineProperty(exports, "createCollection", { enumerable: true, get: function () { return collection_1.createCollection; } });
Object.defineProperty(exports, "addPageToCollection", { enumerable: true, get: function () { return collection_1.addPageToCollection; } });
// ─── Monitoring & Dashboard ───
var dashboard_1 = require("./functions/dashboard");
Object.defineProperty(exports, "getUserDashboard", { enumerable: true, get: function () { return dashboard_1.getUserDashboard; } });
//# sourceMappingURL=index.js.map