import { AlarmService, AlarmOptions, AlarmInfo } from "@boostlly/platform";

export class ExtensionAlarmService extends AlarmService {
  constructor() {
    super();
    this.setupAlarmListener();
  }

  async create(name: string, options: AlarmOptions): Promise<void> {
    this.validateOptions(options);

    const alarmInfo: chrome.alarms.AlarmCreateInfo = {};

    if (options.when) {
      alarmInfo.when = options.when;
    } else if (options.delayInMinutes) {
      alarmInfo.delayInMinutes = options.delayInMinutes;
    }

    if (options.periodInMinutes) {
      alarmInfo.periodInMinutes = options.periodInMinutes;
    }

    return new Promise((resolve, reject) => {
      chrome.alarms.create(name, alarmInfo, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  async get(name: string): Promise<AlarmInfo | null> {
    return new Promise((resolve, reject) => {
      chrome.alarms.get(name, (alarm) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (alarm) {
          resolve({
            name: alarm.name,
            scheduledTime: alarm.scheduledTime,
            periodInMinutes: alarm.periodInMinutes,
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  async getAll(): Promise<AlarmInfo[]> {
    return new Promise((resolve, reject) => {
      chrome.alarms.getAll((alarms) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(
            alarms.map((alarm) => ({
              name: alarm.name,
              scheduledTime: alarm.scheduledTime,
              periodInMinutes: alarm.periodInMinutes,
            })),
          );
        }
      });
    });
  }

  async clear(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.alarms.clear(name, (_wasCleared) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  async clearAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.alarms.clearAll((_wasCleared) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  private setupAlarmListener(): void {
    chrome.alarms.onAlarm.addListener((alarm) => {
      const alarmInfo: AlarmInfo = {
        name: alarm.name,
        scheduledTime: alarm.scheduledTime,
        periodInMinutes: alarm.periodInMinutes,
      };
      this.notifyListeners(alarmInfo);
    });
  }
}
