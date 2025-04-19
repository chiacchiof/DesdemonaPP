const fs = require('fs');
const path = require('path');
const { operators, tasks, featureMapping, taskNameToKey } = require('../config');

// Define the path to config.json relative to MyClass.js
const configJsonPath = path.join(__dirname, '../data/config.json');

class DesGeneralApi {
    // Create a method to ensure the config directory exists
    static initializeConfig() {
        const configDir = path.dirname(configJsonPath);
        console.log('Config directory path:', configDir);
        
        try {
            // Create the data directory if it doesn't exist
            if (!fs.existsSync(configDir)) {
                console.log('Creating config directory...');
                fs.mkdirSync(configDir, { recursive: true });
            }

            // Create config.json if it doesn't exist
            if (!fs.existsSync(configJsonPath)) {
                console.log('Creating initial config.json...');
                const initialConfig = require('../config');
                fs.writeFileSync(configJsonPath, JSON.stringify(initialConfig, null, 4), 'utf8');
            }
            console.log('Config initialization successful');
        } catch (error) {
            console.error('Error initializing config:', error);
            throw error;
        }
    }

    static modifyOperatorFeature(operatorName, featureName, newValue) {
        try {
            // Initialize config if needed
            this.initializeConfig();
            
            // Load current config
            let config = JSON.parse(fs.readFileSync(configJsonPath, 'utf8'));
            
            // Find the operator in the config
            const operator = config.operators.find(op => op.name === operatorName);
            if (!operator) {
                throw new Error(`Operator ${operatorName} not found`);
            }
            
            // Check if the feature exists in featureMapping
            if (!Object.values(config.featureMapping).includes(featureName)) {
                throw new Error(`Invalid feature name: ${featureName}`);
            }
            
            // Update the feature value
            operator.features[featureName] = newValue;

            // Save the updated config
            fs.writeFileSync(configJsonPath, JSON.stringify(config, null, 4), 'utf8');

            return operator;
        } catch (error) {
            console.error('Error in modifyOperatorFeature:', error);
            throw error;
        }
    }

    static readOperatorFeatures(operatorName) {
        try {
            // Initialize config if needed
            this.initializeConfig();
            
            // Load current config
            const config = JSON.parse(fs.readFileSync(configJsonPath, 'utf8'));
            
            const operator = config.operators.find(op => op.name === operatorName);
            if (!operator) {
                throw new Error(`Operator ${operatorName} not found`);
            }
            
            // Create a readable features string
            const featuresString = Object.entries(operator.features)
                .map(([feature, value]) => `${feature}: ${value}`)
                .join(', ');
                
            return `Features of ${operatorName}: ${featuresString}`;
        } catch (error) {
            console.error('Error in readOperatorFeatures:', error);
            throw error;
        }
    }
    
  
    static modifyTaskFeatures(taskKey, features) {
        console.log('Modifying task features...');
        console.log('Task key:', taskKey);
        console.log('Features to update:', features);
        
        try {
            // Initialize config if needed
            this.initializeConfig();
            
            // Load current config
            console.log('Loading config from:', configJsonPath);
            let config = JSON.parse(fs.readFileSync(configJsonPath, 'utf8'));
            console.log('Current config loaded successfully');

            // Check if task exists
            if (!config.tasks[taskKey]) {
                throw new Error(`Task ${taskKey} not found`);
            }

            // Update or add features
            Object.entries(features).forEach(([featureKey, value]) => {
                if (!/^F\d+$/.test(featureKey)) {
                    throw new Error(`Invalid feature key format: ${featureKey}`);
                }
                
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 0 || numValue > 10) {
                    throw new Error(`Invalid feature value: ${value}`);
                }
                
                config.tasks[taskKey][featureKey] = numValue;
            });

            // Save updated config
            console.log('Saving updated config...');
            fs.writeFileSync(configJsonPath, JSON.stringify(config, null, 4), 'utf8');
            console.log('Config saved successfully');

            const updatedFeaturesString = Object.entries(config.tasks[taskKey])
                .map(([feature, value]) => `${feature}: ${value}`)
                .join(', ');

            return {
                taskKey,
                features: config.tasks[taskKey],
                featuresString: updatedFeaturesString
            };
        } catch (error) {
            console.error('Error in modifyTaskFeatures:', error);
            throw error;
        }
    }

   
    
}

module.exports = DesGeneralApi;
