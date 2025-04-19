// Definizione delle costanti task e loro nomi
const ACTIVITY_DEFINITIONS = {
  ACTIVITY_1: "PREVENTIVE MAINTENANCE OF THE REVERSE OSMOSIS WATER PURIFICATION SYSTEM",
  ACTIVITY_2: "INSPECTION AND MAINTENANCE OF THE GLYCOL COOLING SYSTEM",
  ACTIVITY_3: "BREAKDOWN MAINTENANCE OF THE CENTIFUGAL PUMP",
  ACTIVITY_4: "AUTONOMOUS MAINTENANCE IN ASSELA MALT FACTORY",
  ACTIVITY_5: "GENERAL MAINTENANCE OF MOTORS",
  ACTIVITY_6: "MAINTENANCE ROUTINE TO CHECK LEAK IN VACUUM CHAMBER",
  ACTIVITY_7: "GENERAL MAINTENANCE OF STEAM TRAPS",
  ACTIVITY_8: "COMPRESSOR MAINTENANCE",
};

const TASK_DEFINITIONS = {
  T1: "Interpretation of data trend",
  T2: "Visual inspection based on image comparison",
  T3: "Visual inspection based on the physical component 1",
  T3_1: "Visual inspection based on the physical component 2",
  T3_2: "Visual inspection based on the physical component 3",
  T3_3: "Visual inspection based on the physical component 4",
  T4: "Repair of mechanical failures",
  T5: "Repair of an electrical fault",
  T6: "Control using technical instrumentation 1",
  T6_1: "Control using technical instrumentation 2",
  T6_2: "Control using technical instrumentation 3",
  T6_3: "Control using technical instrumentation 4",
  T7: "Monitoring of single values 1",
  T7_1: "Monitoring of single values 2",
  T7_2: "Monitoring of single values 3",
  T7_3: "Monitoring of single values 4",
  T8: "Precision cleaning",
  T9: "General cleaning",
  T10: "(Preventive) replacement of micro-components",
  T11: "System disassembly",
  T12: "(Preventive) replacement of macro-components",
  T13: "System reassembly",
  T14: "Lock out/tag out",
  T15: "Mechanical isolation",
  T16: "Electrical isolation",
  T17: "Mechanical reconnection",
  T18: "Electrical reconnection",
  T19: "Test performance",
  T20: "Certification of maintenance activities performed",
  T20_1: "Certification of maintenance activities performed 1"
};

// Definizione delle costanti feature e loro nomi
const FEATURE_DEFINITIONS = {
  F1: "Memory",
  F2: "Lev. Profes Train",
  F3: "Lev. Educ.",
  F4: "Work U. Press.",
  F5: "Workload Man.",
  F6: "Soft Skills",
  F7: "Dec. Making",
  F8: "Observance",
  F9: "Manual Dex."
};


// Genera le costanti individuali T1, T2, ecc.
Object.entries(TASK_DEFINITIONS).forEach(([key, value]) => {
  global[key] = value;
});

// Genera automaticamente taskNameToKey invertendo TASK_DEFINITIONS
const taskNameToKey = Object.entries(TASK_DEFINITIONS).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});



// Genera le costanti individuali F1, F2, ecc.
Object.entries(FEATURE_DEFINITIONS).forEach(([key, value]) => {
  global[key] = value;
});

// Genera featureMapping direttamente da FEATURE_DEFINITIONS
const featureMapping = { ...FEATURE_DEFINITIONS };

// Genera features array
const features = Object.values(FEATURE_DEFINITIONS);

const tasks = {
  T1: {
    F1: 3.313,
    F2: 4.5,
    F3: 3.75,
    F4: 3.813,
    F5: 3.375,
    F6: 3.125,
    F7: 3.813,
    F8: 3.5,
    F9: 3.0,
  },
  T2: {
    F1: 3.625,
    F2: 4.25,
    F3: 3.5,
    F4: 3.375,
    F5: 3.188,
    F6: 3.125,
    F7: 3.813,
    F8: 3.5,
    F9: 2.875,
  },
  T3: {
    F1: 3.875,
    F2: 4.563,
    F3: 3.438,
    F4: 3.438,
    F5: 3.375,
    F6: 3.125,
    F7: 3.938,
    F8: 3.938,
    F9: 3.875,
  },
  T3_1: {
    F1: 3.875,
    F2: 4.563,
    F3: 3.438,
    F4: 3.438,
    F5: 3.375,
    F6: 3.125,
    F7: 3.938,
    F8: 3.938,
    F9: 3.875,
  },
  T3_2: {
    F1: 3.875,
    F2: 4.563,
    F3: 3.438,
    F4: 3.438,
    F5: 3.375,
    F6: 3.125,
    F7: 3.938,
    F8: 3.938,
    F9: 3.875,
  },
  T3_3: {
    F1: 3.875,
    F2: 4.563,
    F3: 3.438,
    F4: 3.438,
    F5: 3.375,
    F6: 3.125,
    F7: 3.938,
    F8: 3.938,
    F9: 3.875,
  },
  T4: {
    F1: 3.813,
    F2: 4.875,
    F3: 3.563,
    F4: 4.125,
    F5: 4.25,
    F6: 3.75,
    F7: 4.25,
    F8: 4.688,
    F9: 4.813,
  },
  T5: {
    F1: 4.0,
    F2: 4.75,
    F3: 3.938,
    F4: 4.188,
    F5: 4.188,
    F6: 3.5,
    F7: 4.313,
    F8: 4.75,
    F9: 4.75,
  },
  T6: {
    F1: 3.375,
    F2: 4.5,
    F3: 3.938,
    F4: 3.5,
    F5: 3.625,
    F6: 3.125,
    F7: 3.813,
    F8: 4.25,
    F9: 3.75,
  },
  T6_1: {
    F1: 3.375,
    F2: 4.5,
    F3: 3.938,
    F4: 3.5,
    F5: 3.625,
    F6: 3.125,
    F7: 3.813,
    F8: 4.25,
    F9: 3.75,
  },
  T6_2: {
    F1: 3.375,
    F2: 4.5,
    F3: 3.938,
    F4: 3.5,
    F5: 3.625,
    F6: 3.125,
    F7: 3.813,
    F8: 4.25,
    F9: 3.75,
  },
  T6_3: {
    F1: 3.375,
    F2: 4.5,
    F3: 3.938,
    F4: 3.5,
    F5: 3.625,
    F6: 3.125,
    F7: 3.813,
    F8: 4.25,
    F9: 3.75,
  },
  T7: {
    F1: 3.75,
    F2: 4.375,
    F3: 3.938,
    F4: 3.375,
    F5: 3.688,
    F6: 3.375,
    F7: 3.563,
    F8: 3.813,
    F9: 3.0,
  },
  T7_1: {
    F1: 3.75,
    F2: 4.375,
    F3: 3.938,
    F4: 3.375,
    F5: 3.688,
    F6: 3.375,
    F7: 3.563,
    F8: 3.813,
    F9: 3.0,
  },
  T7_2: {
    F1: 3.75,
    F2: 4.375,
    F3: 3.938,
    F4: 3.375,
    F5: 3.688,
    F6: 3.375,
    F7: 3.563,
    F8: 3.813,
    F9: 3.0,
  },
  T7_3: {
    F1: 3.75,
    F2: 4.375,
    F3: 3.938,
    F4: 3.375,
    F5: 3.688,
    F6: 3.375,
    F7: 3.563,
    F8: 3.813,
    F9: 3.0,
  },
  T8: {
    F1: 3.0,
    F2: 3.875,
    F3: 3.125,
    F4: 3.438,
    F5: 3.938,
    F6: 3.313,
    F7: 3.313,
    F8: 4.25,
    F9: 4.5,
  },
  T9: {
    F1: 3.063,
    F2: 3.875,
    F3: 2.688,
    F4: 3.25,
    F5: 3.813,
    F6: 3.063,
    F7: 3.125,
    F8: 4.313,
    F9: 4.438,
  },
  T10: {
    F1: 3.625,
    F2: 4.688,
    F3: 3.875,
    F4: 4.25,
    F5: 4.063,
    F6: 3.063,
    F7: 4.0,
    F8: 4.313,
    F9: 4.75,
  },
  T11: {
    F1: 3.75,
    F2: 4.375,
    F3: 3.188,
    F4: 3.625,
    F5: 3.813,
    F6: 3.563,
    F7: 3.75,
    F8: 4.438,
    F9: 4.75,
  },
  T12: {
    F1: 3.625,
    F2: 4.438,
    F3: 3.5,
    F4: 3.563,
    F5: 3.875,
    F6: 3.438,
    F7: 3.875,
    F8: 4.563,
    F9: 4.625,
  },
  T13: {
    F1: 4.0,
    F2: 4.625,
    F3: 3.438,
    F4: 3.688,
    F5: 3.938,
    F6: 3.125,
    F7: 3.688,
    F8: 4.375,
    F9: 4.688,
  },
  T14: {
    F1: 3.938,
    F2: 4.5,
    F3: 3.688,
    F4: 4.0,
    F5: 4.188,
    F6: 3.313,
    F7: 4.313,
    F8: 4.688,
    F9: 3.375,
  },
  T15: {
    F1: 3.875,
    F2: 4.438,
    F3: 3.563,
    F4: 3.813,
    F5: 3.813,
    F6: 3.25,
    F7: 3.938,
    F8: 4.688,
    F9: 4.188,
  },
  T16: {
    F1: 3.5,
    F2: 4.75,
    F3: 3.938,
    F4: 4.313,
    F5: 4.063,
    F6: 3.438,
    F7: 4.125,
    F8: 4.75,
    F9: 4.563,
  },
  T17: {
    F1: 3.813,
    F2: 4.5,
    F3: 3.5,
    F4: 3.75,
    F5: 3.875,
    F6: 3.313,
    F7: 3.813,
    F8: 4.563,
    F9: 4.438,
  },
  T18: {
    F1: 3.813,
    F2: 4.5,
    F3: 3.625,
    F4: 4.125,
    F5: 3.813,
    F6: 3.438,
    F7: 3.875,
    F8: 4.75,
    F9: 4.5,
  },
  T19: {
    F1: 3.813,
    F2: 4.688,
    F3: 4.0,
    F4: 3.625,
    F5: 4.188,
    F6: 3.75,
    F7: 3.813,
    F8: 4.563,
    F9: 3.375,
  },
  T20: {
    F1: 3.938,
    F2: 4.688,
    F3: 4.313,
    F4: 3.125,
    F5: 4.188,
    F6: 3.75,
    F7: 3.75,
    F8: 4.063,
    F9: 2.875,
  },
  T20_1: {
    F1: 3.938,
    F2: 4.688,
    F3: 4.313,
    F4: 3.125,
    F5: 4.188,
    F6: 3.75,
    F7: 3.75,
    F8: 4.063,
    F9: 2.875,
  }
};

// Definizione delle attività di manutenzione
const maintenanceActivities = {
  ACTIVITY_1: {
    ACTIVITY_1: [T15, T16, T11, T10, T13, T9, T17, T18, T7, T7_1, T20] 
  },

  ACTIVITY_2: {
    ACTIVITY_2: [T15, T16, T11, T8, T10, T7, T7_1, T6, T6_1, T17, T18, T20]
  },
  
  ACTIVITY_3: { 
    ACTIVITY_3: [T15, T16, T3, T1, T12, T17, T18, T19, T20]
  },

  ACTIVITY_4: {
    ACTIVITY_4: [T16, T7, T7_1, T3, T6, T6_1, T7_2, T6_2, T3_1, T18, T7_3, T1, T15, T18, T6_2, T3_2, T6_3, T20, T20_1],
  },

  ACTIVITY_5: {
    ACTIVITY_5: [T3, T16, T9, T3, T8, T18, T6, T7, T1, T19, T20],
  },
  ACTIVITY_6: {
    ACTIVITY_6: [T15, T3, T10, T8, T6, T12, T3_1, T13, T19,],
  },
  ACTIVITY_7: {
    ACTIVITY_7: [T3, T3_1, T3_2, T7, T9, T3_3, T12, T4, T19, T20],
  },

  ACTIVITY_8: {
    ACTIVITY_1: [T3, T6, T7, T19],
    ACTIVITY_2: [T3, T8, T7, T10],
    ACTIVITY_3: [T3, T9, T10, T19],
    ACTIVITY_4: [T3, T15, T19, T20],
  },
};

// Funzione generateRandomFeatures rimane invariata
const generateRandomFeatures = (bias = 0) => {
  return features.reduce((acc, feature) => {
      acc[feature] = (bias + Math.random() * (5 - bias)).toFixed(3);
      return acc;
  }, {});
};

const operators = [
  {
    name: "Operator 1",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 2",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 3",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 4",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 5",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 6",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 7",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 8",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 9",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 10",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 11",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 12",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 13",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 14",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 15",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 16",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 17",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 18",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 19",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 20",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 21",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 22",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 23",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 24",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 25",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 26",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 27",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 28",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 29",
    features: generateRandomFeatures(3),
  },
  {
    name: "Operator 30",
    features: generateRandomFeatures(3)
  }
];

module.exports = {
  operators,
  maintenanceActivities,
  tasks,
  features,
  taskNameToKey,
  featureMapping,
  // Aggiungiamo anche le definizioni originali se servono
  TASK_DEFINITIONS,
  FEATURE_DEFINITIONS,
  ACTIVITY_DEFINITIONS
};

