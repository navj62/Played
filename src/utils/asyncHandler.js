const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (err) {
        // Forward to the global error handler in app.js so every error
        // returns the same { statusCode, success, message, errors } shape.
        next(err)
    }
}
export {asyncHandler}