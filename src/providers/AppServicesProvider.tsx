"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  playSuccessSound, 
  playAchievementUnlock, 
  playWaterDrop, 
  playLevelUp 
} from "@/lib/audio";
import { useToast } from "@/components/ToastProvider";

export const isCloudActive = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CONVEX_URL &&
  process.env.NEXT_PUBLIC_CONVEX_URL.startsWith("http")
);

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  imageUrl: string;
  primaryEmailAddress?: {
    emailAddress: string;
  };
}

export interface UserStats {
  level: number;
  xp: number;
  streak: number;
  lastActiveDate: string;
  dailyWater: number;
  dailyCaloriesLogged: number;
  workoutsCompleted: number;
}

export interface DailyLog {
  date: string;
  water: number;
  calories: number;
  workoutsCompleted: number;
  xpEarned: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

export const ACHIEVEMENTS_DATABASE: Achievement[] = [
  { id: "first_workout", title: "First Blood", description: "Complete your first active workout session.", icon: "💪", rarity: "Common" },
  { id: "workouts_5", title: "Iron Dedication", description: "Complete 5 workout sessions in total.", icon: "🏋️‍♂️", rarity: "Rare" },
  { id: "streak_3", title: "Streak Starter", description: "Maintain a 3-day active training streak.", icon: "🔥", rarity: "Common" },
  { id: "streak_7", title: "Consistent Beast", description: "Maintain a 7-day active training streak.", icon: "⚡", rarity: "Epic" },
  { id: "water_1k", title: "Hydration Rookie", description: "Log 1,000 ml of water in a single day.", icon: "🥤", rarity: "Common" },
  { id: "water_3k", title: "Hydration Hero", description: "Hit your daily target of 3,000 ml of water.", icon: "🌊", rarity: "Rare" },
  { id: "calories_logged", title: "Nutrition Analyst", description: "Log your daily food intake for the first time.", icon: "🥗", rarity: "Common" },
  { id: "calories_target", title: "Calorie Master", description: "Log at least 2,000 calories in a single day.", icon: "🥑", rarity: "Common" },
  { id: "level_2", title: "Level Up", description: "Reach Level 2 in your fitness journey.", icon: "📈", rarity: "Common" },
  { id: "level_5", title: "Elite Performer", description: "Reach Level 5.", icon: "👑", rarity: "Rare" },
  { id: "level_10", title: "Cyber Gym Lord", description: "Reach Level 10.", icon: "🔮", rarity: "Legendary" },
  { id: "xp_1k", title: "XP Collector", description: "Earn a total of 1,000 XP.", icon: "⭐", rarity: "Rare" },
  { id: "program_created", title: "Architect of Strength", description: "Generate a personalized AI fitness program.", icon: "🧬", rarity: "Common" },
  { id: "gym_lord", title: "Alpha Status", description: "Reach Level 10 and complete 10 workouts.", icon: "🏆", rarity: "Legendary" }
];

export interface AppServicesContextType {
  isCloudActive: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  user: UserProfile | null;
  plans: any[] | undefined;
  stats: UserStats | null;
  achievements: Record<string, string> | null; // badgeId -> unlockDate
  dailyHistory: DailyLog[];
  customRoutines: any[];
  completedQuests: string[];
  login: (email?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, imageUrl: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  createPlan: (plan: any) => Promise<string>;
  addXp: (amount: number) => void;
  logWater: (amount: number) => void;
  logCalories: (amount: number) => void;
  completeWorkoutSession: () => void;
  getDailyHistory: (days: number) => DailyLog[];
  unlockAchievement: (badgeId: string) => void;
  saveCustomRoutine: (routine: any) => void;
  claimQuestReward: (questId: string, xpBonus: number) => void;
}

const AppServicesContext = createContext<AppServicesContextType | null>(null);

const PLANS_STORAGE_KEY = "codeflex_local_plans";
const USER_STORAGE_KEY = "codeflex_local_user";
const USERS_LIST_STORAGE_KEY = "codeflex_local_registered_users";

const DEFAULT_MOCK_USER: UserProfile = {
  id: "mock_user_123",
  firstName: "Alex",
  lastName: "Trainer",
  fullName: "Alex Trainer",
  imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  primaryEmailAddress: {
    emailAddress: "alex.trainer@codeflex.ai",
  },
};

// SHARED STATS, ACHIEVEMENTS, AND DAILY LOGS CONTROLLER
function useAppController(userId: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Record<string, string> | null>(null);
  const [dailyHistory, setDailyHistory] = useState<DailyLog[]>([]);
  const [customRoutines, setCustomRoutines] = useState<any[]>([]);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const { toast } = useToast();

  const getStatsKey = (id: string) => `codeflex_stats_${id}`;
  const getAchievementsKey = (id: string) => `codeflex_achievements_${id}`;
  const getDailyHistoryKey = (id: string) => `codeflex_daily_history_${id}`;
  const getCustomRoutinesKey = (id: string) => `codeflex_custom_routines_${id}`;
  const getCompletedQuestsKey = (id: string) => `codeflex_completed_quests_${id}`;

  // Load user details on login or mount
  useEffect(() => {
    if (!userId) {
      setStats(null);
      setAchievements(null);
      setDailyHistory([]);
      setCustomRoutines([]);
      setCompletedQuests([]);
      return;
    }

    const today = new Date().toLocaleDateString();

    // 1. Load User Stats
    const statsKey = getStatsKey(userId);
    const storedStats = localStorage.getItem(statsKey);
    let currentStats: UserStats;

    if (storedStats) {
      currentStats = JSON.parse(storedStats);
      // Ensure workoutsCompleted exists in old stats
      if (currentStats.workoutsCompleted === undefined) {
        currentStats.workoutsCompleted = 0;
      }
      // Reset daily counts if day changed
      if (currentStats.lastActiveDate && currentStats.lastActiveDate !== today) {
        currentStats.dailyWater = 0;
        currentStats.dailyCaloriesLogged = 0;
        
        // Reset streak if missed more than 1 day
        const lastDate = new Date(currentStats.lastActiveDate);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          currentStats.streak = 0;
        }
      }
      setStats(currentStats);
      localStorage.setItem(statsKey, JSON.stringify(currentStats));
    } else {
      currentStats = {
        level: 1,
        xp: 0,
        streak: 0,
        lastActiveDate: "",
        dailyWater: 0,
        dailyCaloriesLogged: 0,
        workoutsCompleted: 0,
      };
      setStats(currentStats);
      localStorage.setItem(statsKey, JSON.stringify(currentStats));
    }

    // 2. Load Achievements
    const achKey = getAchievementsKey(userId);
    const storedAch = localStorage.getItem(achKey);
    if (storedAch) {
      setAchievements(JSON.parse(storedAch));
    } else {
      setAchievements({});
      localStorage.setItem(achKey, JSON.stringify({}));
    }

    // 3. Load Daily History
    const histKey = getDailyHistoryKey(userId);
    const storedHist = localStorage.getItem(histKey);
    if (storedHist) {
      setDailyHistory(JSON.parse(storedHist));
    } else {
      setDailyHistory([]);
      localStorage.setItem(histKey, JSON.stringify([]));
    }

    // 4. Load Custom Routines
    const routinesKey = getCustomRoutinesKey(userId);
    const storedRoutines = localStorage.getItem(routinesKey);
    if (storedRoutines) {
      setCustomRoutines(JSON.parse(storedRoutines));
    } else {
      setCustomRoutines([]);
      localStorage.setItem(routinesKey, JSON.stringify([]));
    }

    // 5. Load Completed Quests
    const questsKey = getCompletedQuestsKey(userId);
    const storedQuests = localStorage.getItem(questsKey);
    if (storedQuests) {
      setCompletedQuests(JSON.parse(storedQuests));
    } else {
      setCompletedQuests([]);
      localStorage.setItem(questsKey, JSON.stringify([]));
    }
  }, [userId]);

  const saveStats = (updated: UserStats) => {
    if (!userId) return;
    setStats(updated);
    localStorage.setItem(getStatsKey(userId), JSON.stringify(updated));
  };

  const saveAchievements = (updated: Record<string, string>) => {
    if (!userId) return;
    setAchievements(updated);
    localStorage.setItem(getAchievementsKey(userId), JSON.stringify(updated));
  };

  const saveDailyHistory = (updated: DailyLog[]) => {
    if (!userId) return;
    setDailyHistory(updated);
    localStorage.setItem(getDailyHistoryKey(userId), JSON.stringify(updated));
  };

  const saveCustomRoutine = (routine: any) => {
    if (!userId) return;
    const routinesKey = getCustomRoutinesKey(userId);
    const stored = localStorage.getItem(routinesKey);
    const existing: any[] = stored ? JSON.parse(stored) : [];
    
    // Merge exercises if same day, or create new day entry
    const dayIdx = existing.findIndex((r) => r.day.toLowerCase() === routine.day.toLowerCase());
    if (dayIdx >= 0) {
      // Append only unique routines by name
      const existingNames = new Set(existing[dayIdx].routines.map((r: any) => r.name.toLowerCase()));
      routine.routines.forEach((r: any) => {
        if (!existingNames.has(r.name.toLowerCase())) {
          existing[dayIdx].routines.push(r);
        }
      });
    } else {
      existing.push(routine);
    }
    
    setCustomRoutines(existing);
    localStorage.setItem(routinesKey, JSON.stringify(existing));
    
    toast(`Custom routine saved for ${routine.day}!`, "success", "Workout Builder");
    
    // Dispatch local update event for profile plans re-render
    window.dispatchEvent(new Event("localPlansUpdated"));
  };

  const claimQuestReward = (questId: string, xpBonus: number) => {
    if (!userId) return;
    const questsKey = getCompletedQuestsKey(userId);
    const stored = localStorage.getItem(questsKey);
    const quests: string[] = stored ? JSON.parse(stored) : [];
    
    if (quests.includes(questId)) return;
    
    const updatedQuests = [...quests, questId];
    setCompletedQuests(updatedQuests);
    localStorage.setItem(questsKey, JSON.stringify(updatedQuests));
    
    playAchievementUnlock();
    addXp(xpBonus);
    toast(`Challenge Cleared! Received +${xpBonus} XP Bonus!`, "success", "🎯 Quest Secured");
  };

  // Helper to log stats to daily history
  const updateDailyHistoryLog = (waterDiff: number, caloriesDiff: number, workoutCompleted: boolean, xpDiff: number) => {
    if (!userId) return;
    const today = new Date().toLocaleDateString();
    const histKey = getDailyHistoryKey(userId);
    const storedHist = localStorage.getItem(histKey);
    const history: DailyLog[] = storedHist ? JSON.parse(storedHist) : [];

    const existingLogIdx = history.findIndex((h) => h.date === today);

    if (existingLogIdx >= 0) {
      history[existingLogIdx] = {
        ...history[existingLogIdx],
        water: history[existingLogIdx].water + waterDiff,
        calories: history[existingLogIdx].calories + caloriesDiff,
        workoutsCompleted: history[existingLogIdx].workoutsCompleted + (workoutCompleted ? 1 : 0),
        xpEarned: history[existingLogIdx].xpEarned + xpDiff,
      };
    } else {
      history.unshift({
        date: today,
        water: Math.max(0, waterDiff),
        calories: Math.max(0, caloriesDiff),
        workoutsCompleted: workoutCompleted ? 1 : 0,
        xpEarned: xpDiff,
      });
    }

    saveDailyHistory(history);
    return history;
  };

  // Check and unlock achievements
  const checkAchievements = (currentStats: UserStats) => {
    if (!userId) return;
    const achKey = getAchievementsKey(userId);
    const storedAch = localStorage.getItem(achKey);
    const currentAch: Record<string, string> = storedAch ? JSON.parse(storedAch) : {};
    let unlockedAny = false;

    ACHIEVEMENTS_DATABASE.forEach((badge) => {
      // Skip if already unlocked
      if (currentAch[badge.id]) return;

      let shouldUnlock = false;

      switch (badge.id) {
        case "first_workout":
          shouldUnlock = currentStats.workoutsCompleted >= 1;
          break;
        case "workouts_5":
          shouldUnlock = currentStats.workoutsCompleted >= 5;
          break;
        case "streak_3":
          shouldUnlock = currentStats.streak >= 3;
          break;
        case "streak_7":
          shouldUnlock = currentStats.streak >= 7;
          break;
        case "water_1k":
          shouldUnlock = currentStats.dailyWater >= 1000;
          break;
        case "water_3k":
          shouldUnlock = currentStats.dailyWater >= 3000;
          break;
        case "calories_logged":
          shouldUnlock = currentStats.dailyCaloriesLogged > 0;
          break;
        case "calories_target":
          shouldUnlock = currentStats.dailyCaloriesLogged >= 2000;
          break;
        case "level_2":
          shouldUnlock = currentStats.level >= 2;
          break;
        case "level_5":
          shouldUnlock = currentStats.level >= 5;
          break;
        case "level_10":
          shouldUnlock = currentStats.level >= 10;
          break;
        case "xp_1k":
          shouldUnlock = currentStats.xp >= 1000;
          break;
        case "gym_lord":
          shouldUnlock = currentStats.level >= 10 && currentStats.workoutsCompleted >= 10;
          break;
        default:
          break;
      }

      if (shouldUnlock) {
        currentAch[badge.id] = new Date().toLocaleDateString();
        unlockedAny = true;
        
        // Play arpeggio
        playAchievementUnlock();
        
        // Show Toast
        toast(
          `Unlocked: "${badge.title}" - ${badge.description}`,
          "success",
          "🏆 Achievement Unlocked"
        );
      }
    });

    if (unlockedAny) {
      saveAchievements(currentAch);
    }
  };

  const unlockAchievement = (badgeId: string) => {
    if (!userId || !achievements) return;
    if (achievements[badgeId]) return;

    const badge = ACHIEVEMENTS_DATABASE.find(b => b.id === badgeId);
    if (!badge) return;

    const updated = {
      ...achievements,
      [badgeId]: new Date().toLocaleDateString(),
    };

    saveAchievements(updated);
    playAchievementUnlock();
    toast(
      `Unlocked: "${badge.title}" - ${badge.description}`,
      "success",
      "🏆 Achievement Unlocked"
    );
  };

  const addXp = (amount: number) => {
    if (!stats) return;
    const newXp = stats.xp + amount;
    const newLevel = Math.floor(newXp / 500) + 1;
    const leveledUp = newLevel > stats.level;

    const updated = {
      ...stats,
      xp: newXp,
      level: newLevel,
    };

    if (leveledUp) {
      playLevelUp();
      toast(
        `You reached Level ${newLevel}! Keep pushing!`,
        "success",
        "⚡ LEVEL UP!"
      );
    } else {
      playSuccessSound();
      toast(`+${amount} XP Earned`, "info", "Progression");
    }

    saveStats(updated);
    updateDailyHistoryLog(0, 0, false, amount);
    checkAchievements(updated);
  };

  const logWater = (amount: number) => {
    if (!stats) return;
    const updated = {
      ...stats,
      dailyWater: stats.dailyWater + amount,
    };
    saveStats(updated);
    playWaterDrop();
    toast(`Logged ${amount}ml of Water`, "info", "Hydration");

    const xpGained = Math.round(amount * 0.08);
    const newXp = stats.xp + xpGained;
    const newLevel = Math.floor(newXp / 500) + 1;
    const leveledUp = newLevel > stats.level;

    const finalStats = {
      ...updated,
      xp: newXp,
      level: newLevel,
    };

    if (leveledUp) {
      playLevelUp();
      toast(`You reached Level ${newLevel}! Keep pushing!`, "success", "⚡ LEVEL UP!");
    }
    
    saveStats(finalStats);
    updateDailyHistoryLog(amount, 0, false, xpGained);
    checkAchievements(finalStats);
  };

  const logCalories = (amount: number) => {
    if (!stats) return;
    const updated = {
      ...stats,
      dailyCaloriesLogged: stats.dailyCaloriesLogged + amount,
    };
    saveStats(updated);
    toast(`Logged ${amount} Calories`, "info", "Nutrition");

    const xpGained = 50;
    const newXp = stats.xp + xpGained;
    const newLevel = Math.floor(newXp / 500) + 1;
    const leveledUp = newLevel > stats.level;

    const finalStats = {
      ...updated,
      xp: newXp,
      level: newLevel,
    };

    if (leveledUp) {
      playLevelUp();
      toast(`You reached Level ${newLevel}! Keep pushing!`, "success", "⚡ LEVEL UP!");
    }

    saveStats(finalStats);
    updateDailyHistoryLog(0, amount, false, xpGained);
    checkAchievements(finalStats);
  };

  const completeWorkoutSession = () => {
    if (!stats) return;
    const today = new Date().toLocaleDateString();
    
    const alreadyWorkedOutToday = stats.lastActiveDate === today;
    const newStreak = alreadyWorkedOutToday ? stats.streak : stats.streak + 1;
    const newWorkoutsCount = stats.workoutsCompleted + 1;

    const updated = {
      ...stats,
      streak: newStreak,
      lastActiveDate: today,
      workoutsCompleted: newWorkoutsCount,
    };

    saveStats(updated);
    toast(`Workout Secured! Streak is ${newStreak} days!`, "success", "💪 WORKOUT COMPLETE");

    const xpGained = 150;
    const newXp = stats.xp + xpGained;
    const newLevel = Math.floor(newXp / 500) + 1;
    const leveledUp = newLevel > stats.level;

    const finalStats = {
      ...updated,
      xp: newXp,
      level: newLevel,
    };

    if (leveledUp) {
      playLevelUp();
      toast(`You reached Level ${newLevel}! Keep pushing!`, "success", "⚡ LEVEL UP!");
    }

    saveStats(finalStats);
    updateDailyHistoryLog(0, 0, true, xpGained);
    checkAchievements(finalStats);
  };

  const getDailyHistory = (daysCount: number): DailyLog[] => {
    if (!userId) return [];
    const logs = [...dailyHistory];
    
    // Seed dummy historical data if history is empty, to look good on graphs
    if (logs.length === 0) {
      const seed: DailyLog[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        seed.push({
          date: d.toLocaleDateString(),
          water: Math.round(1500 + Math.random() * 1500),
          calories: Math.round(1800 + Math.random() * 800),
          workoutsCompleted: Math.random() > 0.4 ? 1 : 0,
          xpEarned: Math.round(100 + Math.random() * 200),
        });
      }
      return seed.slice(0, daysCount);
    }

    return logs.slice(0, daysCount);
  };

  return { 
    stats, 
    achievements, 
    dailyHistory, 
    customRoutines,
    completedQuests,
    addXp, 
    logWater, 
    logCalories, 
    completeWorkoutSession,
    getDailyHistory,
    unlockAchievement,
    saveCustomRoutine,
    claimQuestReward
  };
}

// 1. CLOUD IMPLEMENTATION (runs only if keys are present)
function CloudServicesProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useClerkUser();
  const plans = useConvexQuery(api.plans.getUserPlans, user?.id ? { userId: user.id } : "skip");
  const convexCreatePlan = useConvexMutation(api.plans.createPlan);
  const controller = useAppController(user?.id);

  const login = async () => {
    return { success: true };
  };

  const register = async () => {
    return { success: true };
  };

  const logout = () => {
    // Handled by Clerk UI
  };

  const createPlan = async (plan: any) => {
    if (!user?.id) throw new Error("User not signed in");
    // Unlock creator achievement on plan creation!
    controller.unlockAchievement("program_created");
    return await convexCreatePlan({
      userId: user.id,
      ...plan,
    });
  };

  // Merge custom routines dynamically into the user plans
  const userPlans = useMemo(() => {
    if (!plans) return undefined;
    const plansBase = [...plans];
    const activePlanIdx = plansBase.findIndex(p => p.isActive);
    if (activePlanIdx >= 0) {
      const activePlanCopy = JSON.parse(JSON.stringify(plansBase[activePlanIdx]));
      controller.customRoutines.forEach((cRoutine) => {
        const dayIdx = activePlanCopy.workoutPlan.exercises.findIndex(
          (ex: any) => ex.day.toLowerCase() === cRoutine.day.toLowerCase()
        );
        if (dayIdx >= 0) {
          const existingNames = new Set(activePlanCopy.workoutPlan.exercises[dayIdx].routines.map((r: any) => r.name.toLowerCase()));
          cRoutine.routines.forEach((r: any) => {
            if (!existingNames.has(r.name.toLowerCase())) {
              activePlanCopy.workoutPlan.exercises[dayIdx].routines.push(r);
            }
          });
        } else {
          activePlanCopy.workoutPlan.exercises.push({
            day: cRoutine.day,
            routines: cRoutine.routines
          });
        }
      });
      plansBase[activePlanIdx] = activePlanCopy;
    }
    return plansBase;
  }, [plans, controller.customRoutines]);

  const mappedUser: UserProfile | null = user
    ? {
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        fullName: user.fullName || "",
        imageUrl: user.imageUrl,
        primaryEmailAddress: user.primaryEmailAddress
          ? { emailAddress: user.primaryEmailAddress.emailAddress }
          : undefined,
      }
    : null;

  return (
    <AppServicesContext.Provider
      value={{
        isCloudActive: true,
        isLoaded: isLoaded ?? false,
        isSignedIn: !!isSignedIn,
        user: mappedUser,
        plans: userPlans,
        stats: controller.stats,
        achievements: controller.achievements,
        dailyHistory: controller.dailyHistory,
        customRoutines: controller.customRoutines,
        completedQuests: controller.completedQuests,
        login,
        register,
        logout,
        createPlan,
        addXp: controller.addXp,
        logWater: controller.logWater,
        logCalories: controller.logCalories,
        completeWorkoutSession: controller.completeWorkoutSession,
        getDailyHistory: controller.getDailyHistory,
        unlockAchievement: controller.unlockAchievement,
        saveCustomRoutine: controller.saveCustomRoutine,
        claimQuestReward: controller.claimQuestReward
      }}
    >
      {children}
    </AppServicesContext.Provider>
  );
}

// 2. LOCAL IMPLEMENTATION (fallback when keys are missing)
function LocalServicesProvider({ children }: { children: React.ReactNode }) {
  const [localUser, setLocalUser] = useState<UserProfile | null>(null);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const controller = useAppController(localUser?.id);

  const loadLocalData = () => {
    // Load User
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setLocalUser(JSON.parse(storedUser));
    } else {
      // Default to logged-in user for ease of local demo
      setLocalUser(DEFAULT_MOCK_USER);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_USER));
      
      // Seed default user in registered users
      const storedUsers = localStorage.getItem(USERS_LIST_STORAGE_KEY);
      const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const userExists = registeredUsers.some((u: any) => u.email === DEFAULT_MOCK_USER.primaryEmailAddress?.emailAddress);
      if (!userExists) {
        registeredUsers.push({
          id: DEFAULT_MOCK_USER.id,
          name: DEFAULT_MOCK_USER.fullName,
          email: DEFAULT_MOCK_USER.primaryEmailAddress?.emailAddress,
          password: "password123",
          imageUrl: DEFAULT_MOCK_USER.imageUrl
        });
        localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(registeredUsers));
      }
    }

    // Load Plans
    const storedPlans = localStorage.getItem(PLANS_STORAGE_KEY);
    if (storedPlans) {
      try {
        setAllPlans(JSON.parse(storedPlans));
      } catch (e) {
        console.error("Failed to parse local plans", e);
      }
    }
  };

  useEffect(() => {
    loadLocalData();
    setIsLoaded(true);

    // Listen for custom update events
    const handleUpdate = () => {
      const storedPlans = localStorage.getItem(PLANS_STORAGE_KEY);
      if (storedPlans) {
        setAllPlans(JSON.parse(storedPlans));
      }
    };
    window.addEventListener("localPlansUpdated", handleUpdate);
    return () => window.removeEventListener("localPlansUpdated", handleUpdate);
  }, []);

  const login = async (email?: string, password?: string) => {
    if (!email || !password) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_USER));
      setLocalUser(DEFAULT_MOCK_USER);
      return { success: true };
    }

    const storedUsers = localStorage.getItem(USERS_LIST_STORAGE_KEY);
    const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];
    
    const matchedUser = registeredUsers.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!matchedUser) {
      return { success: false, error: "Invalid email or password" };
    }

    const profile: UserProfile = {
      id: matchedUser.id,
      firstName: matchedUser.name.split(" ")[0] || "",
      lastName: matchedUser.name.split(" ").slice(1).join(" ") || "",
      fullName: matchedUser.name,
      imageUrl: matchedUser.imageUrl,
      primaryEmailAddress: { emailAddress: matchedUser.email }
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    setLocalUser(profile);
    return { success: true };
  };

  const register = async (name: string, email: string, password: string, imageUrl: string) => {
    const storedUsers = localStorage.getItem(USERS_LIST_STORAGE_KEY);
    const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];

    const userExists = registeredUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      return { success: false, error: "Email is already registered" };
    }

    const newUser = {
      id: `local_user_${Date.now()}`,
      name,
      email,
      password,
      imageUrl: imageUrl || "https://randomuser.me/api/portraits/men/32.jpg"
    };

    registeredUsers.push(newUser);
    localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(registeredUsers));

    const profile: UserProfile = {
      id: newUser.id,
      firstName: name.split(" ")[0] || "",
      lastName: name.split(" ").slice(1).join(" ") || "",
      fullName: name,
      imageUrl: newUser.imageUrl,
      primaryEmailAddress: { emailAddress: email }
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    setLocalUser(profile);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setLocalUser(null);
  };

  const createPlan = async (plan: any) => {
    const stored = localStorage.getItem(PLANS_STORAGE_KEY);
    const existingPlans = stored ? JSON.parse(stored) : [];

    const updatedPlans = existingPlans.map((p: any) => ({ ...p, isActive: false }));

    const newPlan = {
      _id: `local_plan_${Date.now()}`,
      _creationTime: Date.now(),
      ...plan,
      userId: localUser?.id || "mock_user_123",
      isActive: true,
    };

    updatedPlans.unshift(newPlan);
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updatedPlans));
    setAllPlans(updatedPlans);

    // Trigger achievement unlock
    controller.unlockAchievement("program_created");

    window.dispatchEvent(new Event("localPlansUpdated"));

    return newPlan._id;
  };

  // Merge custom routines dynamically into the user plans
  const userPlans = useMemo(() => {
    const plansBase = allPlans.filter(p => p.userId === (localUser?.id || "mock_user_123"));
    const activePlanIdx = plansBase.findIndex(p => p.isActive);
    if (activePlanIdx >= 0) {
      const activePlanCopy = JSON.parse(JSON.stringify(plansBase[activePlanIdx]));
      controller.customRoutines.forEach((cRoutine) => {
        const dayIdx = activePlanCopy.workoutPlan.exercises.findIndex(
          (ex: any) => ex.day.toLowerCase() === cRoutine.day.toLowerCase()
        );
        if (dayIdx >= 0) {
          const existingNames = new Set(activePlanCopy.workoutPlan.exercises[dayIdx].routines.map((r: any) => r.name.toLowerCase()));
          cRoutine.routines.forEach((r: any) => {
            if (!existingNames.has(r.name.toLowerCase())) {
              activePlanCopy.workoutPlan.exercises[dayIdx].routines.push(r);
            }
          });
        } else {
          activePlanCopy.workoutPlan.exercises.push({
            day: cRoutine.day,
            routines: cRoutine.routines
          });
        }
      });
      plansBase[activePlanIdx] = activePlanCopy;
    }
    return plansBase;
  }, [allPlans, localUser?.id, controller.customRoutines]);

  return (
    <AppServicesContext.Provider
      value={{
        isCloudActive: false,
        isLoaded,
        isSignedIn: !!localUser,
        user: localUser,
        plans: userPlans,
        stats: controller.stats,
        achievements: controller.achievements,
        dailyHistory: controller.dailyHistory,
        customRoutines: controller.customRoutines,
        completedQuests: controller.completedQuests,
        login,
        register,
        logout,
        createPlan,
        addXp: controller.addXp,
        logWater: controller.logWater,
        logCalories: controller.logCalories,
        completeWorkoutSession: controller.completeWorkoutSession,
        getDailyHistory: controller.getDailyHistory,
        unlockAchievement: controller.unlockAchievement,
        saveCustomRoutine: controller.saveCustomRoutine,
        claimQuestReward: controller.claimQuestReward
      }}
    >
      {children}
    </AppServicesContext.Provider>
  );
}

// MAIN WRAPPER
export function AppServicesProvider({ children }: { children: React.ReactNode }) {
  if (isCloudActive) {
    return <CloudServicesProvider>{children}</CloudServicesProvider>;
  } else {
    return <LocalServicesProvider>{children}</LocalServicesProvider>;
  }
}

// CUSTOM HOOK
export function useAppServices() {
  const context = useContext(AppServicesContext);
  if (!context) {
    throw new Error("useAppServices must be used within an AppServicesProvider");
  }
  return context;
}
