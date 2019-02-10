const wait = require('../../util/wait');

function Scheduler (task) {
  this.running = true;
  this.task = task;
  this.wait = wait(0);

  const worker = async () => {
    const waitLength = await this.task();
    if (!this.running) return;

    this.wait = wait(waitLength);
    await this.wait.over;
    if (!this.running) return;

    return worker();
  };

  this.work = worker();
}

Scheduler.prototype.stop = function () {
  this.running = false;
  this.wait.cancel();
  return this.work;
};

module.exports = Scheduler;
