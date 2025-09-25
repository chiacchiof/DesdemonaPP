const fs = require('fs');
const path = require('path');
const { operators, tasks, featureMapping, taskNameToKey } = require('../config');
const admin = require('firebase-admin');

class DesGeneralApi {
    // Create a method to ensure the config directory exists
    static initializeConfig() {
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        const configPath = path.join(dataDir, 'config.json');
        if (!fs.existsSync(configPath)) {
            const defaultConfig = require('../config');
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4), 'utf8');
        } else {
            // Aggiorna il file di configurazione esistente con TASK_DEFINITIONS_FOR_NEW_ACTIVITY se non esiste
            const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const defaultConfig = require('../config');
            
            if (!currentConfig.TASK_DEFINITIONS_FOR_NEW_ACTIVITY) {
                currentConfig.TASK_DEFINITIONS_FOR_NEW_ACTIVITY = defaultConfig.TASK_DEFINITIONS_FOR_NEW_ACTIVITY;
                fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 4), 'utf8');
            }
        }
    }

    static getConfigPath() {
        return path.join(__dirname, '..', 'data', 'config.json');
    }

    static modifyOperatorFeature(operatorName, featureName, newValue) {
        try {
            // Initialize config if needed
            this.initializeConfig();
            
            // Load current config
            let config = JSON.parse(fs.readFileSync(this.getConfigPath(), 'utf8'));
            
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
            fs.writeFileSync(this.getConfigPath(), JSON.stringify(config, null, 4), 'utf8');

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
            const config = JSON.parse(fs.readFileSync(this.getConfigPath(), 'utf8'));
            
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
            console.log('Loading config from:', this.getConfigPath());
            let config = JSON.parse(fs.readFileSync(this.getConfigPath(), 'utf8'));
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
            fs.writeFileSync(this.getConfigPath(), JSON.stringify(config, null, 4), 'utf8');
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

    static readTaskFeatures(taskKey) {
        try {
            // Initialize config if needed
            this.initializeConfig();
            
            // Load current config
            let config = JSON.parse(fs.readFileSync(this.getConfigPath(), 'utf8'));

            // Check if task exists
            if (!config.tasks[taskKey]) {
                throw new Error(`Task ${taskKey} not found`);
            }

            const currentFeaturesString = Object.entries(config.tasks[taskKey])
                .map(([feature, value]) => `${feature}: ${value}`)
                .join(', ');

            return {
                taskKey,
                features: config.tasks[taskKey],
                featuresString: currentFeaturesString
            };
        } catch (error) {
            console.error('Error in readTaskFeatures:', error);
            throw error;
        }
    }

    static addOperator(newOperator) {
        try {
            console.log('Starting addOperator method');
            
            // Inizializza config se necessario
            console.log('Initializing config...');
            this.initializeConfig();
            
            // Verifica percorso del file
            console.log('Config path:', this.getConfigPath());
            console.log('Directory exists:', fs.existsSync(path.dirname(this.getConfigPath())));
            console.log('File exists:', fs.existsSync(this.getConfigPath()));
            
            // Carica la configurazione attuale
            console.log('Loading config from file...');
            let config = JSON.parse(fs.readFileSync(this.getConfigPath(), 'utf8'));
            console.log('Config loaded successfully');
            
            // Verifica se esiste già un operatore con lo stesso nome
            const operatorExists = config.operators.some(op => op.name === newOperator.name);
            if (operatorExists) {
                throw new Error(`An operator with name "${newOperator.name}" already exists`);
            }
            
            // Verifica che il nuovo operatore abbia le stesse features degli altri operatori
            const requiredFeatures = Object.values(config.featureMapping);
            const hasAllFeatures = requiredFeatures.every(feature => 
                Object.keys(newOperator.features).includes(feature)
            );
            
            if (!hasAllFeatures) {
                throw new Error('New operator is missing required features');
            }
            
            // Aggiungi il nuovo operatore
            config.operators.push(newOperator);
            
            // Salva la configurazione aggiornata
            fs.writeFileSync(this.getConfigPath(), JSON.stringify(config, null, 4), 'utf8');
            
            return {
                success: true,
                message: `Operator "${newOperator.name}" added successfully`,
                operator: newOperator
            };
        } catch (error) {
            console.error('Detailed error in addOperator:', error);
            throw error;
        }
    }

    static deleteOperator(operatorName) {
        try {
            // Inizializza config se necessario
            this.initializeConfig();
            
            // Carica la configurazione attuale
            let config = JSON.parse(fs.readFileSync(this.getConfigPath(), 'utf8'));
            
            // Verifica se l'operatore esiste
            const operatorIndex = config.operators.findIndex(op => op.name === operatorName);
            if (operatorIndex === -1) {
                throw new Error(`Operator "${operatorName}" not found`);
            }
            
            // Rimuovi l'operatore
            config.operators = config.operators.filter(op => op.name !== operatorName);
            
            // Salva la configurazione aggiornata
            fs.writeFileSync(this.getConfigPath(), JSON.stringify(config, null, 4), 'utf8');
            
            return {
                success: true,
                message: `Operator "${operatorName}" deleted successfully`
            };
        } catch (error) {
            console.error('Error in deleteOperator:', error);
            throw error;
        }
    }

    static getTaskDefinitions() {
        try {
            // Usa direttamente i dati dal config.js
            const { TASK_DEFINITIONS_FOR_NEW_ACTIVITY } = require('../config');
            return TASK_DEFINITIONS_FOR_NEW_ACTIVITY || {};
        } catch (error) {
            console.error('Error in getTaskDefinitions:', error);
            throw error;
        }
    }

    static async addMaintenanceActivity(activityData) {
        try {
            // Inizializza la configurazione se necessario
            this.initializeConfig();
            
            // Usa il percorso di configurazione personalizzato se fornito
            const configPath = activityData.configPath || this.getConfigPath();
            
            // Carica la configurazione corrente
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            // Trova il prossimo ID disponibile
            const existingKeys = Object.keys(config.maintenanceActivities);
            const lastActivityNumber = existingKeys.reduce((max, key) => {
                const match = key.match(/ACTIVITY_(\d+)/);
                if (match) {
                    const num = parseInt(match[1]);
                    return Math.max(max, num);
                }
                return max;
            }, 0);
            const nextId = `ACTIVITY_${lastActivityNumber + 1}`;
            
            // Verifica e clona i task mancanti in config.tasks
            for (const taskKey of activityData.tasks) {
                if (!config.tasks[taskKey]) {
                    // Se il task non esiste, cerca l'ultimo task della stessa serie
                    const baseTask = taskKey.split('_')[0]; // Es: "T2" da "T2_1"
                    const taskNumber = parseInt(taskKey.split('_')[1] || '0');
                    
                    // Trova l'ultimo task esistente della stessa serie
                    let lastExistingTask = null;
                    for (let i = taskNumber - 1; i >= 0; i--) {
                        const checkTask = i === 0 ? baseTask : `${baseTask}_${i}`;
                        if (config.tasks[checkTask]) {
                            lastExistingTask = checkTask;
                            break;
                        }
                    }
                    
                    if (lastExistingTask) {
                        // Clona il task dall'ultimo esistente
                        config.tasks[taskKey] = { ...config.tasks[lastExistingTask] };
                        
                        // Aggiungi il mapping nel taskNameToKey
                        const baseTaskName = Object.entries(config.taskNameToKey).find(
                            ([name, key]) => key === baseTask
                        )[0];
                        
                        if (baseTaskName) {
                            const derivedTaskName = taskNumber ? `${baseTaskName} ${taskNumber}` : baseTaskName;
                            config.taskNameToKey[derivedTaskName] = taskKey;
                        }
                    } else {
                        console.warn(`Could not find base task to clone from: ${taskKey}`);
                    }
                }
            }
            
            // Converti i task da key a nomi per l'attività
            const taskNames = activityData.tasks.map(taskKey => {
                // Estrai il task base (es. "T2" da "T2_1")
                const baseTask = taskKey.split('_')[0];
                const taskNumber = taskKey.split('_')[1];
                
                // Cerca il nome del task base nel mapping
                const taskNameEntry = Object.entries(config.taskNameToKey).find(
                    ([name, key]) => key === baseTask
                );
                
                if (taskNameEntry) {
                    // Se c'è un numero, aggiungilo al nome base
                    return taskNumber ? `${taskNameEntry[0]} ${taskNumber}` : taskNameEntry[0];
                }
                
                // Se non trovato, usa la key come nome
                return taskNumber ? `${baseTask} ${taskNumber}` : baseTask;
            });
            
            // Aggiungi la nuova attività nel formato corretto
            config.maintenanceActivities[nextId] = {
                [nextId]: taskNames
            };
            
            // Aggiungi il titolo in ACTIVITY_DEFINITIONS
            if (!config.ACTIVITY_DEFINITIONS) {
                config.ACTIVITY_DEFINITIONS = {};
            }
            config.ACTIVITY_DEFINITIONS[nextId] = activityData.title;
            
            // Converti il TACOM da numero a stringa e aggiungilo in ACTIVITY_TACOM
            if (!config.ACTIVITY_TACOM) {
                config.ACTIVITY_TACOM = {};
            }
            const tacomString = config.TACOM_LIST[parseInt(activityData.tacom)];
            config.ACTIVITY_TACOM[nextId] = tacomString;
            
            // Salva la configurazione aggiornata
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
            
            return {
                success: true,
                title: activityData.title,
                tacom: tacomString,
                tasks: taskNames,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error adding maintenance activity:', error);
            throw error;
        }
    }

    static getAuthUserConfigPath() {
        return path.join(__dirname, '..', 'data', 'configUserToUpdate.json');
    }

    static async downloadActivitiesAuthUser(userId) {
        try {
            // Inizializza admin se necessario
            if (!admin.apps.length) {
                admin.initializeApp();
            }
            
            // Recupera la configurazione dell'utente da Firestore
            const userConfigRef = admin.firestore().collection('userConfigs').doc(userId);
            const userConfigDoc = await userConfigRef.get();

            if (!userConfigDoc.exists) {
                throw new Error('User configuration not found');
            }

            const userData = userConfigDoc.data();
            const userConfig = userData.config || {};

            // Salva la configurazione in un file temporaneo
            fs.writeFileSync(this.getAuthUserConfigPath(), JSON.stringify(userConfig, null, 4), 'utf8');

            return userConfig;
        } catch (error) {
            console.error('Error downloading user configuration:', error);
            throw error;
        }
    }

    static async addMaintenanceActivityAuthUser(activityData, userId) {
        try {
            // Scarica la configurazione dell'utente
            await this.downloadActivitiesAuthUser(userId);

            // Usa la logica esistente ma sul file temporaneo
            const result = await this.addMaintenanceActivity({
                ...activityData,
                configPath: this.getAuthUserConfigPath()
            });

            return result;
        } catch (error) {
            console.error('Error adding maintenance activity for authenticated user:', error);
            throw error;
        }
    }

    static async uploadActivitiesAuthUser(userId) {
        try {
            console.log('=== START uploadActivitiesAuthUser ===');
            console.log('User ID:', userId);
            
            // Leggi il file temporaneo
            const configPath = this.getAuthUserConfigPath();
            console.log('Reading config from:', configPath);
            
            if (!fs.existsSync(configPath)) {
                console.error('Config file not found at:', configPath);
                throw new Error('Config file not found');
            }
            
            const updatedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            console.log('Config read successfully, size:', JSON.stringify(updatedConfig).length);

            // Aggiorna la configurazione in Firestore
            console.log('=== START Firestore Update ===');
            const userConfigRef = admin.firestore().collection('userConfigs').doc(userId);
            
            try {
                // Verifica se il documento esiste
                console.log('Checking if document exists...');
                const doc = await userConfigRef.get();
                console.log('Document exists:', doc.exists);
                
                if (!doc.exists) {
                    console.log('Creating new user config document...');
                    const result = await userConfigRef.set({
                        config: updatedConfig,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                    console.log('Set operation completed:', result);
                } else {
                    console.log('Updating existing user config...');
                    const result = await userConfigRef.update({
                        config: updatedConfig,
                        updatedAt: new Date().toISOString()
                    });
                    console.log('Update operation completed:', result);
                }
                console.log('=== END Firestore Update ===');
            } catch (firestoreError) {
                console.error('=== Firestore Error ===');
                console.error('Error type:', firestoreError.constructor.name);
                console.error('Error message:', firestoreError.message);
                console.error('Error code:', firestoreError.code);
                console.error('Error stack:', firestoreError.stack);
                console.error('=== End Firestore Error ===');
                throw new Error(`Failed to update Firestore: ${firestoreError.message}`);
            }

            // Elimina il file temporaneo
            console.log('=== START File Cleanup ===');
            if (fs.existsSync(configPath)) {
                console.log('Attempting to delete file...');
                fs.unlinkSync(configPath);
                console.log('File deleted successfully');
            } else {
                console.log('File already deleted');
            }
            console.log('=== END File Cleanup ===');

            console.log('=== END uploadActivitiesAuthUser ===');
            return { success: true, message: 'Configuration updated successfully' };
        } catch (error) {
            console.error('=== Global Error ===');
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            console.error('=== End Global Error ===');
            throw error;
        }
    }
}

module.exports = DesGeneralApi;
