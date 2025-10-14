export interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  difficulty: number; // 1-3
  equipment: string;
  description: string;
  formTips: string;
  recommendedSets: number;
  recommendedReps: string;
}

export const MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Arms",
  "Shoulders",
  "Core"
];

export const EXERCISE_DATABASE: Exercise[] = [
  // CHEST (6)
  {
    id: 1,
    name: "Barbell Bench Press",
    muscleGroup: "Chest",
    secondaryMuscles: ["Triceps", "Front Delts"],
    difficulty: 2,
    equipment: "Barbell, Flat Bench",
    description: "The classic upper-body compound movement targeting the pectoralis major.",
    formTips: "Keep your feet flat on the floor, retract your scapula (squeeze shoulder blades), and lower the bar to your mid-chest.",
    recommendedSets: 4,
    recommendedReps: "8-12"
  },
  {
    id: 2,
    name: "Incline Dumbbell Press",
    muscleGroup: "Chest",
    secondaryMuscles: ["Front Delts", "Triceps"],
    difficulty: 2,
    equipment: "Dumbbells, Incline Bench",
    description: "Targets the clavicular head (upper portion) of the chest.",
    formTips: "Set the bench to a 30-45 degree incline. Keep your elbows tucked at roughly 45 degrees relative to your torso.",
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    id: 3,
    name: "Cable Crossover",
    muscleGroup: "Chest",
    secondaryMuscles: ["Front Delts"],
    difficulty: 1,
    equipment: "Cable Machine",
    description: "An isolation exercise that provides constant tension on the chest fibers.",
    formTips: "Stand with one foot forward. Squeeze the chest together at the bottom of the movement and control the return path.",
    recommendedSets: 3,
    recommendedReps: "12-15"
  },
  {
    id: 4,
    name: "Push-Ups",
    muscleGroup: "Chest",
    secondaryMuscles: ["Triceps", "Core"],
    difficulty: 1,
    equipment: "Bodyweight",
    description: "The fundamental bodyweight movement for upper body pressing strength.",
    formTips: "Maintain a straight plank position from head to heels. Don't let your hips sag or elbow flare out widely.",
    recommendedSets: 3,
    recommendedReps: "15-20"
  },
  {
    id: 5,
    name: "Chest Dips",
    muscleGroup: "Chest",
    secondaryMuscles: ["Triceps", "Front Delts"],
    difficulty: 3,
    equipment: "Parallel Bars",
    description: "An advanced bodyweight pressing exercise targeting lower chest.",
    formTips: "Lean forward slightly to shift load from triceps to chest. Lower yourself until shoulders are slightly below elbow height.",
    recommendedSets: 3,
    recommendedReps: "8-12"
  },
  {
    id: 6,
    name: "Dumbbell Pullover",
    muscleGroup: "Chest",
    secondaryMuscles: ["Lats", "Serratus Anterior"],
    difficulty: 2,
    equipment: "Dumbbell, Flat Bench",
    description: "Targets the chest and back through a shoulder extension motion.",
    formTips: "Lie across the bench. Keep your core tight and arms mostly straight as you lower the weight behind your head.",
    recommendedSets: 3,
    recommendedReps: "12"
  },

  // BACK (5)
  {
    id: 7,
    name: "Pull-Ups",
    muscleGroup: "Back",
    secondaryMuscles: ["Biceps", "Forearms"],
    difficulty: 3,
    equipment: "Pull-Up Bar",
    description: "The ultimate vertical pulling exercise for a wide upper back.",
    formTips: "Hang with hands slightly wider than shoulder-width. Drive elbows down towards your hips to pull chest to the bar.",
    recommendedSets: 4,
    recommendedReps: "6-10"
  },
  {
    id: 8,
    name: "Barbell Bent-Over Row",
    muscleGroup: "Back",
    secondaryMuscles: ["Biceps", "Rear Delts", "Hamstrings"],
    difficulty: 3,
    equipment: "Barbell",
    description: "A heavy horizontal pull targeting back thickness and posture.",
    formTips: "Hinge at the hips keeping back flat. Pull the bar to your lower rib cage, driving elbows back.",
    recommendedSets: 4,
    recommendedReps: "8-10"
  },
  {
    id: 9,
    name: "Lat Pulldown",
    muscleGroup: "Back",
    secondaryMuscles: ["Biceps", "Rear Delts"],
    difficulty: 1,
    equipment: "Cable Pulldown Machine",
    description: "A machine-based vertical pull targeting the latissimus dorsi.",
    formTips: "Pull the bar down to your upper chest while leaning back slightly. Avoid using momentum or pulling behind neck.",
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    id: 10,
    name: "Single-Arm Dumbbell Row",
    muscleGroup: "Back",
    secondaryMuscles: ["Biceps", "Core"],
    difficulty: 2,
    equipment: "Dumbbell, Bench",
    description: "Unilateral exercise targeting lats, rhomboids, and lower trap stability.",
    formTips: "Place knee and hand on bench for support. Pull dumbbell to your hip pocket without twisting your spine.",
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    id: 11,
    name: "Deadlift",
    muscleGroup: "Back",
    secondaryMuscles: ["Hamstrings", "Glutes", "Erectors", "Traps"],
    difficulty: 3,
    equipment: "Barbell",
    description: "The ultimate compound exercise for posterior chain development.",
    formTips: "Keep bar close to shins. Hinge hips back, brace core, and drive through heels to stand. Maintain neutral spine.",
    recommendedSets: 3,
    recommendedReps: "5"
  },

  // LEGS (6)
  {
    id: 12,
    name: "Barbell Back Squat",
    muscleGroup: "Legs",
    secondaryMuscles: ["Glutes", "Hamstrings", "Core"],
    difficulty: 3,
    equipment: "Barbell, Squat Rack",
    description: "The king of lower body compound exercises, targeting quadriceps.",
    formTips: "Keep chest up and knees tracking over toes. Descend until thighs are at least parallel to floor.",
    recommendedSets: 4,
    recommendedReps: "6-10"
  },
  {
    id: 13,
    name: "Romanian Deadlift (RDL)",
    muscleGroup: "Legs",
    secondaryMuscles: ["Hamstrings", "Glutes", "Lower Back"],
    difficulty: 2,
    equipment: "Barbell or Dumbbells",
    description: "Targets the hamstring and glute connection via hip hinging.",
    formTips: "Hinge at hips, pushing them back with a slight bend in knees. Lower weight until hamstrings stretch, then return.",
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    id: 14,
    name: "Walking Lunges",
    muscleGroup: "Legs",
    secondaryMuscles: ["Quads", "Glutes", "Calves"],
    difficulty: 2,
    equipment: "Dumbbells",
    description: "A dynamic unilateral movement targeting balance and quad strength.",
    formTips: "Take long strides. Ensure front knee stays behind toes at the bottom of the stride.",
    recommendedSets: 3,
    recommendedReps: "12-15 (per leg)"
  },
  {
    id: 15,
    name: "Leg Press",
    muscleGroup: "Legs",
    secondaryMuscles: ["Glutes", "Hamstrings"],
    difficulty: 1,
    equipment: "Leg Press Machine",
    description: "Isolates legs by removing spine load from the equation.",
    formTips: "Place feet shoulder-width on plate. Lower until knees form a 90-degree angle. Do not lock out knees at top.",
    recommendedSets: 4,
    recommendedReps: "10-15"
  },
  {
    id: 16,
    name: "Leg Extensions",
    muscleGroup: "Legs",
    secondaryMuscles: [],
    difficulty: 1,
    equipment: "Leg Extension Machine",
    description: "An isolation exercise that puts focused tension on the quadriceps.",
    formTips: "Align your knees with the pivot point of the machine. Squeeze at the top of the extension for a full contraction.",
    recommendedSets: 3,
    recommendedReps: "12-15"
  },
  {
    id: 17,
    name: "Standing Calf Raises",
    muscleGroup: "Legs",
    secondaryMuscles: [],
    difficulty: 1,
    equipment: "Calf Block or Machine",
    description: "Targets the gastrocnemius muscle of the calf.",
    formTips: "Use a full range of motion. Pause at bottom for a deep stretch, and squeeze hard at the top.",
    recommendedSets: 4,
    recommendedReps: "15-20"
  },

  // ARMS (5)
  {
    id: 18,
    name: "Dumbbell Bicep Curl",
    muscleGroup: "Arms",
    secondaryMuscles: ["Forearms"],
    difficulty: 1,
    equipment: "Dumbbells",
    description: "The classic isolation exercise for bicep growth.",
    formTips: "Keep elbows pinned to your sides. Rotate palms upward as you lift, squeezing the bicep at the top.",
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    id: 19,
    name: "Tricep Overhead Extension",
    muscleGroup: "Arms",
    secondaryMuscles: [],
    difficulty: 2,
    equipment: "Dumbbell or Cables",
    description: "Targets the long head of the triceps by placing the shoulder in flexion.",
    formTips: "Hold dumbbell with both hands overhead. Lower dumbbell behind head keeping elbows pointed forward.",
    recommendedSets: 3,
    recommendedReps: "12"
  },
  {
    id: 20,
    name: "Hammer Curl",
    muscleGroup: "Arms",
    secondaryMuscles: ["Brachialis", "Forearms"],
    difficulty: 1,
    equipment: "Dumbbells",
    description: "Develops upper arm thickness by targeting the brachialis and brachioradialis.",
    formTips: "Perform curls with a neutral grip (palms facing each other). Control the eccentric drop.",
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    id: 21,
    name: "Tricep Pushdown",
    muscleGroup: "Arms",
    secondaryMuscles: [],
    difficulty: 1,
    equipment: "Cable Machine, Rope",
    description: "Isolates the lateral and medial heads of the triceps.",
    formTips: "Keep chest tall, elbows close to ribs. Push rope down, flaring ends apart at the bottom contraction.",
    recommendedSets: 3,
    recommendedReps: "12-15"
  },
  {
    id: 22,
    name: "Preacher Curl",
    muscleGroup: "Arms",
    secondaryMuscles: ["Forearms"],
    difficulty: 2,
    equipment: "EZ Bar, Preacher Bench",
    description: "Prevents body momentum, forcing the biceps to do all the work.",
    formTips: "Rest arms fully flat on pad. Keep shoulders relaxed and avoid rolling forward during extension.",
    recommendedSets: 3,
    recommendedReps: "8-10"
  },

  // SHOULDERS (5)
  {
    id: 23,
    name: "Overhead Barbell Press",
    muscleGroup: "Shoulders",
    secondaryMuscles: ["Triceps", "Upper Chest", "Core"],
    difficulty: 3,
    equipment: "Barbell",
    description: "The primary vertical press for building shoulder strength and size.",
    formTips: "Brace glutes and core. Press bar straight up, pulling head slightly back initially then forward at lockout.",
    recommendedSets: 4,
    recommendedReps: "6-8"
  },
  {
    id: 24,
    name: "Dumbbell Lateral Raise",
    muscleGroup: "Shoulders",
    secondaryMuscles: [],
    difficulty: 1,
    equipment: "Dumbbells",
    description: "Isolates the lateral deltoid to widen shoulder silhouette.",
    formTips: "Tilt torso slightly forward. Raise weights to sides leading with elbows. Keep palms facing down.",
    recommendedSets: 4,
    recommendedReps: "12-15"
  },
  {
    id: 25,
    name: "Rear Delt Fly",
    muscleGroup: "Shoulders",
    secondaryMuscles: ["Rhomboids", "Traps"],
    difficulty: 2,
    equipment: "Dumbbells, Bench",
    description: "Targets the posterior deltoid for overall shoulder balance.",
    formTips: "Incline bench facing down or hinge torso. Drive arms out sideways to squeeze rear shoulder cap.",
    recommendedSets: 3,
    recommendedReps: "15"
  },
  {
    id: 26,
    name: "Face Pulls",
    muscleGroup: "Shoulders",
    secondaryMuscles: ["Rear Delts", "Rotator Cuff", "Traps"],
    difficulty: 1,
    equipment: "Cable Machine, Rope",
    description: "Excellent for posterior chain posture and rotator cuff health.",
    formTips: "Set cable to eye height. Pull rope towards face, pulling hands wide to contract upper back.",
    recommendedSets: 3,
    recommendedReps: "15"
  },
  {
    id: 27,
    name: "Dumbbell Arnold Press",
    muscleGroup: "Shoulders",
    secondaryMuscles: ["Triceps"],
    difficulty: 2,
    equipment: "Dumbbells, Bench",
    description: "A press variant that rotates shoulders to target all deltoid heads.",
    formTips: "Start with palms facing you. Rotate hands as you press overhead, finishing with palms facing forward.",
    recommendedSets: 3,
    recommendedReps: "10"
  },

  // CORE (5)
  {
    id: 28,
    name: "Hanging Leg Raise",
    muscleGroup: "Core",
    secondaryMuscles: ["Hip Flexors", "Grip Strength"],
    difficulty: 3,
    equipment: "Pull-Up Bar",
    description: "Targets the rectus abdominis, specifically the lower abdominal fibers.",
    formTips: "Avoid swinging. Slowly raise your feet or knees up to hip height using abdominal compression.",
    recommendedSets: 3,
    recommendedReps: "10-12"
  },
  {
    id: 29,
    name: "Cable Crunch",
    muscleGroup: "Core",
    secondaryMuscles: [],
    difficulty: 2,
    equipment: "Cable Machine, Rope",
    description: "Provides constant progressive tension to overload the abdominal wall.",
    formTips: "Kneel down. Hinge at spine rather than hips, bringing elbows down towards thighs to contract abs.",
    recommendedSets: 3,
    recommendedReps: "15"
  },
  {
    id: 30,
    name: "Plank",
    muscleGroup: "Core",
    secondaryMuscles: ["Shoulders", "Glutes"],
    difficulty: 1,
    equipment: "Bodyweight",
    description: "Isometric core hold targeting deep stabilizers (transverse abdominis).",
    formTips: "Keep elbows under shoulders. Squeeze glutes, quads, and draw belly button inward.",
    recommendedSets: 3,
    recommendedReps: "60 seconds"
  },
  {
    id: 31,
    name: "Russian Twist",
    muscleGroup: "Core",
    secondaryMuscles: ["Obliques"],
    difficulty: 1,
    equipment: "Medicine Ball or Plate",
    description: "Rotational core exercise targeting internal and external obliques.",
    formTips: "Sit with knees bent, feet off floor. Rotate shoulders side to side with controlled posture.",
    recommendedSets: 3,
    recommendedReps: "20 (total)"
  },
  {
    id: 32,
    name: "Ab Wheel Rollout",
    muscleGroup: "Core",
    secondaryMuscles: ["Lats", "Shoulders"],
    difficulty: 3,
    equipment: "Ab Wheel",
    description: "An advanced eccentric core extension exercise.",
    formTips: "Keep back rounded (hollow body posture). Roll wheel out, bracing core, then pull back using abs.",
    recommendedSets: 3,
    recommendedReps: "8-10"
  }
];
