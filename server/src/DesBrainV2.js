const fs = require('fs');
const path = require('path');
const { operators, tasks, featureMapping, taskNameToKey, FEATURE_DEFINITIONS,     ACTIVITY_DEFINITIONS 
} = require('../config');

const configJsonPath = path.join(__dirname, '../data/config.json');

class DesBrainV2 {
    
    static rankOperatorSelectionFacchini(input, allTaskFeatures, selectedOperators) {
        console.log('1. Method: rankOperatorSelection ---> Processing input:', input);
        console.log('2. Method: rankOperatorSelection ---> Processing allTaskFeatures:', allTaskFeatures);
        console.log('3. Method: rankOperatorSelection ---> Processing selectedOperators:', selectedOperators);

        const activity = Object.keys(allTaskFeatures)[0];
        const activityTitle = ACTIVITY_DEFINITIONS[activity] || activity;
        const activityTasks = allTaskFeatures[activity];

        const taskMatrices = {};
        const taskAverages = {};
        
        Object.entries(activityTasks).forEach(([taskName, taskFeatures]) => {
            const convertedTaskFeatures = {};
            Object.entries(taskFeatures).forEach(([key, value]) => {
                convertedTaskFeatures[FEATURE_DEFINITIONS[key]] = value;
            });

            const scoreMatrix = DesBrainV2.calculateTaskScoreMatrix(
                convertedTaskFeatures,
                selectedOperators
            );
            
            taskMatrices[taskName] = scoreMatrix;

            taskAverages[taskName] = scoreMatrix.map((operatorScores, index) => {
                const sum = operatorScores.reduce((acc, score) => acc + score, 0);
                const average = sum / operatorScores.length;
                return {
                    operator: selectedOperators[index].name,
                    average: average.toFixed(2)
                };
            });
        });

        console.log('Task Matrices:', taskMatrices);
        console.log('Task Averages:', taskAverages);
        // Crea la matrice operatori x task medie
        const operatorTaskMatrix = selectedOperators.map(operator => {
            const operatorName = operator.name;
            return Object.entries(taskAverages).map(([taskId, operatorAverages]) => {
                const operatorAverage = operatorAverages.find(avg => avg.operator === operatorName);
                return parseFloat(operatorAverage?.average || 0);
            });
        });

        // Calcola denTaskMatrix usando la radice quadrata della somma dei quadrati
        const denTaskMatrix = operatorTaskMatrix[0].map((_, colIndex) => {
            const sumOfSquares = operatorTaskMatrix.reduce((sum, row) => {
                return sum + Math.pow(row[colIndex], 2);
            }, 0);
            return Math.sqrt(sumOfSquares).toFixed(4);
        });

        // Crea la matrice normalizzata (ogni elemento diviso per la somma della sua colonna)
        const normalizedMatrix = operatorTaskMatrix.map(row => {
            return row.map((value, colIndex) => {
                return (value / denTaskMatrix[colIndex]).toFixed(4);
            });
        });

        // Calcola il numero di task
        const numTasks = Object.keys(taskAverages).length;

        // Crea la matrice finale dividendo per il numero di task
        const finalMatrix = normalizedMatrix.map(row => {
            return row.map(value => {
                return (parseFloat(value) / numTasks).toFixed(4);
            });
        });

        // Calcola i vettori min e max per ogni task
        const maxVector = finalMatrix[0].map((_, colIndex) => {
            return Math.max(...finalMatrix.map(row => parseFloat(row[colIndex]))).toFixed(4);
        });

        const minVector = finalMatrix[0].map((_, colIndex) => {
            return Math.min(...finalMatrix.map(row => parseFloat(row[colIndex]))).toFixed(4);
        });

        // Calcola Si1 (distanza dal max) per ogni operatore
        const Si1 = finalMatrix.map(operatorRow => {
            const sumOfSquares = operatorRow.reduce((sum, value, taskIndex) => {
                const diff = parseFloat(value) - parseFloat(maxVector[taskIndex]);
                return sum + (diff * diff);
            }, 0);
            return Math.sqrt(sumOfSquares).toFixed(4);
        });

        // Calcola Si2 (distanza dal min) per ogni operatore
        const Si2 = finalMatrix.map(operatorRow => {
            const sumOfSquares = operatorRow.reduce((sum, value, taskIndex) => {
                const diff = parseFloat(value) - parseFloat(minVector[taskIndex]);
                return sum + (diff * diff);
            }, 0);
            return Math.sqrt(sumOfSquares).toFixed(4);
        });

        // Calcola il performance score per ogni operatore
        const performanceScores = Si1.map((s1, index) => {
            const s2 = Si2[index];
            const score = s2 / (parseFloat(s1) + parseFloat(s2));
            return {
                operator: selectedOperators[index].name,
                score: score.toFixed(4)
            };
        });

        // Ordina gli operatori in base al performance score (dal più alto al più basso)
        const rankedOperators = [...performanceScores]
            .sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

        console.log('Performance Scores and Ranking:');
        rankedOperators.forEach((op, index) => {
            console.log(`${index + 1}. ${op.operator}: ${op.score}`);
        });

        
        console.log('Operator x Task Matrix:');
        console.log('Tasks:', Object.keys(taskAverages).join(', '));
        operatorTaskMatrix.forEach((row, index) => {
            console.log(`${selectedOperators[index].name}:`, row.join(', '));
        });

        console.log('Task Sums:', denTaskMatrix.join(', '));
        console.log('Normalized Matrix:');
        normalizedMatrix.forEach((row, index) => {
            console.log(`${selectedOperators[index].name}:`, row.join(', '));
        });
        console.log('Final Matrix (divided by', numTasks, 'tasks):');
        finalMatrix.forEach((row, index) => {
            console.log(`${selectedOperators[index].name}:`, row.join(', '));
        });

        console.log('Max Vector:', maxVector.join(', '));
        console.log('Min Vector:', minVector.join(', '));
        console.log('Si1 (distance from max) Vector:');
        Si1.forEach((value, index) => {
            console.log(`${selectedOperators[index].name}:`, value);
        });
        console.log('Si2 (distance from min) Vector:');
        Si2.forEach((value, index) => {
            console.log(`${selectedOperators[index].name}:`, value);
        });


        // Aggiorna il resultMessage per includere il ranking
        const resultMessage = `Analysis completed for: ${activityTitle}\n\n` +
        'Operator Ranking by Performance Score:\n' +
        rankedOperators.map((op, index) => 
            `${index + 1}. ${op.operator}: ${op.score}`
        ).join('\n');

    return resultMessage;

        return resultMessage;
    }

    static calculateTaskScoreMatrix(taskFeatures, operators) {
        // Usa Object.values di FEATURE_DEFINITIONS per ottenere l'array delle features
        const features = Object.values(FEATURE_DEFINITIONS);

        const matrix = Array(operators.length).fill()
            .map(() => Array(features.length).fill(0));

        operators.forEach((operator, opIndex) => {
            features.forEach((feature, featIndex) => {
                const operatorFeatureValue = operator.features[feature] || 0;
                const taskFeatureValue = taskFeatures[feature] || 0;
                matrix[opIndex][featIndex] = operatorFeatureValue * taskFeatureValue;
            });
        });

        return matrix;
    }

    static evaluateCustomScenario(input, allTaskFeatures, selectedOperators) {
        const result = DesBrainV2.rankOperatorSelectionFacchini(
            input, 
            allTaskFeatures, 
            selectedOperators
        );

        return {
            activityList: result.taskMatrices,
            message: result
        };
    }
}

module.exports = DesBrainV2;