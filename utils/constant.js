const Constant = {
    REDIS: {
        WEBSOCKET_CLIENT: 'WEBSOCKET_CLIENT'
    }
};

const formatNameRedis = (name_redis, service, socket) => {
    let val = name_redis + ":" + service + "/" + socket
    return val
}

module.exports = {
    Constant,
    formatNameRedis,
}