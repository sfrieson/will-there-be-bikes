import wait, { WaiterInterface } from '../../util/wait';

/*
  Takes a function, which returns a value of how many seconds until the same function should be run again.
*/
export default class Scheduler {
  running: Boolean
  private task: Function
  private wait: WaiterInterface
  private work: Promise<number|undefined>
  constructor (task: Function) {
    this.running = true;
    this.task = task;
    this.wait = wait(0);

    const worker = async (): Promise<number|undefined> => {
      const waitLength = await this.task();
      if (!this.running) return;

      this.wait = wait(waitLength);
      await this.wait.over;
      if (!this.running) return;

      return worker();
    };

    this.work = worker();
  }

  stop () {
    this.running = false;
    this.wait.cancel();
    return this.work;
  };
}
