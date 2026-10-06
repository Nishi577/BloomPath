import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Users,
  BookOpen,
  Briefcase,
  ChevronRight,
  RefreshCw,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  classifyUser,
  getRoutingInfo,
  calculateDisplayScore,
  type UserMLProfile,
  type MLResult,
} from "@/lib/mlDecisionLayer";

interface MLSmartDashboardProps {
  profile: {
    skills?: string[];
    education_level?: "basic" | "intermediate" | "advanced" | null;
    is_verified?: boolean;
    latitude?: number | null;
    longitude?: number | null;
    location_name?: string | null;
  } | null;
  completedTrainings?: number;
  skillScoreBoost?: number;
  compact?: boolean;
}

const classificationLabels = {
  "job-ready": "Job Ready",
  "needs-training": "Needs Training",
  "shg-suitable": "SHG Suitable",
};

const classificationIcons = {
  "job-ready": Briefcase,
  "needs-training": BookOpen,
  "shg-suitable": Users,
};

const MLSmartDashboard = ({
  profile,
  completedTrainings = 0,
  skillScoreBoost = 0,
  compact = false,
}: MLSmartDashboardProps) => {
  const navigate = useNavigate();
  const [result, setResult] = useState<MLResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (profile) {
      runAnalysis();
    }
  }, [profile, completedTrainings, skillScoreBoost]);

  const runAnalysis = () => {
    setAnalyzing(true);
    // Simulate real-time ML analysis with a brief delay
    setTimeout(() => {
      const userMLProfile: UserMLProfile = {
        skills: profile?.skills || [],
        education_level: profile?.education_level || "basic",
        is_verified: profile?.is_verified || false,
        has_location: !!(profile?.latitude && profile?.longitude),
        completed_trainings: completedTrainings,
        skill_score_boost: skillScoreBoost,
        location_name: profile?.location_name,
        // Defaults for demo
        family_constraints: false,
        avg_available_hours_per_day: 6,
        has_internet: true,
        has_smartphone: true,
      };
      const mlResult = classifyUser(userMLProfile);
      setResult(mlResult);
      setAnalyzing(false);
    }, 800);
  };

  const displayScore = profile ? calculateDisplayScore({
    skills: profile.skills || [],
    education_level: profile.education_level || "basic",
    is_verified: profile.is_verified || false,
    has_location: !!(profile.latitude && profile.longitude),
    completed_trainings: completedTrainings,
    skill_score_boost: skillScoreBoost,
  }) : 0;

  if (!profile) return null;

  const routeInfo = result ? getRoutingInfo(result.classification) : null;
  const ClassIcon = result ? classificationIcons[result.classification] : Brain;

  if (compact) {
    return (
      <div className={`rounded-xl border p-4 ${routeInfo?.bgColor || "bg-muted/50"} ${routeInfo?.borderColor || ""}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {analyzing ? (
              <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <ClassIcon className={`w-5 h-5 ${routeInfo?.color}`} />
            )}
            <div>
              <div className="font-semibold text-sm">
                {analyzing ? "Analyzing..." : result ? classificationLabels[result.classification] : "ML Assessment"}
              </div>
              <div className="text-xs text-muted-foreground">
                {result ? `${result.confidence}% confidence` : "Real-time analysis"}
              </div>
            </div>
          </div>
          {result && routeInfo && (
            <Button size="sm" onClick={() => navigate(routeInfo.route)} className="text-xs">
              {routeInfo.label} <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Career Assessment</h3>
              <p className="text-xs text-muted-foreground">Real-time analysis powered by BloomPath ML</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={runAnalysis}
            disabled={analyzing}
          >
            <RefreshCw className={`w-4 h-4 ${analyzing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Score */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Overall Readiness Score</span>
              <span className="font-semibold">{displayScore}/100</span>
            </div>
            <Progress value={displayScore} className="h-3" />
          </div>
        </div>
      </div>

      {/* Classification Result */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {analyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-6"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">Analyzing your profile...</p>
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </motion.div>
          ) : result && routeInfo ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Classification Badge */}
              <div className={`rounded-xl p-4 mb-4 ${routeInfo.bgColor} border ${routeInfo.borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ClassIcon className={`w-5 h-5 ${routeInfo.color}`} />
                    <span className={`font-semibold ${routeInfo.color}`}>
                      {classificationLabels[result.classification]}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {result.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{result.recommended_action}</p>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {Object.entries(result.score_breakdown).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    skill_score: "Skills",
                    readiness_score: "Readiness",
                    constraint_score: "Flexibility",
                    training_score: "Training",
                  };
                  const maxes: Record<string, number> = {
                    skill_score: 40,
                    readiness_score: 30,
                    constraint_score: 20,
                    training_score: 10,
                  };
                  return (
                    <div key={key} className="bg-muted/50 rounded-lg p-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{labels[key]}</span>
                        <span className="font-medium">{val}/{maxes[key]}</span>
                      </div>
                      <Progress value={(val / maxes[key]) * 100} className="h-1.5" />
                    </div>
                  );
                })}
              </div>

              {/* Suggestions */}
              {result.suggested_modules && result.suggested_modules.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />Recommended Training
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {result.suggested_modules.slice(0, 3).map(mod => (
                      <Badge key={mod} variant="outline" className="text-xs">{mod}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.suggested_categories && result.suggested_categories.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3" />Suitable Job Categories
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {result.suggested_categories.slice(0, 3).map(cat => (
                      <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Details Toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3 transition-colors"
              >
                <ChevronRight className={`w-3 h-3 transition-transform ${showDetails ? "rotate-90" : ""}`} />
                {showDetails ? "Hide" : "Show"} reasoning
              </button>

              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="space-y-1 mb-4"
                >
                  {result.reasoning.map((r, i) => (
                    <div key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                      {r}
                    </div>
                  ))}
                </motion.div>
              )}

              {/* CTA Button */}
              <Button
                onClick={() => navigate(routeInfo.route)}
                className="w-full btn-primary-glow"
              >
                <ClassIcon className="w-4 h-4 mr-2" />
                {routeInfo.label}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Quick links */}
              <div className="flex gap-2 mt-3">
                {result.classification !== "job-ready" && (
                  <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => navigate("/jobs")}>
                    <Briefcase className="w-3 h-3 mr-1" />Browse Jobs
                  </Button>
                )}
                {result.classification !== "needs-training" && (
                  <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => navigate("/ngo-portal")}>
                    <BookOpen className="w-3 h-3 mr-1" />Training
                  </Button>
                )}
                {result.classification !== "shg-suitable" && (
                  <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => navigate("/shg-portal")}>
                    <Users className="w-3 h-3 mr-1" />SHG Jobs
                  </Button>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MLSmartDashboard;
