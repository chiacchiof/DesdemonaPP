const T1 = 'Task 1';
const T2 = 'Task 2';
const T3 = 'Task 3';
const T4 = 'Task 4';
const T5 = 'Task 5';
const T6 = 'Task 6';
const T7 = 'Task 7';
const T8 = 'Task 8';
const T9 = 'Task 9';
const T10 = 'Task 10';
const T11 = 'Task 11';
const T12 = 'Task 12';
const T13 = 'Task 13';
const T14 = 'Task 14';
const T15 = 'Task 15';
const T16 = 'Task 16';
const T17 = 'Task 17';
const T18 = 'Task 18';
const T19 = 'Task 19';
const T20 = 'Task 20';
const T21 = 'Task 21';


const taskNameToKey = {
    'Task 1': 'T1',
    'Task 2': 'T2',
    'Task 3': 'T3',
    'Task 4': 'T4',
    'Task 5': 'T5',
    'Task 6': 'T6',
    'Task 7': 'T7',
    'Task 8': 'T8',
    'Task 9': 'T9',
    'Task 10': 'T10',
    'Task 11': 'T11',
    'Task 12': 'T12',
    'Task 13': 'T13',
    'Task 14': 'T14',
    'Task 15': 'T15',
    'Task 16': 'T16',
    'Task 17': 'T17',
    'Task 18': 'T18',
    'Task 19': 'T19',
    'Task 20': 'T20',
    'Task 21': 'T21'
};


const F1 = 'Feature 1';
const F2 = 'Feature 2';
const F3 = 'Feature 3';
const F4 = 'Feature 4';
const F5 = 'Feature 5';
const F6 = 'Feature 6';
const F7 = 'Feature 7';
const F8 = 'Feature 8';
const F9 = 'Feature 9';

const featureMapping = {
    F1: 'Feature 1',
    F2: 'Feature 2',
    F3: 'Feature 3',
    F4: 'Feature 4',
    F5: 'Feature 5',
    F6: 'Feature 6',
    F7: 'Feature 7',
    F8: 'Feature 8',
    F9: 'Feature 9'
};


const features = [
    F1,
    F2,
    F3,
    F4,
    F5,
    F6,
    F7,
    F8,
    F9
];


const tasks = {
    T1: {F1: 8, F2: 7, F3: 7},  // Requires good memory, training, and education to interpret data trends
    T2: {F2: 6, F3: 7, F9: 8},  // Requires training, education, and manual dexterity for image comparison
    T3: {F2: 6, F8: 8, F9: 7},  // Requires training, safety observance, and manual dexterity for physical inspection
    T4: {F2: 8, F5: 7, F9: 8},  // Requires high training, organizational skills, and manual dexterity for mechanical repairs
    T5: {F2: 8, F4: 7, F8: 8},  // Requires high training, ability to work under stress, and safety observance for electrical repairs
    T6: {F2: 7, F5: 6, F8: 8},  // Requires training, organizational skills, and safety observance for technical control
    T7: {F1: 6, F3: 7, F8: 5},  // Requires memory, education, and safety observance for monitoring values
    T8: {F2: 8, F8: 9, F9: 8},  // Requires high training, safety observance, and manual dexterity for precision cleaning
    T9: {F2: 7, F8: 6, F9: 7},  // Requires training, safety observance, and manual dexterity for general cleaning
    T10: {F2: 7, F5: 6, F9: 8}, // Requires training, organizational skills, and manual dexterity for micro-component replacement
    T11: {F4: 7, F7: 6, F9: 8}, // Requires ability to work under stress, decision-making, and manual dexterity for disassembly
    T12: {F4: 8, F7: 7, F9: 6}, // Requires ability to work under stress, decision-making, and manual dexterity for macro-component replacement
    T13: {F4: 8, F5: 7, F9: 7}, // Requires ability to work under stress, organizational skills, and manual dexterity for reassembly
    T14: {F2: 8, F5: 6, F8: 8}, // Requires high training, organizational skills, and safety observance for lock out/tag out
    T15: {F2: 7, F8: 8, F9: 7}, // Requires training, safety observance, and manual dexterity for mechanical isolation
    T16: {F2: 7, F8: 8, F9: 6}, // Requires training, safety observance, and manual dexterity for electrical isolation
    T17: {F2: 7, F5: 6, F9: 8}, // Requires training, organizational skills, and manual dexterity for mechanical reconnection
    T18: {F2: 7, F8: 8, F9: 7}, // Requires training, safety observance, and manual dexterity for electrical reconnection
    T19: {F2: 8, F5: 7, F8: 7}, // Requires high training, organizational skills, and safety observance for test performance
    T20: {F2: 8, F6: 7, F8: 6}, // Requires high training, soft skills, and safety observance for certification of maintenance activities
    T21: {F2: 6, F8: 7, F9: 8}  // Requires training, safety observance, and manual dexterity for lubrication
};

const maintenanceActivities = {
    OIL_AND_GAS: {
        ACTIVITY_1: [
            T3,
            T6,
            T19,
            T1
        ],
        ACTIVITY_2: [
            T3,
            T8,
            T7,
            T4
        ],
        ACTIVITY_3: [
            T3,
            T10,
            T15,
            T19
        ],
        ACTIVITY_4: [
            T3,
            T9,
            T6,
            T19
        ]
    },
    WIND_ENERGY: {
        ACTIVITY_1: [
            T3,
            T2,
            T4,
            T8
        ],
        ACTIVITY_2: [
            T3,
            T21,
            T7,
            T12
        ],
        ACTIVITY_3: [
            T3,
            T6,
            T1,
            T19
        ],
        ACTIVITY_4: [
            T3,
            T16,
            T7,
            T19
        ]
    },
    ELECTRICAL_CONSTRUCTIONS: {
        ACTIVITY_1: [
            T3,
            T16,
            T19,
            T20
        ],
        ACTIVITY_2: [
            T3,
            T16,
            T7,
            T10
        ],
        ACTIVITY_3: [
            T3,
            T9,
            T6,
            T19
        ],
        ACTIVITY_4: [
            T3,
            T16,
            T10,
            T19
        ]
    },
    PIPING_CONSTRUCTION: {
        ACTIVITY_1: [
            T3,
            T6,
            T19,
            T20
        ],
        ACTIVITY_2: [
            T3,
            T15,
            T19,
            T1
        ],
        ACTIVITY_3: [
            T3,
            T12,
            T17,
            T19
        ],
        ACTIVITY_4: [
            T3,
            T8,
            T15,
            T19
        ]
    },
    COMPRESSORS: {
        ACTIVITY_1: [
            T3,
            T6,
            T7,
            T19
        ],
        ACTIVITY_2: [
            T3,
            T8,
            T7,
            T10
        ],
        ACTIVITY_3: [
            T3,
            T9,
            T10,
            T19
        ],
        ACTIVITY_4: [
            T3,
            T15,
            T19,
            T20
        ]
    }
};



const generateRandomFeatures = (bias = 0) => {
    return features.reduce((acc, feature) => {
        acc[feature] = (bias + (Math.random() * (10-bias))).toFixed(2);
        return acc;
    }, {});
};

const operators = [
    {
        name: "Operator 1",
        features: generateRandomFeatures(7)
    },
    {
        name: "Operator 2",
        features: generateRandomFeatures(7)
    },
    {
        name: "Operator 3",
        features: generateRandomFeatures(7)
    },
    {
        name: "Operator 4",
        features: generateRandomFeatures(7)
    },
    {
        name: "Operator 5",
        features: generateRandomFeatures(7)
    },
    {
        name: "Operator 6",
        features: generateRandomFeatures(7)
    },
    {
        name: "Operator 7",
        features: generateRandomFeatures(7)
    }
    ,
    {
        name: "Operator 8",
        features: generateRandomFeatures(7)
    }
    ,
    {
        name: "Operator 9",
        features: generateRandomFeatures(7)
    }
    ,
    {
        name: "Operator 10",
        features: generateRandomFeatures(7)
    }

];


module.exports = { operators, maintenanceActivities, tasks, features, taskNameToKey, featureMapping };
