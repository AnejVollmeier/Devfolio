/**
 * Middleware za sanitizacijo vhodnih podatkov
 * Preprečuje XSS napade
 */
const sanitizeHtml = require('sanitize-html');

/**
 * Globina sanitizacije objekta
 * @param {Object} obj Objekt za sanitizacijo
 * @return {Object} Sanitiziran objekt
 */
function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const result = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            
            // Ne sanitiziraj gesel (ta naj ostanejo nedotaknjena)
            if ((key === 'password' || key === 'confirmPassword') && typeof value === 'string') {
                result[key] = value;
                continue;
            }
            
            // Sanitiziraj glede na tip
            if (typeof value === 'string') {
                result[key] = sanitizeHtml(value, {
                    allowedTags: [], // Ne dovoli HTML oznak
                    allowedAttributes: {}, // Ne dovoli atributov
                });
            } else if (value === null) {
                result[key] = null;
            } else if (typeof value === 'object') {
                result[key] = sanitizeObject(value); // Rekurzivno sanitiziraj gnezdene objekte
            } else {
                result[key] = value; // Ostale tipe pusti nedotaknjene
            }
        }
    }
    
    return result;
}

/**
 * Express middleware za sanitizacijo
 */
const sanitizeMiddleware = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }
    
    next();
};

module.exports = sanitizeMiddleware;