const { Worker } = require('worker_threads');
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');
const schedule = require('node-schedule');
const AssignorSCID = require('../config/assignor-socket-client');
const logger = require('../config/logger');
const connectClient = require('../usecase/index')

class PrivateScheduler {
  #assignorScid;

  async initialize() {
    this.#assignorScid = new AssignorSCID();
  }

  async getSCID() {
    const topic = 'Scheduler.getWebSocketClientID'
    const scheduler = new ToadScheduler();
    logger.infoWithContext(`Scheduler ${topic} will be checking`);
    
    await this.initialize();
    const result = await this.#assignorScid.getAssignedPartition();
    // if (result.state) {
    if (false) {
      const runTask = () => {
        logger.infoWithContext('init running runTask on getSCID')
        connectClient.connectClientSocket(result.posititon, result.podName);
      };

      runTask();
      schedule.scheduleJob('*/3 * * * *', runTask);
    } else {
      logger.infoWithContext('this pod can not running as web socket client (1)')
    }
  }
}

module.exports = PrivateScheduler;