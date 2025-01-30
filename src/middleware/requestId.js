import { v4 as uuidv4 } from 'uuid';

const requestId = (req, res, next) => {
    req.requestId = uuidv4();
    res.setHeader('X-Request-ID', req.requestId);
    next();
};

export default requestId;