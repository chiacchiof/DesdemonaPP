const { tasks, featureMapping, taskNameToKey } = require('../config');
const YourClass = require('./YourClass');

class MyClass {
    static myFunction(input, allTaskFeatures, selectedOperators) {
        console.log('1. Method: myFunction ---> Processing input:', input);
        console.log('2. Method: myFunction ---> Processing allTaskFeatures:', allTaskFeatures);
        console.log('3. Method: myFunction ---> Processing selectedOperators:', selectedOperators);
        //const {activityList, rankedOperatorsList} = MyClass.evaluateScenario(input, checkedActivities, selectedOperators);
        const {activityList, rankedOperatorsList} = MyClass.evaluateCustomScenario(input, allTaskFeatures, selectedOperators);

        return `Based on your selection of tasks ${activityList} and the operators, the ranking of the operators is ${rankedOperatorsList}`;
    }

    static yourFunctionFromMyClass() {
        const result = YourClass.anotherFunction();
        return `Result from YourClass: ${result}`;
    }

    static calculateMatch(taskFeatures, operatorFeatures) {
        let algebraicSum = 0;
        let positiveSum = 0;
        let negativeCount = 0;

        //console.log('Comparing features:');
        Object.keys(taskFeatures).forEach(featureKey => {
            const taskFeatureValue = taskFeatures[featureKey];
            if (taskFeatureValue > 0){
                const operatorFeatureKey = featureMapping[featureKey];
                const operatorFeatureValue = operatorFeatures[operatorFeatureKey] || 0; // Default to 0 if the feature is missing
                const difference = operatorFeatureValue - taskFeatureValue;
                algebraicSum += difference;

                if (difference < 0) {
                    negativeCount++;
                } else {
                    positiveSum += difference;
                }
                //console.log(`Task Feature: ${featureKey} (${operatorFeatureKey}), Task Value: ${taskFeatureValue}, Operator Value: ${operatorFeatureValue}, Difference: ${difference}`);
            }
        });

        //console.log(`Calculated algebraic sum: ${algebraicSum}, Positive sum: ${positiveSum}, Negative count: ${negativeCount}`);
        return { algebraicSum, positiveSum, negativeCount };
    }

    static evaluateScenario (input, checkedActivities, selectedOperators) {
        //console.log('1. Method: evaluateScenario ---> Processing input:', input);
        //console.log('2. Method: evaluateScenario ---> Processing checkedActivities:', checkedActivities);
        //console.log('3. Method: evaluateScenario ---> Processing selectedOperators:', selectedOperators);

        const activityList = JSON.stringify(checkedActivities, null, 2);
        console.log(activityList);


        // For each task, find the best matching operator
        const taskOperatorMatches = {};
        Object.keys(checkedActivities).forEach(category => {
            checkedActivities[category].forEach(taskName => {
                const taskKey = taskNameToKey[taskName];
                const taskFeatures = tasks[taskKey];
                //console.log(`4. Method: evaluateScenario ---> Category: ${category}`);
                //console.log(`5. Method: evaluateScenario ---> Task: ${taskName}`);
                //console.log(`6. Method: evaluateScenario --->  Task Key: ${taskKey}`);
                //console.log(`7. Method: evaluateScenario ---> Task Features: ${JSON.stringify(taskFeatures, null, 2)}`);

                if (taskFeatures) {
                    const operatorMatches = selectedOperators.map(operator => {
                        const operatorFeatures = operator.features;
                        //console.log(`8. Method: evaluateScenario ---> Operator: ${operator.name}, Features: ${JSON.stringify(operatorFeatures)}`);
                        const matchResult = MyClass.calculateMatch(taskFeatures, operatorFeatures);
                        //console.log(`9. Method: evaluateScenario --->  Match Result: ${JSON.stringify(matchResult)}`);
                        return { name: operator.name, ...matchResult };
                    });

                    // Sort operators by their match score (lower is better)
                    operatorMatches.sort((a, b) => {
                        if (a.negativeCount === b.negativeCount) {
                            return b.algebraicSum - a.algebraicSum; // Sort by positive algebraic sum if negative counts are equal
                        }
                        return a.negativeCount - b.negativeCount; // Sort by negative count first
                    });

                    taskOperatorMatches[category+'-'+taskName] = operatorMatches; //** Ferdinando: TO MODIFY THE DICTIONARY NOT TO REPEAT TASKS COMPARISON */
                }
            });
        });

        //console.log('10. Method: evaluateScenario ---> Task Operator Matches:', JSON.stringify(taskOperatorMatches, null, 2));

        // Aggregate match scores for overall ranking
        const operatorAggregateScores = selectedOperators.map(operator => {
            let totalAlgebraicSum = 0;
            let totalPositiveSum = 0;
            let totalNegativeCount = 0;
            let matchCount = 0;

            Object.values(taskOperatorMatches).forEach(matches => {
                const match = matches.find(m => m.name === operator.name);
                if (match) {
                    totalAlgebraicSum += match.algebraicSum;
                    totalPositiveSum += match.positiveSum;
                    totalNegativeCount += match.negativeCount;
                    matchCount++;
                }
            });

            //console.log(`1. Method: operatorAggregateScores --->  Operator: ${operator.name}, Total Algebraic Sum: ${totalAlgebraicSum}, Total Positive Sum: ${totalPositiveSum}, Total Negative Count: ${totalNegativeCount}, Match Count: ${matchCount}`);

            return {
                name: operator.name,
                totalAlgebraicSum,
                totalPositiveSum,
                totalNegativeCount
            };
        });

        // Sort operators by overall ranking logic
        const rankedOperators = operatorAggregateScores
            .filter(op => op.totalAlgebraicSum !== null)
            .sort((a, b) => {
                if (a.totalNegativeCount === b.totalNegativeCount) {
                    return b.totalAlgebraicSum - a.totalAlgebraicSum; // Sort by positive algebraic sum if negative counts are equal
                }
                return a.totalNegativeCount - b.totalNegativeCount; // Sort by negative count first
            });

        //console.log('1. Method: rankedOperators ---> Ranked Operators:', JSON.stringify(rankedOperators, null, 2));

        // Format ranked operators as a string
        const rankedOperatorsListScore = rankedOperators.map(op => `${op.name}: ${op.totalAlgebraicSum} (MS ${op.totalNegativeCount})`).join(', ');
        const rankedOperatorsList = rankedOperators.map(op => `${op.name}`).join(', ');
        
        return {
            rankedOperatorsListScore,
            rankedOperatorsList
        };
    }

    static evaluateCustomScenario (input, allTaskFeatures, selectedOperators) {
        console.log('1. Method: evaluateCustomScenario ---> Processing input:', input);
        console.log('2. Method: evaluateCustomScenario ---> Processing allTaskFeatures:', allTaskFeatures);
        console.log('3. Method: evaluateCustomScenario ---> Processing selectedOperators:', selectedOperators);

        const activityList = JSON.stringify(allTaskFeatures, null, 2);
        console.log(activityList);

        // For each task, find the best matching operator
        const taskOperatorMatches = {};
        Object.keys(allTaskFeatures).forEach(category => {
            Object.keys(allTaskFeatures[category]).forEach(taskName => {
                const taskKey = taskNameToKey[taskName];
                const taskFeatures = allTaskFeatures[category][taskName];
                    console.log(`4. Method: evaluateCustomScenario ---> Category: ${category}`);
                    console.log(`5. Method: evaluateCustomScenario ---> Task: ${taskName}`);
                    console.log(`6. Method: evaluateCustomScenario --->  Task Key: ${taskKey}`);
                    console.log(`7. Method: evaluateCustomScenario ---> Task Features: ${JSON.stringify(taskFeatures, null, 2)}`);

                    if (taskFeatures) {
                        const operatorMatches = selectedOperators.map(operator => {
                            const operatorFeatures = operator.features;
                            console.log(`8. Method: evaluateCustomScenario ---> Operator: ${operator.name}, Features: ${JSON.stringify(operatorFeatures)}`);
                            const matchResult = MyClass.calculateMatch(taskFeatures, operatorFeatures);
                            console.log(`9. Method: evaluateCustomScenario --->  Match Result: ${JSON.stringify(matchResult)}`);
                            return { name: operator.name, ...matchResult };
                        });

                        // Sort operators by their match score (lower is better)
                        operatorMatches.sort((a, b) => {
                            if (a.negativeCount === b.negativeCount) {
                                return b.algebraicSum - a.algebraicSum; // Sort by positive algebraic sum if negative counts are equal
                            }
                            return a.negativeCount - b.negativeCount; // Sort by negative count first
                        });

                        taskOperatorMatches[category+'-'+taskName] = operatorMatches; //** Ferdinando: TO MODIFY THE DICTIONARY NOT TO REPEAT TASKS COMPARISON */
                    }
            });
        });

        console.log('10. Method: evaluateCustomScenario ---> Task Operator Matches:', JSON.stringify(taskOperatorMatches, null, 2));

        // Aggregate match scores for overall ranking
        const operatorAggregateScores = selectedOperators.map(operator => {
            let totalAlgebraicSum = 0;
            let totalPositiveSum = 0;
            let totalNegativeCount = 0;
            let matchCount = 0;

            Object.values(taskOperatorMatches).forEach(matches => {
                const match = matches.find(m => m.name === operator.name);
                if (match) {
                    totalAlgebraicSum += match.algebraicSum;
                    totalPositiveSum += match.positiveSum;
                    totalNegativeCount += match.negativeCount;
                    matchCount++;
                }
            });

            console.log(`1. Method: operatorAggregateScores --->  Operator: ${operator.name}, Total Algebraic Sum: ${totalAlgebraicSum}, Total Positive Sum: ${totalPositiveSum}, Total Negative Count: ${totalNegativeCount}, Match Count: ${matchCount}`);

            return {
                name: operator.name,
                totalAlgebraicSum,
                totalPositiveSum,
                totalNegativeCount
            };
        });

        // Sort operators by overall ranking logic
        const rankedOperators = operatorAggregateScores
            .filter(op => op.totalAlgebraicSum !== null)
            .sort((a, b) => {
                if (a.totalNegativeCount === b.totalNegativeCount) {
                    return b.totalAlgebraicSum - a.totalAlgebraicSum; // Sort by positive algebraic sum if negative counts are equal
                }
                return a.totalNegativeCount - b.totalNegativeCount; // Sort by negative count first
            });

        //console.log('1. Method: rankedOperators ---> Ranked Operators:', JSON.stringify(rankedOperators, null, 2));

        // Format ranked operators as a string
        const rankedOperatorsList = rankedOperators.map(op => `${op.name}: ${op.totalAlgebraicSum} (missing skills ${op.totalNegativeCount})`).join(', ');
        return {
                activityList, 
                rankedOperatorsList
        };
    }

   
    
}

module.exports = MyClass;
