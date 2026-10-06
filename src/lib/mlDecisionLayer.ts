/**
 * BloomPath ML Decision Layer
 * Classifies users into:
 * - "job-ready"         → Show regular job recommendations
 * - "needs-training"    → Recommend NGO training modules first
 * - "shg-suitable"      → Show community SHG microjobs
 *
 * Uses real-time analysis of user's skills, education, location,
 * constraints, training completions, and job preferences.
 */

export type MLClassification = "job-ready" | "needs-training" | "shg-suitable";

export interface UserMLProfile {
  skills: string[];
  education_level: "basic" | "intermediate" | "advanced" | null;
  is_verified: boolean;
  has_location: boolean;
  completed_trainings: number;
  skill_score_boost: number; // total score from NGO training
  location_name?: string | null;
  preferred_work_type?: "remote" | "onsite" | "any";
  has_internet?: boolean;
  has_smartphone?: boolean;
  family_constraints?: boolean;
  avg_available_hours_per_day?: number;
}

export interface MLResult {
  classification: MLClassification;
  confidence: number; // 0-100
  reasoning: string[];
  recommended_action: string;
  score_breakdown: {
    skill_score: number;
    readiness_score: number;
    constraint_score: number;
    training_score: number;
  };
  suggested_modules?: string[];
  suggested_categories?: string[];
}

/**
 * Core ML classification function
 * Analyzes user profile and returns classification with confidence scores
 */
export const classifyUser = (userProfile: UserMLProfile): MLResult => {
  const reasoning: string[] = [];
  let skill_score = 0;
  let readiness_score = 0;
  let constraint_score = 0;
  let training_score = 0;

  // ─── Skill Score (0-40) ───────────────────────────────────────────────────
  const skillCount = userProfile.skills?.length || 0;
  
  if (skillCount === 0) {
    skill_score = 0;
    reasoning.push("No skills listed — needs initial skill assessment");
  } else if (skillCount <= 2) {
    skill_score = 10;
    reasoning.push(`Only ${skillCount} skill(s) — limited job options available`);
  } else if (skillCount <= 4) {
    skill_score = 25;
    reasoning.push(`${skillCount} skills — moderate skill base`);
  } else {
    skill_score = 40;
    reasoning.push(`${skillCount} skills — good skill diversity`);
  }

  // Bonus for digital skills
  const digitalSkills = ["Data Entry", "Content Writing", "Social Media", "Graphic Design", "Web Development", "Video Editing"];
  const hasDigital = userProfile.skills?.some(s => digitalSkills.some(d => d.toLowerCase() === s.toLowerCase()));
  if (hasDigital) {
    skill_score = Math.min(40, skill_score + 8);
    reasoning.push("Has digital skills — bonus points");
  }

  // Bonus for marketable craft skills
  const craftSkills = ["Tailoring", "Embroidery", "Handicrafts", "Stitching", "Mehendi Art"];
  const hasCraft = userProfile.skills?.some(s => craftSkills.some(c => c.toLowerCase() === s.toLowerCase()));
  if (hasCraft) {
    reasoning.push("Has craft skills — suitable for SHG/microjobs");
  }

  // ─── Readiness Score (0-30) ───────────────────────────────────────────────
  if (userProfile.is_verified) {
    readiness_score += 15;
    reasoning.push("Verified identity — job applications accepted");
  } else {
    reasoning.push("Identity not verified — cannot apply to formal jobs yet");
  }

  const educationMap = { basic: 5, intermediate: 10, advanced: 15 };
  readiness_score += educationMap[userProfile.education_level || "basic"];

  if (userProfile.has_location) {
    readiness_score += 5;
  }

  // ─── Constraint Score (0-20) ──────────────────────────────────────────────
  // Higher constraint = more suitable for home-based/SHG work
  if (userProfile.family_constraints) {
    constraint_score += 10;
    reasoning.push("Family constraints — prefers flexible/home-based work");
  }

  const hoursAvailable = userProfile.avg_available_hours_per_day || 6;
  if (hoursAvailable < 4) {
    constraint_score += 10;
    reasoning.push("Limited hours available — suitable for part-time/microjobs");
  } else if (hoursAvailable < 6) {
    constraint_score += 5;
  }

  // ─── Training Score (0-10) ────────────────────────────────────────────────
  if (userProfile.completed_trainings > 0) {
    training_score = Math.min(10, userProfile.completed_trainings * 3);
    reasoning.push(`Completed ${userProfile.completed_trainings} NGO training module(s)`);
  }
  training_score += Math.min(5, Math.floor(userProfile.skill_score_boost / 10));

  // ─── Total Score & Classification ─────────────────────────────────────────
  const total = skill_score + readiness_score + constraint_score + training_score;

  let classification: MLClassification;
  let confidence: number;
  let recommended_action: string;
  let suggested_modules: string[] = [];
  let suggested_categories: string[] = [];

  if (skillCount === 0 || (!userProfile.is_verified && skill_score < 10) || total < 20) {
    // Very low readiness → Needs Training
    classification = "needs-training";
    confidence = Math.min(95, 95 - total);
    recommended_action = "Complete free NGO training modules to build skills and boost your profile";
    suggested_modules = ["Smartphone Basics for Earning", "Financial Literacy & Savings", "Online Safety & Digital Rights"];
    reasoning.push("→ CLASSIFIED: Needs Training (low skill/readiness score)");

  } else if (
    hasCraft ||
    (userProfile.family_constraints && hoursAvailable < 6) ||
    (constraint_score >= 15 && skill_score <= 25)
  ) {
    // Has craft skills or high constraints → SHG Suitable
    classification = "shg-suitable";
    confidence = Math.min(90, 40 + constraint_score + (hasCraft ? 20 : 0));
    recommended_action = "Home-based SHG microjobs match your skills and schedule perfectly";
    suggested_categories = ["Stitching & Tailoring", "Embroidery & Needlework", "Food Processing", "Craftwork & Handicrafts"];
    reasoning.push("→ CLASSIFIED: SHG Suitable (craft skills + home constraints)");

  } else if (total >= 50 && userProfile.is_verified) {
    // High score, verified → Job Ready
    classification = "job-ready";
    confidence = Math.min(95, total + 5);
    recommended_action = "You're job-ready! Browse personalized job recommendations";
    reasoning.push("→ CLASSIFIED: Job Ready (high score, verified)");

  } else if (total >= 30) {
    // Moderate score
    if (hasCraft || constraint_score > 5) {
      classification = "shg-suitable";
      confidence = 60;
      recommended_action = "SHG microjobs are a great starting point — build experience and move up";
      suggested_categories = ["Stitching & Tailoring", "Packaging & Assembly"];
      reasoning.push("→ CLASSIFIED: SHG Suitable (moderate score, craft/constraints)");
    } else {
      classification = "job-ready";
      confidence = 65;
      recommended_action = "You qualify for entry-level jobs. Completing training will unlock more opportunities";
      reasoning.push("→ CLASSIFIED: Job Ready (moderate score, no major constraints)");
    }
  } else {
    // Low score but has some skills → Needs training first
    classification = "needs-training";
    confidence = 70;
    recommended_action = "A few training modules will significantly improve your job matches";
    suggested_modules = ["Digital Literacy", "Livelihood Skills", "Workplace Safety & Legal Rights"];
    reasoning.push("→ CLASSIFIED: Needs Training (insufficient readiness)");
  }

  return {
    classification,
    confidence,
    reasoning,
    recommended_action,
    score_breakdown: { skill_score, readiness_score, constraint_score, training_score },
    suggested_modules,
    suggested_categories,
  };
};

/**
 * Get routing recommendation based on ML classification
 */
export const getRoutingInfo = (classification: MLClassification) => {
  const routes = {
    "job-ready": {
      route: "/jobs",
      label: "View Jobs",
      description: "Regular job recommendations",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
    },
    "needs-training": {
      route: "/ngo-portal",
      label: "Start Training",
      description: "Free NGO training modules",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
    },
    "shg-suitable": {
      route: "/shg-portal",
      label: "View SHG Jobs",
      description: "Community home-based microjobs",
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/30",
    },
  };
  return routes[classification];
};

/**
 * Calculate overall skill score for display
 */
export const calculateDisplayScore = (profile: UserMLProfile): number => {
  const base = (profile.skills?.length || 0) * 5;
  const edu = { basic: 10, intermediate: 20, advanced: 30 }[profile.education_level || "basic"];
  const verified = profile.is_verified ? 15 : 0;
  const training = profile.skill_score_boost;
  return Math.min(100, base + edu + verified + training);
};
