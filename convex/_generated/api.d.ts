/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as checkins from "../checkins.js";
import type * as feedback from "../feedback.js";
import type * as ideas from "../ideas.js";
import type * as judges from "../judges.js";
import type * as participants from "../participants.js";
import type * as speakers from "../speakers.js";
import type * as superadmins from "../superadmins.js";
import type * as volunteers from "../volunteers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  checkins: typeof checkins;
  feedback: typeof feedback;
  ideas: typeof ideas;
  judges: typeof judges;
  participants: typeof participants;
  speakers: typeof speakers;
  superadmins: typeof superadmins;
  volunteers: typeof volunteers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
