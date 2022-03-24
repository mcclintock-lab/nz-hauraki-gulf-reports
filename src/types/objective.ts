//// BASE CLASSIFICATION ////

/** Unique string ID for classification given to sketches (e.g. zone classification, protection level) */
export type ClassificationId = string;

//// RBCS PROTECTION LEVELS ////

export const FULLY_PROTECTED_LEVEL = "Fully Protected Area";
export const HIGHLY_PROTECTED_LEVEL = "Highly Protected Area";
export const MODERATELY_PROTECTED_LEVEL = "Moderately Protected Area";
export const POORLY_PROTECTED_LEVEL = "Poorly Protected Area";
export const UNPROTECTED_LEVEL = "Unprotected Area";

export const rbcsMpaProtectionLevels = [
  FULLY_PROTECTED_LEVEL,
  HIGHLY_PROTECTED_LEVEL,
  MODERATELY_PROTECTED_LEVEL,
  POORLY_PROTECTED_LEVEL,
  UNPROTECTED_LEVEL,
] as const;

export type RbcsMpaProtectionLevel = typeof rbcsMpaProtectionLevels[number];

//// BASE OBJECTIVE ////

export const OBJECTIVE_YES = "yes";
export const OBJECTIVE_NO = "no";
export const OBJECTIVE_MAYBE = "maybe";

export const OBJECTIVE_GREEN = "#BEE4BE";
export const OBJECTIVE_YELLOW = "#FFE1A3";
export const OBJECTIVE_RED = "#F7A6B4";

/** Object mapping answers for whether sketch counts toward objective to stop light colors - green / yellow / red */
export const objectiveCountsColorMap = {
  OBJECTIVE_YES: OBJECTIVE_GREEN,
  OBJECTIVE_MAYBE: OBJECTIVE_YELLOW,
  OBJECTIVE_NO: OBJECTIVE_RED,
};

/** Readonly list of possible answers for whether sketch counts toward objective */
export const objectiveCountsAnswers = [
  OBJECTIVE_YES,
  OBJECTIVE_NO,
  OBJECTIVE_MAYBE,
] as const;

/** Unique name of objective */
export type ObjectiveId = string;

/** Range of possible answers for whether a classification counts towards or meets an objective */
export type ObjectiveAnswer = typeof objectiveCountsAnswers[number];

/**
 * Generic type for mapping classification ID to whether it counds toward or meets an objective
 * Specific classification systems will extend this type with short list of allowed classification IDs
 */
export type ObjectiveAnswerMap = Record<ClassificationId, ObjectiveAnswer>;

/**
 * Generic type for group of objectives
 */
export type ObjectiveGroup = Record<ObjectiveId, RbcsObjective>;

//// RBCS OBJECTIVE ////

/**
 * Mapping of RBCS MPA Classification ID to whether it counts toward or meets an objective
 */
export type RbcsMpaObjectiveAnswerMap = Record<
  RbcsMpaProtectionLevel,
  ObjectiveAnswer
>;
export interface RbcsObjective {
  /** Unique identifier for objective */
  id: ObjectiveId;
  /** Value required for objective to be met */
  target: number;
  /** Map of MPA protection levels to whether they count towards objective */
  countsToward: RbcsMpaObjectiveAnswerMap;
  shortDesc: string;
}

/**
 * Type guard for checking string is one of supported objective IDs
 * Use in conditional block logic to coerce to type RbcsObjectiveKey within the block
 */
export function isRbcsProtectionLevel(
  key: string
): key is RbcsMpaProtectionLevel {
  return rbcsMpaProtectionLevels.includes(key as RbcsMpaProtectionLevel);
}
