// Error handling utilities

function formatError(error, defaultCode = 'UNKNOWN_ERROR') {
    const errorCode = error.code || error.message || defaultCode;
    const errorMessage = error.message || 'An unexpected error occurred';
    
    // Map common Firebase errors to user-friendly messages
    const errorMap = {
        'FIRESTORE_NOT_INITIALIZED': {
            code: 'FIRESTORE_NOT_INITIALIZED',
            message: 'Database connection failed. Please check server configuration.',
            status: 503
        },
        'permission-denied': {
            code: 'PERMISSION_DENIED',
            message: 'Database permission denied. Please check Firestore security rules.',
            status: 403
        },
        'unauthenticated': {
            code: 'UNAUTHENTICATED',
            message: 'Authentication failed. Please check Firebase credentials.',
            status: 401
        },
        'not-found': {
            code: 'NOT_FOUND',
            message: 'Resource not found.',
            status: 404
        },
        'already-exists': {
            code: 'ALREADY_EXISTS',
            message: 'Resource already exists.',
            status: 409
        }
    };
    
    const mappedError = errorMap[errorCode] || {
        code: errorCode,
        message: errorMessage,
        status: 500
    };
    
    return {
        success: false,
        error: mappedError.message,
        errorCode: mappedError.code,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        status: mappedError.status
    };
}

function sendErrorResponse(res, error, defaultCode = 'UNKNOWN_ERROR') {
    const formattedError = formatError(error, defaultCode);
    res.status(formattedError.status || 500).json(formattedError);
}

module.exports = {
    formatError,
    sendErrorResponse
};

