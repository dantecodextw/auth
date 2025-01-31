import rateLimit from "express-rate-limit";

const evaluateTime = (time) => {
    const match = time.match(/(\d+)(h|min|s)/);
    if (!match) throw new Error("Invalid time format");

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case "h":
            return value * 60 * 60 * 1000; // Convert hours to milliseconds
        case "min":
            return value * 60 * 1000; // Convert minutes to milliseconds
        case "s":
            return value * 1000; // Convert seconds to milliseconds
        default:
            throw new Error("Unsupported time unit");
    }
};

const rateLimiter = (count, time = '15min') => {
    return rateLimit({
        windowMs: evaluateTime(time),
        max: process.env.NODE_ENV === "production" ? count : 5000,
        message: "Too many requests from this IP, please try again later",
    });
};

export default rateLimiter