class StandardDate {
  msDiff;
  createdAt;
  standardTimestamp;

  constructor() {
    this.init();
  }

  getCurrentTime() {
    // return new Date().getTime() + this.msDiff;
    return this.standardTimestamp + new Date().getTime() - this.createdAt;
  }

  async init() {
    const before = new Date().getTime();
    const res = await this.getStandardTime();
    const requestTime = new Date().getTime() - before;
    const arriveTime = 30; // assume request go to server take 30ms
    this.createdAt = new Date().getTime();
    this.standardTimestamp = res.dateTime + arriveTime;
    this.msDiff = before + arriveTime - res.dateTime;

    document.getElementById("ms-diff").innerText = this.msDiff;
    document.getElementById("request-time").innerText = requestTime;

    // console.log(`diff:`, before - res.dateTime);
    // console.log(`server timestamp:`, res.dateTime);
    // console.log(`before timestamp:`, before);
    // console.log(`local  timestamp:`, new Date().getTime());
  }

  async getStandardTime() {
    const timezone = "Etc/UTC";

    const standardTimeRes = await new Promise((rs, rj) => {
      fetch(`https://sweet-dream-63fe.qnguyen-play.workers.dev`)
        .then((response) => {
          rs(response.json());
        })
        .catch((err) => {
          throw err;
        });
    });

    return standardTimeRes;
  }
}
