// Add this at the top of your App.js
const apiUrl = process.env.NODE_ENV === 'production'
    ? 'https://dss-desdemona.onrender.com/api'  // Replace with your actual Render backend URL
    : '/api';  // This will work with the proxy during development

export default apiUrl;
