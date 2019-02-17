// jobs.push(new Job ({
//   process: async (args) => {
//     if (!args.endpoint) {
//       // Get the list of available bike stations again to replenish the list
//       const stations = await CitiBike.getStationList();
//     }
//     harvester(args.endpoint, args.outDir);
//   },
//   frequency: 1000, // 1s
//   getArgs: () => ({endpoint: weather.next(), outDir: path.join(__dirname, 'out', 'weather')}),
//   kill: () => harvester.stop()
// }));

module.exports = class Job {
  constructor (args) {
    this.name = args.name;
    this.process = args.process;
    this.frequency = args.frequency;
    this.getArgs = args.getArgs;
    this.kill = args.kill;
    this.wait = !!args.wait;

    this._timeout = null;

    this.run = this.run.bind(this);

    this.run();
    this.running = true;
  }

  run () {
    this._job = this.process()
      .then(() => console.log(`Finished job: ${this.name}`))
      .catch(() => console.log(`Errored job: ${this.name}`));
    console.log(`Called job: ${this.name}`);

    if (this.wait) {
      this._job.then(() => {
        if (this.running) this._timeout = setTimeout(this.run, this.frequency);
      });
    } else {
      this._timeout = setTimeout(this.run, this.frequency);
    }
  }

  async stop () {
    this.running = false;
    clearTimeout(this._timeout);
    return this._job;
  }
};
