const admin = require('firebase-admin');

// Inizializza Firebase Admin
try {
    // Prova prima con le variabili d'ambiente
    if (process.env.FIREBASE_PROJECT_ID && 
        process.env.FIREBASE_CLIENT_EMAIL && 
        process.env.FIREBASE_PRIVATE_KEY) {
        
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
        console.log('Firebase Admin initialized with environment variables');
    } else {
        // Se non ci sono variabili d'ambiente, prova con il file di servizio
        try {
            const serviceAccount = require('./serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin initialized with service account file');
        } catch (fileError) {
            console.warn('Service account file not found, proceeding without Firebase Admin');
            // Inizializza Firebase Admin senza credenziali (solo per sviluppo)
            admin.initializeApp();
            console.log('Firebase Admin initialized without credentials (development mode)');
        }
    }
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
}

// Funzione per verificare il token
async function verifyToken(token) {
    try {
        if (!admin.apps.length) {
            throw new Error('Firebase Admin not initialized');
        }
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}

module.exports = {
    admin,
    verifyToken
}; 