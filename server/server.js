const express = require('express');
const path = require('path');
const ExcelJS = require('exceljs');
const { activities, operators, maintenanceActivities } = require('./config');
const MyClass = require('./src/MyClass');
const Simulation = require('./src/Simulation');
const cors = require('cors');

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

// API route to serve the configuration
app.get('/api/config', (req, res) => {
    const config = require('./config');
    res.json(config);
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

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
