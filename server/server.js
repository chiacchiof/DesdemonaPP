const express = require('express');
const path = require('path');
const ExcelJS = require('exceljs');
const { activities, operators, maintenanceActivities } = require('./config');
const MyClass = require('./src/MyClass');
const Simulation = require('./src/Simulation');
const cors = require('cors');
const fs = require('fs');

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

// Initialize config.json if it doesn't exist
const configJsonPath = path.join(__dirname, 'config.json');
if (!fs.existsSync(configJsonPath)) {
    const initialConfig = require('./config');
    fs.writeFileSync(configJsonPath, JSON.stringify(initialConfig, null, 4), 'utf8');
}

// Load config from JSON file
const config = JSON.parse(fs.readFileSync(configJsonPath, 'utf8'));

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
app.put('/api/modifyOperatorFeature', (req, res) => {
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

        // Call the MyClass method to modify the operator features
        const updatedOperator = MyClass.modifyOperatorFeature(cleanOperatorName, cleanFeatureName, cleanNewValue);
        
        res.json({ 
            success: true, 
            message: `Successfully updated ${cleanFeatureName} for ${cleanOperatorName}`,
            updatedOperator 
        });

    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.put('/api/modifyOperatorFeatures/bulk', (req, res) => {
    try {
        const { operatorName, features } = req.body;
        
        // Input validation
        if (!operatorName || !features || !Array.isArray(features)) {
            return res.status(400).json({ 
                error: 'Invalid request. Need operatorName and features array' 
            });
        }

        let updatedOperator = null;
        const updateResults = [];

        // Process each feature update
        features.forEach(({ featureName, newValue }) => {
            try {
                updatedOperator = MyClass.modifyOperatorFeature(operatorName, featureName, newValue);
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

        // Create a readable features string for the final state
        const featuresString = Object.entries(updatedOperator.features)
            .map(([feature, value]) => `${feature}: ${value}`)
            .join(', ');

        res.json({ 
            success: true, 
            message: `Updated features for ${operatorName}`,
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

app.get('/api/readOperatorFeatures', (req, res) => {
    try {
        console.log('Raw query:', req.query); // Debug what we receive
        
        // Try both possible parameter names (with and without space)
        const operatorName = req.query['operatorName '] || req.query['operatorName'];
        console.log('operatorName before cleaning:', operatorName); // Debug the extracted value
        
        // Add null check before trying to use replace
        if (!operatorName) {
            return res.status(400).json({ 
                error: 'Missing operator name parameter' 
            });
        }

        const cleanOperatorName = operatorName.replace(/"/g, '').trim();
        console.log('cleanOperatorName:', cleanOperatorName); // Debug the cleaned value
        
        if (!cleanOperatorName) {
            return res.status(400).json({ 
                error: 'Missing operator name parameter' 
            });
        }

        const featuresMessage = MyClass.readOperatorFeatures(cleanOperatorName);
        
        res.json({ 
            success: true, 
            message: featuresMessage 
        });

    } catch (error) {
        console.log('Error details:', error); // Debug any errors
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Existing API routes
app.post('/api/myFunction', (req, res) => {
    const { input, allTaskFeatures, selectedOperators } = req.body;
    const result = MyClass.myFunction(input, allTaskFeatures, selectedOperators);
    res.json({ message: result });
});

app.get('/api/yourFunctionFromMyClass', (req, res) => {
    const result = MyClass.yourFunctionFromMyClass();
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

app.put('/api/modifyTaskFeatures', (req, res) => {
    try {
        console.log('Received request to modify task features');
        console.log('Request body:', req.body);
        
        const { taskKey, features } = req.body;
        
        // Input validation
        if (!taskKey || !features || typeof features !== 'object') {
            console.log('Invalid request - missing required fields');
            return res.status(400).json({ 
                error: 'Invalid request. Need taskKey and features object' 
            });
        }

        console.log('Calling MyClass.modifyTaskFeatures...');
        const result = MyClass.modifyTaskFeatures(taskKey, features);
        console.log('Modification successful:', result);

        res.json({ 
            success: true, 
            message: `Successfully updated features for ${taskKey}`,
            featuresMessage: `Features of ${taskKey}: ${result.featuresString}`,
            updatedTask: {
                taskKey: result.taskKey,
                features: result.features
            }
        });

    } catch (error) {
        console.error('Error in modifyTaskFeatures endpoint:', error);
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
