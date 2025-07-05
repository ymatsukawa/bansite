/**
 * Application constants
 */

export const MESSAGE_TYPES = {
  UPDATE_RULES: 'updateRules',
  ADD_BANNED_URL: 'addBannedUrl',
  REMOVE_BANNED_URL: 'removeBannedUrl',
  GET_BANNED_URLS: 'getBannedUrls',
  TOGGLE_BAN_LIST_EDITOR: 'toggleBanListEditor'
};

export const STORAGE_KEYS = {
  BANNED_URLS: 'bannedUrls'
};

export const RULE_CONFIG = {
  PRIORITY: 1,
  RESOURCE_TYPES: ['main_frame'],
  BLOCKED_PAGE_PATH: '/blocked.html'
};

export const UI_CONFIG = {
  EDITOR_Z_INDEX: 2147483647,
  EDITOR_WIDTH: '350px',
  EDITOR_MAX_HEIGHT: '500px'
};

export const ERROR_MESSAGES = {
  URL_ALREADY_BANNED: 'URL already banned',
  URL_NOT_FOUND: 'URL not found',
  UNKNOWN_ERROR: 'Unknown error',
  CONTENT_SCRIPT_NOT_AVAILABLE: 'Content script not available'
};