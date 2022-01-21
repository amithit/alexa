

"use strict";
const STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    DO_NOT_PROCESS: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_FAILURE: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    ALREADY_EXISTS_CONFLICT: 409,
    UNSUPPORTED_MEDIA_TYPE: 415,
    INTERNAL_ERROR: 500
};
const NodeCache = require("node-cache");
const bluebird = require("bluebird");
const cache = bluebird.promisifyAll(new NodeCache());



module.exports = {
    STATUS_CODE,
    cache,


}
