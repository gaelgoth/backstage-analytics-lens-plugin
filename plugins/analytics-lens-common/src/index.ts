/**
 * Common functionalities for the analytics-lens plugin.
 *
 * @packageDocumentation
 */

/**
 * The storage key used to store the analytics lens session ID in the window session storage.
 * @public
 */
export const WINDOW_SESSION_ID_STORAGE_KEY = 'analytics-lens.sessionId';

export type { EventPayload } from './schema/openapi';

export * from './schema/openapi';
