/**
 * Centralized condition and severity constants
 * Shared between Node backend, Flask AI server, and frontend
 */

export const CONDITIONS = {
    ALOPECIA_AREATA: "Alopecia Areata",
    CONTACT_DERMATITIS: "Contact Dermatitis",
    FOLLICULITIS: "Folliculitis",
    HEAD_LICE: "Head Lice",
    HEALTHY: "Healthy",
    LICHEN_PLANUS: "Lichen Planus",
    MALE_PATTERN_BALDNESS: "Male Pattern Baldness",
    PSORIASIS: "Psoriasis",
    SEBORRHEIC_DERMATITIS: "Seborrheic Dermatitis",
    TELOGEN_EFFLUVIUM: "Telogen Effluvium",
    TINEA_CAPITIS: "Tinea Capitis",
};

export const SEVERITY_LEVELS = ["healthy", "mild", "moderate", "severe"];

/**
 * Mapping of condition names to severity (as fallback if AI doesn't provide)
 */
export const CONDITION_SEVERITY = {
    [CONDITIONS.ALOPECIA_AREATA]: "moderate",
    [CONDITIONS.CONTACT_DERMATITIS]: "mild",
    [CONDITIONS.FOLLICULITIS]: "moderate",
    [CONDITIONS.HEAD_LICE]: "mild",
    [CONDITIONS.HEALTHY]: "healthy",
    [CONDITIONS.LICHEN_PLANUS]: "moderate",
    [CONDITIONS.MALE_PATTERN_BALDNESS]: "severe",
    [CONDITIONS.PSORIASIS]: "severe",
    [CONDITIONS.SEBORRHEIC_DERMATITIS]: "mild",
    [CONDITIONS.TELOGEN_EFFLUVIUM]: "moderate",
    [CONDITIONS.TINEA_CAPITIS]: "moderate",
};

/**
 * Validate if condition name is recognized
 */
export const isValidCondition = (name) => {
    return Object.values(CONDITIONS).includes(name);
};

/**
 * Validate if severity level is recognized
 */
export const isValidSeverity = (severity) => {
    return SEVERITY_LEVELS.includes(severity);
};

/**
 * Get all condition names as array
 */
export const getAllConditions = () => {
    return Object.values(CONDITIONS);
};