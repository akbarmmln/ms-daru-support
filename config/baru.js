const AssignorSCID = require('../config/assignor-socket-client');
let assignor;

async function initialize() {
    assignor = new AssignorSCID();
}

async function init() {
    await initialize();
    const result = await assignor.getAssignedPartition();
    console.log('resultasasasssssss ', JSON.stringify(result))
}

function getClientSocket() {
    init();
}

module.exports = {
    getClientSocket
};