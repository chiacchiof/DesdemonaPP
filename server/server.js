const express = require('express');
const path = require('path');
const ExcelJS = require('exceljs');
const { activities, operators, maintenanceActivities } = require('./config');
const DesBrain = require('./src/DesBrain');
const DesBrainV2 = require('./src/DesBrainV2');
const DesGeneralApi = require('./src/DesGeneralApi');
const Simulation = require('./src/Simulation');
const cors = require('cors');
const fs = require('fs');
const { verifyToken } = require('./firebase-admin');
const admin = require('firebase-admin');

const app = express();

// Use the environment's port or default to 5000
const port = process.env.PORT || 5000;

// Determine allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://dss-desdemona.onrender.com', 'https://desdemonapp.onrender.com']
    : ['http://localhost:3000', 'https://desdemonapp.onrender.com'];

// Update CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// All'inizio del file server.js, dopo gli import
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    console.log('Creating data directory...');
    try {
        fs.mkdirSync(dataDir, { recursive: true });
    } catch (error) {
        console.error('Error creating data directory:', error);
    }
}

// Initialize config.json in data directory if it doesn't exist
const configPath = path.join(__dirname, 'data', 'config.json');
if (!fs.existsSync(configPath)) {
    console.log('Creating initial config.json from config.js...');
    const defaultConfig = require('./config');
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4), 'utf8');
}

// Load config from JSON file
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// API route to serve the configuration
app.get('/api/config', (req, res) => {
    try {
        const configPath = path.join(__dirname, 'data', 'config.json');
        
        // Check if config.json exists
        if (!fs.existsSync(configPath)) {
            // If not, use the default config.js
            const defaultConfig = require('./config');
            // Save it as config.json for future use
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4), 'utf8');
            return res.json(defaultConfig);
        }

        // Read the current config.json
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        res.json(config);

    } catch (error) {
        console.error('Error loading configuration:', error);
        res.status(500).json({ 
            error: 'Failed to load configuration',
            details: error.message 
        });
    }
});

// Add this route to server.js
app.put('/api/modifyOperatorFeature', async (req, res) => {
    try {
        const { operatorName, featureName, newValue } = req.query;
        
        // Remove the quotes from the parameters
        const cleanOperatorName = operatorName.replace(/"/g, '');
        const cleanFeatureName = featureName.replace(/"/g, '');
        const cleanNewValue = parseFloat(newValue.replace(/[']/g, ''));
        
        // Input validation
        if (!cleanOperatorName || !cleanFeatureName || cleanNewValue === undefined) {
            return res.status(400).json({ 
                error: 'Missing required parameters. Need operatorName, featureName, and newValue' 
            });
        }

        // Verifica il token se presente
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decodedToken = await verifyToken(token);
            if (decodedToken) {
                const admin = require('firebase-admin');
                const userConfigRef = admin.firestore().collection('userConfigs').doc(decodedToken.uid);
                const userDoc = await userConfigRef.get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    let updatedConfig = {...userData.config};
                    const operator = updatedConfig.operators.find(op => op.name === cleanOperatorName);
                    
                    if (operator) {
                        operator.features[cleanFeatureName] = cleanNewValue;

                        await userConfigRef.update({
                            config: updatedConfig,
                            updatedAt: new Date().toISOString()
                        });

                        return res.json({
                            success: true,
                            message: `Successfully updated ${cleanFeatureName} for ${cleanOperatorName} in Firebase`,
                            updatedOperator: operator
                        });
                    }
                }
                return res.status(404).json({ error: 'User configuration or operator not found' });
            }
        }

        // Se non c'è token o non è valido, usa la logica del server
        const updatedOperator = DesGeneralApi.modifyOperatorFeature(cleanOperatorName, cleanFeatureName, cleanNewValue);
        
        res.json({ 
            success: true, 
            message: `Successfully updated ${cleanFeatureName} for ${cleanOperatorName} in server configuration`,
            updatedOperator 
        });

    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.put('/api/modifyOperatorFeatures/bulk', async (req, res) => {
    try {
        const { operatorName, features } = req.body;
        
        if (!operatorName || !features || !Array.isArray(features)) {
            return res.status(400).json({ 
                error: 'Invalid request. Need operatorName and features array' 
            });
        }

        // Verifica il token se presente
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decodedToken = await verifyToken(token);
            if (decodedToken) {
                // L'utente è autenticato, modifica la configurazione su Firebase
                const admin = require('firebase-admin');
                const userConfigRef = admin.firestore().collection('userConfigs').doc(decodedToken.uid);
                const userDoc = await userConfigRef.get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    let updatedConfig = {...userData.config};
                    const operator = updatedConfig.operators.find(op => op.name === operatorName);
                    
                    if (operator) {
                        features.forEach(({ featureName, newValue }) => {
                            operator.features[featureName] = newValue;
                        });

                        await userConfigRef.update({
                            config: updatedConfig,
                            updatedAt: new Date().toISOString()
                        });

                        return res.json({
                            success: true,
                            message: `Updated features for ${operatorName} in Firebase configuration`,
                            operator
                        });
                    }
                }
                return res.status(404).json({ 
                    success: false, 
                    error: 'User configuration or operator not found' 
                });
            }
        }

        // Se non c'è token o non è valido, modifica la configurazione del server
        let updatedOperator = null;
        const updateResults = [];

        features.forEach(({ featureName, newValue }) => {
            try {
                updatedOperator = DesGeneralApi.modifyOperatorFeature(operatorName, featureName, newValue);
                updateResults.push({
                    featureName,
                    success: true
                });
            } catch (error) {
                updateResults.push({
                    featureName,
                    success: false,
                    error: error.message
                });
            }
        });

        const featuresString = Object.entries(updatedOperator.features)
            .map(([feature, value]) => `${feature}: ${value}`)
            .join(', ');

        res.json({ 
            success: true, 
            message: `Updated features for ${operatorName} in server configuration`,
            featuresMessage: `Features of ${operatorName}: ${featuresString}`,
            updateResults,
            updatedOperator
        });

    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get('/api/readOperatorFeatures', async (req, res) => {
    try {
        const operatorName = req.query['operatorName '] || req.query['operatorName'];
        
        if (!operatorName) {
            return res.status(400).json({ error: 'Missing operator name parameter' });
        }

        const cleanOperatorName = operatorName.replace(/"/g, '').trim();
        
        // Verifica il token se presente
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decodedToken = await verifyToken(token);
            if (decodedToken) {
                const admin = require('firebase-admin');
                const userConfigRef = admin.firestore().collection('userConfigs').doc(decodedToken.uid);
                const userDoc = await userConfigRef.get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const operator = userData.config.operators.find(op => op.name === cleanOperatorName);
                    
                    if (operator) {
                        const featuresString = Object.entries(operator.features)
                            .map(([feature, value]) => `${feature}: ${value}`)
                            .join(', ');

                        return res.json({ 
                            success: true, 
                            message: `Features of ${cleanOperatorName} from Firebase: ${featuresString}` 
                        });
                    }
                }
                return res.status(404).json({ error: 'User configuration or operator not found' });
            }
        }

        // Se non c'è token o non è valido, usa la logica del server
        const featuresMessage = DesGeneralApi.readOperatorFeatures(cleanOperatorName);
        
        res.json({ 
            success: true, 
            message: featuresMessage 
        });

    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Existing API routes
app.post('/api/rankOperatorSelection', (req, res) => {
    const { input, allTaskFeatures, selectedOperators } = req.body;
    const result = DesBrain.rankOperatorSelection(input, allTaskFeatures, selectedOperators);
    res.json({ message: result });
});

// Existing API routes
app.post('/api/rankOperatorSelectionFacchini', (req, res) => {
    const { input, allTaskFeatures, selectedOperators } = req.body;
    const result = DesBrainV2.rankOperatorSelectionFacchini(input, allTaskFeatures, selectedOperators);
    res.json({ message: result });
});



app.get('/api/yourFunctionFromDesBrain', (req, res) => {
    const result = DesBrain.yourFunctionFromDesBrain();
    res.json({ message: result });
});

app.post('/api/simulation', (req, res) => {
    const { numMaintenanceActivities, numActivities, numTasks, numOperators } = req.body;
    const simulation = new Simulation(numMaintenanceActivities, numActivities, numTasks, numOperators);
    const results = simulation.getSimulationResults();
    res.json({ message: results });
});

// New endpoint to download Excel file
app.post('/api/download-simulation-results', async (req, res) => {
    const { numMaintenanceActivities, numActivities, numTasks, numOperators } = req.body;
    const simulation = new Simulation(numMaintenanceActivities, numActivities, numTasks, numOperators);
    const results = simulation.getSimulationResults();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Simulation Results');

    worksheet.columns = [
        { header: 'Maintenance Activity', key: 'maintenanceActivity', width: 30 },
        { header: 'Num Activities', key: 'numActivities', width: 30 },
        { header: 'Num Tasks', key: 'numTasks', width: 30 },
        { header: 'Num Operators', key: 'numOperators', width: 30 },
        { header: 'Checked Activities', key: 'checkedActivities', width: 30 },
        { header: 'Operators', key: 'operators', width: 30 },
        { header: 'Optimal Operators', key: 'optimalOperators', width: 30 },
        { header: 'Optimal Operators Score', key: 'optimalOperatorsListScore', width: 30 },
        { header: 'Ranking Ok', key: 'rankedOk', width: 30 }
    ];

    results.forEach(result => {
        const rankedOk = result.operators.join(', ') === result.optimalOperators.rankedOperatorsList;
        worksheet.addRow({
            maintenanceActivity: result.maintenanceActivity,
            numActivities: numActivities,
            numTasks: numTasks,
            numOperators: numOperators,
            checkedActivities: JSON.stringify(result.checkedActivities, null, 2),
            operators: result.operators.join(', '),
            optimalOperators: JSON.stringify(result.optimalOperators.rankedOperatorsList, null, 2),
            optimalOperatorsListScore: JSON.stringify(result.optimalOperators.rankedOperatorsListScore, null, 2),
            rankedOk: rankedOk
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=simulation_results.xlsx');
    await workbook.xlsx.write(res);
    res.end();
});

// Additional API routes for activities, operators, and maintenanceActivities
app.get('/api/maintenanceActivities', (req, res) => {
    res.json({ maintenanceActivities });
});

app.get('/api/activities', (req, res) => {
    res.json({ activities });
});

app.get('/api/operators', (req, res) => {
    res.json({ operators });
});

app.put('/api/modifyTaskFeatures', async (req, res) => {
    try {
        const { taskKey, features } = req.body;
        
        if (!taskKey || !features || typeof features !== 'object') {
            return res.status(400).json({ 
                error: 'Invalid request. Need taskKey and features object' 
            });
        }

        // Verifica il token se presente
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decodedToken = await verifyToken(token);
            if (decodedToken) {
                const admin = require('firebase-admin');
                const userConfigRef = admin.firestore().collection('userConfigs').doc(decodedToken.uid);
                const userDoc = await userConfigRef.get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    let updatedConfig = {...userData.config};
                    
                    if (updatedConfig.tasks && updatedConfig.tasks[taskKey]) {
                        Object.assign(updatedConfig.tasks[taskKey], features);

                        await userConfigRef.update({
                            config: updatedConfig,
                            updatedAt: new Date().toISOString()
                        });

                        return res.json({
                            success: true,
                            message: `Successfully updated features for ${taskKey} in Firebase`,
                            updatedTask: {
                                taskKey,
                                features: updatedConfig.tasks[taskKey]
                            }
                        });
                    }
                }
                return res.status(404).json({ error: 'User configuration or task not found' });
            }
        }

        // Se non c'è token o non è valido, usa la logica del server
        const result = DesGeneralApi.modifyTaskFeatures(taskKey, features);
        
        res.json({ 
            success: true, 
            message: `Successfully updated features for ${taskKey} in server configuration`,
            featuresMessage: `Features of ${taskKey}: ${result.featuresString}`,
            updatedTask: {
                taskKey: result.taskKey,
                features: result.features
            }
        });

    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get('/api/readTaskFeatures', async (req, res) => {
    try {
        const { taskKey } = req.query;
        
        if (!taskKey) {
            return res.status(400).json({ 
                error: 'Invalid request. Need taskKey' 
            });
        }

        // Verifica il token se presente
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decodedToken = await verifyToken(token);
            if (decodedToken) {
                const admin = require('firebase-admin');
                const userConfigRef = admin.firestore().collection('userConfigs').doc(decodedToken.uid);
                const userDoc = await userConfigRef.get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    
                    if (userData.config.tasks && userData.config.tasks[taskKey]) {
                        const taskFeatures = userData.config.tasks[taskKey];
                        const featuresString = Object.entries(taskFeatures)
                            .map(([feature, value]) => `${feature}: ${value}`)
                            .join(', ');

                        return res.json({
                            success: true,
                            message: `Features for ${taskKey} from Firebase`,
                            task: {
                                taskKey,
                                features: taskFeatures,
                                featuresString
                            }
                        });
                    }
                }
                return res.status(404).json({ error: 'User configuration or task not found' });
            }
        }

        // Se non c'è token o non è valido, usa la logica del server
        const result = DesGeneralApi.readTaskFeatures(taskKey);
        
        res.json({ 
            success: true, 
            message: `Features for ${taskKey} from server configuration`,
            task: {
                taskKey: result.taskKey,
                features: result.features,
                featuresString: result.featuresString
            }
        });

    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Aggiungi questo endpoint al tuo file server.js

app.post('/api/addOperator', async (req, res) => {
    try {
        const { operator } = req.body;
        
        if (!operator || !operator.name || !operator.features) {
            return res.status(400).json({
                success: false,
                error: 'Invalid operator data. Name and features are required.'
            });
        }
        
        // Verifica token se presente
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            try {
                // UTENTE AUTENTICATO: Usa Firebase
                const decodedToken = await verifyToken(token);
                if (decodedToken) {
                    const admin = require('firebase-admin');
                    const userConfigRef = admin.firestore().collection('userConfigs').doc(decodedToken.uid);
                    const userDoc = await userConfigRef.get();

                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        
                        // IMPORTANTE: Verifica con la configurazione Firebase dell'utente
                        const userOperators = userData.config.operators || [];
                        const operatorExists = userOperators.some(op => op.name === operator.name);
                        
                        if (operatorExists) {
                            return res.status(400).json({
                                success: false,
                                error: `An operator with name "${operator.name}" already exists in your personal configuration.`
                            });
                        }
                        
                        // Aggiungi alla configurazione dell'utente su Firebase
                        const updatedConfig = {
                            ...userData.config,
                            operators: [...userOperators, operator]
                        };
                        
                        await userConfigRef.update({
                            config: updatedConfig,
                            updatedAt: new Date().toISOString()
                        });

                        return res.json({
                            success: true,
                            message: `Operator "${operator.name}" has been added to your personal configuration.`,
                            operator
                        });
                    }
                    return res.status(404).json({ error: 'User configuration not found' });
                }
            } catch (tokenError) {
                console.error('Token verification error:', tokenError);
                return res.status(401).json({ 
                    success: false, 
                    error: 'Authentication failed',
                    details: tokenError.message
                });
            }
        }
        
        // UTENTE NON AUTENTICATO: Usa la configurazione generale (file locale)
        const result = DesGeneralApi.addOperator(operator);
        
        return res.json({
            success: true,
            message: `Operator "${operator.name}" has been added to the server configuration.`,
            operator
        });
    } catch (error) {
        console.error('Error adding operator:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to add operator'
        });
    }
});

app.delete('/api/deleteOperator', async (req, res) => {
    try {
        const { operatorName } = req.body;
        
        if (!operatorName) {
            return res.status(400).json({
                success: false,
                error: 'Operator name is required'
            });
        }
        
        // Verifica token se presente
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            try {
                // UTENTE AUTENTICATO: Usa Firebase
                const decodedToken = await verifyToken(token);
                if (decodedToken) {
                    const admin = require('firebase-admin');
                    const userConfigRef = admin.firestore().collection('userConfigs').doc(decodedToken.uid);
                    const userDoc = await userConfigRef.get();

                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        
                        // Verifica se l'operatore esiste
                        const operatorIndex = userData.config.operators.findIndex(op => op.name === operatorName);
                        if (operatorIndex === -1) {
                            return res.status(404).json({
                                success: false,
                                error: `Operator "${operatorName}" not found in your configuration`
                            });
                        }
                        
                        // Rimuovi l'operatore
                        const updatedOperators = userData.config.operators.filter(op => op.name !== operatorName);
                        
                        // Aggiorna la configurazione
                        const updatedConfig = {
                            ...userData.config,
                            operators: updatedOperators
                        };
                        
                        await userConfigRef.update({
                            config: updatedConfig,
                            updatedAt: new Date().toISOString()
                        });

                        return res.json({
                            success: true,
                            message: `Operator "${operatorName}" has been removed from your configuration.`
                        });
                    }
                    return res.status(404).json({ error: 'User configuration not found' });
                }
            } catch (tokenError) {
                console.error('Token verification error:', tokenError);
                return res.status(401).json({ 
                    success: false, 
                    error: 'Authentication failed',
                    details: tokenError.message
                });
            }
        }
        
        // UTENTE NON AUTENTICATO: Usa la configurazione generale (file locale)
        try {
            // Implementa la cancellazione con DesGeneralApi
            const result = await DesGeneralApi.deleteOperator(operatorName);
            
            return res.json({
                success: true,
                message: `Operator "${operatorName}" has been removed from the server configuration.`
            });
        } catch (error) {
            return res.status(404).json({
                success: false,
                error: error.message || `Failed to delete operator "${operatorName}"`
            });
        }
    } catch (error) {
        console.error('Error deleting operator:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete operator'
        });
    }
});

app.get('/api/getTaskDefinitions', (req, res) => {
    try {
        const taskDefinitions = DesGeneralApi.getTaskDefinitions();
        res.json({
            success: true,
            data: taskDefinitions
        });
    } catch (error) {
        console.error('Error in /api/getTaskDefinitions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/getActivityTacom', (req, res) => {
    try {
        const { TACOM_LIST } = require('./config');
        res.json({
            success: true,
            data: TACOM_LIST
        });
    } catch (error) {
        console.error('Error in /api/getActivityTacom:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/addMaintenanceActivity', async (req, res) => {
    try {
        const { title, tacom, tasks } = req.body;
        console.log('Request body:', { title, tacom, tasks });
        
        // Verifica se l'utente è autenticato
        const authHeader = req.headers.authorization;
        console.log('Authorization header:', authHeader);
        
        if (!authHeader) {
            console.log('No authorization header provided, proceeding as unauthenticated user');
            const result = await DesGeneralApi.addMaintenanceActivity({ title, tacom, tasks });
            return res.json({
                success: true,
                title: result.title,
                tacom: result.tacom,
                tasks: result.tasks,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        const tokenParts = authHeader.split(' ');
        console.log('Token parts:', tokenParts);
        
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            console.log('Invalid authorization header format:', authHeader);
            const result = await DesGeneralApi.addMaintenanceActivity({ title, tacom, tasks });
            return res.json({
                success: true,
                title: result.title,
                tacom: result.tacom,
                tasks: result.tasks,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        const token = tokenParts[1];
        console.log('Token extracted:', token ? 'present' : 'missing');

        try {
            console.log('Verifying token...');
            const decodedToken = await verifyToken(token);
            console.log('Token verification result:', decodedToken ? 'success' : 'failed');
            
            if (!decodedToken) {
                console.log('Token verification failed');
                return res.status(401).json({ 
                    success: false,
                    error: 'Invalid token',
                    message: 'Authentication failed'
                });
            }
            
            const userId = decodedToken.uid;
            console.log('User authenticated successfully:', userId);

            const admin = require('firebase-admin');
            console.log('Firebase Admin initialized:', admin.apps.length > 0);
            
            const userConfigRef = admin.firestore().collection('userConfigs').doc(userId);
            console.log('Getting user config from Firestore...');
            const userDoc = await userConfigRef.get();

            if (!userDoc.exists) {
                console.log('User configuration not found, creating new one...');
                const defaultConfig = {
                    maintenanceActivities: {},
                    operators: [],
                    tasks: {},
                    taskNameToKey: {},
                    featureMapping: {},
                    ACTIVITY_DEFINITIONS: {},
                    ACTIVITY_TACOM: {},
                    TASK_DEFINITIONS: {},
                    FEATURE_DEFINITIONS: {}
                };
                await userConfigRef.set({
                    config: defaultConfig,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }

            const userData = userDoc.exists ? userDoc.data() : { config: defaultConfig };
            const userConfig = userData.config || {};

            const userConfigPath = path.join(__dirname, 'data', `config_${userId}.json`);
            console.log('Saving config to temporary file:', userConfigPath);
            fs.writeFileSync(userConfigPath, JSON.stringify(userConfig, null, 4), 'utf8');

            console.log('Adding maintenance activity...');
            const result = await DesGeneralApi.addMaintenanceActivity({
                title,
                tacom,
                tasks,
                configPath: userConfigPath
            });
            console.log('Activity added successfully:', result);

            console.log('Reading updated config...');
            const updatedConfig = JSON.parse(fs.readFileSync(userConfigPath, 'utf8'));

            console.log('Updating Firestore...');
            await userConfigRef.update({
                config: updatedConfig,
                updatedAt: new Date().toISOString()
            });
            console.log('Firestore updated successfully');

            // Elimina il file temporaneo
            console.log('Cleaning up temporary file...');
            fs.unlinkSync(userConfigPath);
            
            return res.json({
                success: true,
                title: title,
                tacom: tacom,
                tasks: tasks,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in authenticated request:', error);
            console.error('Error stack:', error.stack);
            return res.status(401).json({ 
                success: false, 
                error: 'Authentication failed',
                message: error.message
            });
        }
    } catch (error) {
        console.error('Error adding maintenance activity:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Server error',
            message: error.message 
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});