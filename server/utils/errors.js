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
        },
        'deadline-exceeded': {
            code: 'DATABASE_TIMEOUT',
            message: 'Database request timed out. Please try again.',
            status: 504
        },
        'resource-exhausted': {
            code: 'DATABASE_OVERLOADED',
            message: 'Database is overloaded. Please try again later.',
            status: 503
        },
        'unavailable': {
            code: 'DATABASE_UNAVAILABLE',
            message: 'Database is temporarily unavailable. Please try again later.',
            status: 503
        },
        'internal': {
            code: 'DATABASE_INTERNAL_ERROR',
            message: 'Database internal error. Please try again later.',
            status: 500
        },
        'failed-precondition': {
            code: 'DATABASE_PRECONDITION_FAILED',
            message: 'Database precondition failed. Please try again.',
            status: 400
        },
        'aborted': {
            code: 'DATABASE_ABORTED',
            message: 'Database operation was aborted. Please try again.',
            status: 409
        },
        'out-of-range': {
            code: 'DATABASE_OUT_OF_RANGE',
            message: 'Database operation out of range. Please check your request.',
            status: 400
        },
        'unimplemented': {
            code: 'DATABASE_NOT_IMPLEMENTED',
            message: 'Database operation not implemented.',
            status: 501
        }
    };
    
    // Check for network-related error patterns
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connection refused')) {
        return {
            success: false,
            error: 'Database connection refused. Server may be down.',
            errorCode: 'DATABASE_CONNECTION_REFUSED',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            status: 503
        };
    }
    
    if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timeout')) {
        return {
            success: false,
            error: 'Database connection timed out. Please try again.',
            errorCode: 'DATABASE_TIMEOUT',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            status: 504
        };
    }
    
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
        return {
            success: false,
            error: 'Database host not found. Please check server configuration.',
            errorCode: 'DATABASE_HOST_NOT_FOUND',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            status: 503
        };
    }
    
    if (errorMessage.includes('ENETUNREACH') || errorMessage.includes('network unreachable')) {
        return {
            success: false,
            error: 'Database network unreachable. Please check your connection.',
            errorCode: 'DATABASE_NETWORK_UNREACHABLE',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            status: 503
        };
    }
    
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

