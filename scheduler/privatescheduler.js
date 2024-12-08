const { Worker } = require('worker_threads');
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');
const AssignorSCID = require('../config/assignor-socket-client');
const logger = require('../config/logger');

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
    console.log('resultasasasssssss ', JSON.stringify(result))
    if (result.state) {
      const task = new Task(topic, () => {
        let worker = new Worker("./scheduler/websocket/index.js",
          {
            workerData: {
              topic: topic,
              id: 1,
              data: result.posititon
            }
          })
        worker.once("message", result => {
          logger.infoWithContext(`${topic} (on message) Payload Result ${JSON.stringify(result)}`);
          worker.terminate();
        });
        worker.once("error", result => {
          logger.infoWithContext(`${topic} (on error) Payload Result ${JSON.stringify(result)}`);
          worker[i].terminate();
        });
        worker.once("exit", result => {
          logger.infoWithContext(`${topic} (on exit) Payload Result ${JSON.stringify(result)}`);
          worker[i].terminate();
        });

      });

      const job = new SimpleIntervalJob(
        {
          milliseconds: parseInt(86400254),
          runImmediately: true
        }, task)

      scheduler.addSimpleIntervalJob(job)
    } else {
      console.log('belum bisa dijalanin')
    }
  }
}

module.exports = PrivateScheduler;