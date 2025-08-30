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

class StandardDateNew {
  msDiff = 0;
  createdAt = Date.now();
  standardTimestamp = Date.now();
  estimatedResponseTime = 80; // assume time from server response to client
  localGreaterThanStandardInMs = 0;
  timestampUrl;
  greaterTimeUrl;
  isUseLocal;

  constructor({ timestampUrl, greaterTimeUrl, isUseLocal }) {
    this.timestampUrl = timestampUrl;
    this.greaterTimeUrl = greaterTimeUrl;
    this.isUseLocal = isUseLocal;
    this.init();
  }

  async init() {
    if (this.isUseLocal) {
      console.log(`use local timestamp as standard`);
      return;
    }

    await this.syncTime();
  }

  //  Get server time at any specific time on local
  getCurrentTime() {
    // return this.standardTimestamp + Date.now() - this.createdAt;
    return Date.now() - this.localGreaterThanStandardInMs;
  }

  async getStandardTimestamp() {
    if (this.timestampUrl) {
      // const timezone = "Etc/UTC";
      const res = await fetch(this.timestampUrl);
      const resData = await res.json();
      return resData.data.timeStamp;
    }

    return Date.now();
  }

  async syncTime() {
    // const resTimestamp = await this.getStandardTimestamp();
    const beforeRequestTime = Date.now();
    const greaterThanServer = await this.getGreaterThanServerTimestamp();
    const sendTime =
      Date.now() - beforeRequestTime - this.estimatedResponseTime;
    this.localGreaterThanStandardInMs = greaterThanServer
      ? greaterThanServer + sendTime
      : 0;

    document.getElementById(`test`).innerText = `
                    local greater: ${
                      Date.now() - this.localGreaterThanStandardInMs
                    }
                    greater than sv: ${greaterThanServer}
                  `;

    document.getElementById("time-greater-than-server").innerText =
      this.localGreaterThanStandardInMs;
    document.getElementById("request-time").innerText =
      Date.now() - beforeRequestTime;
  }

  async getGreaterThanServerTimestamp() {
    try {
      if (this.greaterTimeUrl) {
        // const timezone = "Etc/UTC";
        const res = await fetch(
          `${this.greaterTimeUrl}?localTimestamp=${Date.now()}`
        );
        const resData = await res.json();
        return resData.data.localGreaterInMs;
      }

      return 0;
    } catch (err) {
      return 0;
    }
  }
}
