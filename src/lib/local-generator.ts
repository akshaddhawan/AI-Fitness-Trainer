export interface UserFitnessProfile {
  age: number;
  height: string;
  weight: number;
  injuries: string;
  workoutDays: number;
  fitnessGoal: string;
  fitnessLevel: string;
  dietaryRestrictions: string;
}

export function generateLocalPlan(profile: UserFitnessProfile) {
  const {
    weight,
    injuries = "none",
    workoutDays = 3,
    fitnessGoal = "General Fitness",
    fitnessLevel = "Beginner",
    dietaryRestrictions = "none",
  } = profile;

  const goalLower = fitnessGoal.toLowerCase();
  const levelLower = fitnessLevel.toLowerCase();
  const injuriesLower = injuries.toLowerCase();
  const dietLower = dietaryRestrictions.toLowerCase();

  // 1. DETERMINE WORKOUT DAYS SCHEDULE
  let schedule: string[] = [];
  if (workoutDays === 1) {
    schedule = ["Wednesday"];
  } else if (workoutDays === 2) {
    schedule = ["Tuesday", "Thursday"];
  } else if (workoutDays === 3) {
    schedule = ["Monday", "Wednesday", "Friday"];
  } else if (workoutDays === 4) {
    schedule = ["Monday", "Tuesday", "Thursday", "Friday"];
  } else if (workoutDays >= 5) {
    schedule = ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"];
  } else {
    schedule = ["Monday", "Wednesday", "Friday"];
  }

  // 2. DEFINE EXERCISES POOL & EXCLUDE INJURIOUS ONES
  const hasKneeInjury = injuriesLower.includes("knee") || injuriesLower.includes("leg");
  const hasBackInjury = injuriesLower.includes("back") || injuriesLower.includes("spine");
  const hasShoulderInjury = injuriesLower.includes("shoulder") || injuriesLower.includes("rotator");

  // Adjust routine sets and reps based on level
  const setMultiplier = levelLower === "advanced" ? 4 : levelLower === "intermediate" ? 3 : 2;
  const baseReps = goalLower.includes("muscle") || goalLower.includes("gain") ? 8 : 12;

  // Exercises selection helper
  const getLegExercise = () => {
    if (hasKneeInjury) {
      return { name: "Seated Leg Extensions (Light)", sets: setMultiplier, reps: 15, description: "Low stress on knee joint, focus on squeeze." };
    }
    return { name: "Barbell Back Squats", sets: setMultiplier, reps: baseReps, description: "Keep spine neutral, drive through heels." };
  };

  const getHingeExercise = () => {
    if (hasBackInjury) {
      return { name: "Glute Bridges (Bodyweight/Band)", sets: setMultiplier, reps: 15, description: "Glute activation to protect lower back." };
    }
    if (hasKneeInjury) {
      return { name: "Romanian Deadlifts (Dumbbell)", sets: setMultiplier, reps: 10, description: "Hamstring and posterior chain focus, minimal knee flexion." };
    }
    return { name: "Conventional Deadlifts", sets: setMultiplier, reps: 6, description: "Focus on form and bracing core." };
  };

  const getPushExercise = () => {
    if (hasShoulderInjury) {
      return { name: "Floor Chest Press (Dumbbell)", sets: setMultiplier, reps: 10, description: "Restricted range of motion to protect shoulder joints." };
    }
    return { name: "Flat Bench Press (Barbell)", sets: setMultiplier, reps: baseReps, description: "Retract scapulae and touch chest lightly." };
  };

  const getShoulderExercise = () => {
    if (hasShoulderInjury) {
      return { name: "Incline Dumbbell Y-Raises (Light)", sets: setMultiplier, reps: 12, description: "Strengthens lower traps and rotator cuff without heavy pressing." };
    }
    return { name: "Overhead Barbell Press", sets: setMultiplier, reps: 8, description: "Brace core, push head through at top." };
  };

  const getPullExercise = () => {
    return { name: "Chest-Supported Dumbbell Rows", sets: setMultiplier, reps: 10, description: "Takes pressure off lower back, squeeze shoulder blades." };
  };

  // Build daily routines based on goal and schedule
  const exercises = schedule.map((day, idx) => {
    let routines = [];

    if (goalLower.includes("muscle") || goalLower.includes("gain") || goalLower.includes("bulking")) {
      // Hypertrophy Split
      if (idx % 2 === 0) {
        // Upper Body Day
        routines = [
          getPushExercise(),
          getPullExercise(),
          getShoulderExercise(),
          { name: "Incline Dumbbell Bicep Curls", sets: setMultiplier + 1, reps: 12, description: "Maximize bicep stretch." },
          { name: "Overhead Cable Tricep Extensions", sets: setMultiplier + 1, reps: 12, description: "Target long head of triceps." }
        ];
      } else {
        // Lower Body Day
        routines = [
          getLegExercise(),
          getHingeExercise(),
          { name: "Leg Curls (Seated/Lying)", sets: setMultiplier, reps: 12 },
          { name: "Standing Calf Raises", sets: setMultiplier + 1, reps: 15 },
          { name: "Hanging Leg Raises", sets: 3, reps: 12, description: "Core stability and lower abs." }
        ];
      }
    } else if (goalLower.includes("loss") || goalLower.includes("shred") || goalLower.includes("cut")) {
      // Cardio & Fat Loss Focus
      routines = [
        { name: "Bodyweight Lunges", sets: setMultiplier, reps: 12, description: hasKneeInjury ? "Substitute with Glute Bridges if knees hurt" : "Alternative leg movement" },
        getPushExercise(),
        { name: "Lat Pulldowns (Wide Grip)", sets: setMultiplier, reps: 12 },
        { name: "Kettlebell Swings", sets: setMultiplier, reps: 15, description: hasBackInjury ? "Substitute with Planks (60s)" : "Cardio hip hinge movement" },
        { name: "Mountain Climbers", sets: 3, reps: 30, description: "HIIT core movement" },
        { name: "Treadmill Walk/Incline Run", sets: 1, reps: 1, description: "LISS/HIIT finisher: 15 minutes." }
      ];
    } else {
      // General Fitness / Functional Fitness
      routines = [
        getLegExercise(),
        getPushExercise(),
        getPullExercise(),
        { name: "Dumbbell Goblet Squats", sets: setMultiplier, reps: 10, description: "Core and leg strength stabilizer" },
        { name: "Plank Hold", sets: 3, reps: 1, description: "Hold for 60 seconds. Brace core tightly." },
        { name: "Elliptical / Stationary Bike", sets: 1, reps: 1, description: "Steady-state cardio: 20 minutes." }
      ];
    }

    return {
      day,
      routines,
    };
  });

  // 3. DIET PLAN CALCULATION
  let baseCalories = 2000;
  if (goalLower.includes("loss") || goalLower.includes("shred")) {
    baseCalories = Math.round(weight * 12);
  } else if (goalLower.includes("muscle") || goalLower.includes("gain")) {
    baseCalories = Math.round(weight * 18);
  } else {
    baseCalories = Math.round(weight * 15);
  }

  // Ensure reasonable caloric bounds
  baseCalories = Math.max(1400, Math.min(4500, baseCalories));

  // Swap food suggestions based on dietary restriction
  const isVegetarian = dietLower.includes("veg") && !dietLower.includes("vegan");
  const isVegan = dietLower.includes("vegan");
  const isLactoseIntolerant = dietLower.includes("lactose") || dietLower.includes("dairy");

  const getProteinSource = (mealTime: string) => {
    if (isVegan) {
      if (mealTime === "breakfast") return "Tofu scramble with spinach & tomatoes";
      if (mealTime === "lunch") return "Lentil & Chickpea curry with mixed greens";
      return "Tempeh stir-fry with quinoa and broccoli";
    }
    if (isVegetarian) {
      if (mealTime === "breakfast") return "Scrambled eggs (3) with spinach & avocado";
      if (mealTime === "lunch") return "Paneer tikka salad with olive oil dressing";
      return "Lentil pasta with rich tomato-basil sauce and soy chunks";
    }
    // Carnivore/standard
    if (mealTime === "breakfast") return "Omelette with turkey bacon & spinach";
    if (mealTime === "lunch") return "Grilled chicken breast (200g) with asparagus";
    return "Baked wild salmon fillet (200g) with zucchini";
  };

  const getDairyOrSubstitute = () => {
    if (isVegan || isLactoseIntolerant) return "Almond/Oat milk yogurt with mixed berries";
    return "Greek yogurt (0% fat) with honey & berries";
  };

  const getSnackProtein = () => {
    if (isVegan) return "Plant-based protein shake with almond butter & banana";
    return "Whey protein isolate shake with almond butter & banana";
  };

  const meals = [
    {
      name: "Breakfast",
      foods: [
        getProteinSource("breakfast"),
        "Whole-grain sourdough toast (2 slices)",
        "Unsweetened black coffee or Green tea",
        "A handful of raw almonds"
      ]
    },
    {
      name: "Lunch",
      foods: [
        getProteinSource("lunch"),
        "Brown rice or Quinoa (1 cup)",
        "Large mixed greens salad with olive oil & lemon juice dressing",
        "Half an avocado"
      ]
    },
    {
      name: "Snack (Post-Workout)",
      foods: [
        getSnackProtein(),
        getDairyOrSubstitute(),
        "1 organic green apple"
      ]
    },
    {
      name: "Dinner",
      foods: [
        getProteinSource("dinner"),
        "Sweet potato mash (150g)",
        "Roasted vegetables (broccoli, brussels sprouts, peppers)",
        "Chilled lemon water"
      ]
    }
  ];

  return {
    name: `${fitnessGoal} Plan`,
    workoutPlan: {
      schedule,
      exercises,
    },
    dietPlan: {
      dailyCalories: baseCalories,
      meals,
    },
  };
}
