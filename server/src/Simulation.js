const { maintenanceActivities, operators } = require('../config');
const MyClass = require('./MyClass');

class Simulation {
    constructor(numMaintenanceActivities, numActivities, numTasks, numOperators) {
        this.numMaintenanceActivities = numMaintenanceActivities;
        this.numActivities = numActivities;
        this.numTasks = numTasks;
        this.numOperators = numOperators;
    }

    logCheckedActivities = (activities) => {
        console.log('Tasks:');
        Object.entries(activities).forEach(([activity, tasks]) => {
            console.log(`  ${activity}: [`);
            tasks.forEach(task => {
                console.log(`    '${task}',`);
            });
            console.log('  ]');
        });
    };

    getMultipleRandomElements(array, count) {
        //const shuffled = array.sort(() => 0.5 - Math.random());
        //return shuffled.slice(0, count);
        const extendedArray = [];
        while (extendedArray.length < count) {
            extendedArray.push(...array);
        }
        extendedArray.length = count; // Ensure the length is exactly count
    
        // Shuffle the extended array
        const shuffled = extendedArray.sort(() => 0.5 - Math.random());
    
        // Return the first count elements from the shuffled extended array
        return shuffled.slice(0, count);
    }


    getRandomItems(array, count) {
        // Crea una copia dell'array per evitare di modificare l'array originale
        let result = array.slice();
        let m = result.length, t, i;

        // Mentre ci sono elementi rimanenti da mescolare
        while (m) {
            // Scegli un elemento rimanente...
            i = Math.floor(Math.random() * m--);

            // E scambialo con l'elemento attuale
            t = result[m];
            result[m] = result[i];
            result[i] = t;
        }

        // Restituisci i primi `count` elementi
        return result.slice(0, count);
    }

    getRandomTasks(activity, activityTasks) {
        //console.log(`1. Method: getRandomTasks ---> Getting random tasks for activity: ${activity}`);
        const tasksForActivity = activityTasks;
        //console.log(`2. Method: getRandomTasks ---> Tasks for activity ${activity}:`, tasksForActivity);
        if (!tasksForActivity) {
            //console.log(`Method: getRandomTasks ---> No tasks found for activity: ${activity}`);
            return [];
        }
        return this.getMultipleRandomElements(tasksForActivity, this.numTasks);
    }

    runSimulation() {
        const selectedMaintenanceActivities = this.getMultipleRandomElements(Object.keys(maintenanceActivities), this.numMaintenanceActivities);
        //console.log('1. Method: runSimulation ---> Selected random maintenance activities:', selectedMaintenanceActivities);

        const simulationResults = selectedMaintenanceActivities.map(maintenanceActivity => {
            const activities = this.getRandomItems(Object.keys(maintenanceActivities[maintenanceActivity]), this.numActivities);
            //console.log(`2. Method: runSimulation ---> Selected random activities for ${maintenanceActivity}:`, activities);

            const selectedOperators = this.getRandomItems(operators, this.numOperators);
            //console.log(`3. Method: runSimulation ---> Selected random operators:`, selectedOperators.map(op => op.name));

            
            const checkedActivities = activities.reduce((acc, activity) => {
                const activityTasks = maintenanceActivities[maintenanceActivity][activity];
                acc[activity] = this.getRandomTasks(activity, activityTasks);
                return acc;
            }, {});
            

            //console.log(`4. Method: runSimulation ---> Checked activities for ${maintenanceActivity}:`, checkedActivities);

            const optimalResult = MyClass.evaluateScenario('', checkedActivities, selectedOperators);
            //console.log('****************** SCENARIO EVALUATED *******************************************');

            //console.log(`5. Optimal result for ${maintenanceActivity}:`, optimalResult);

            return {
                maintenanceActivity,
                activities,
                checkedActivities,
                operators: selectedOperators.map(op => op.name),
                optimalOperators: optimalResult
            };
        });

        return simulationResults;
    
    }

    getSimulationResults() {
        const simulationResults = this.runSimulation();
        //console.log('************************Get Simulation Results *****************************************');
        // Iterate over each result and log the details
        simulationResults.forEach(result => {
            const iterOperators = result.operators.map(item => {
                //console.log(item);
                return item;
            });
            const { maintenanceActivity, activities, checkedActivities, operators, optimalOperators } = result;
            //console.log(`1. Method: getSimulationResults ---> Maintenance Activity: ${maintenanceActivity}`);
            //console.log(`2. Method: getSimulationResults ---> Activities: ${activities.join(', ')}`);
            //this.logCheckedActivities(checkedActivities);
            //console.log(`3. Method: getSimulationResults ---> Random Operators: ${operators.join(', ')}`);
            //console.log('4. Method: getSimulationResults ---> Optimal Operators:', optimalOperators.rankedOperatorsList);
            //console.log('5. Method: getSimulationResults ---> Optimal Operators Score:', optimalOperators.rankedOperatorsListScore);
            //if(operators.join(', ') != optimalOperators.rankedOperatorsList) console.log('6. Method: getSimulationResults ---> Wrong Allocation');
            //console.log('*****************************************************************');
        });
    
        // Return the formatted simulation results
        return simulationResults.map(result => {
            const rankedOperatorsList  = JSON.stringify(result.optimalOperators, null, 2);
            const checkedActivities = JSON.stringify(result.checkedActivities, null, 2)
            const optimalOperatorsMessage = `Based on your selection of tasks ${checkedActivities} and the operators, the ranking of the operators is ${rankedOperatorsList}`;
            return {
                ...result,
                optimalOperatorsMessage
            };
        });
    }
    
}

module.exports = Simulation;
