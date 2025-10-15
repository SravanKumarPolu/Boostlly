import { AlarmService, AlarmOptions, AlarmInfo } from "@boostlly/platform";

export class WebAlarmService extends AlarmService {
  private alarms = new Map<
    string,
    { timer: ReturnType<typeof setTimeout>; info: AlarmInfo }
  >();

  async create(name: string, options: AlarmOptions): Promise<void> {
    this.validateOptions(options);

    const now = Date.now();
    let scheduledTime: number;

    if (options.when) {
      scheduledTime = options.when;
    } else if (options.delayInMinutes) {
      scheduledTime = now + options.delayInMinutes * 60 * 1000;
    } else {
      throw new Error("Invalid alarm options");
    }

    const delay = Math.max(0, scheduledTime - now);
    const timer = setTimeout(() => {
      this.triggerAlarm(name);
      if (options.periodInMinutes) {
        // Set up recurring alarm
        const interval = setInterval(
          () => {
            this.triggerAlarm(name);
          },
          options.periodInMinutes * 60 * 1000,
        );

        // Store interval reference for cleanup
        this.alarms.set(name, {
          timer: interval as any,
          info: {
            name,
            scheduledTime,
            periodInMinutes: options.periodInMinutes,
          },
        });
      }
    }, delay);

    const alarmInfo: AlarmInfo = {
      name,
      scheduledTime,
      periodInMinutes: options.periodInMinutes,
    };

    this.alarms.set(name, { timer, info: alarmInfo });
  }

  async get(name: string): Promise<AlarmInfo | null> {
    const alarm = this.alarms.get(name);
    return alarm ? alarm.info : null;
  }

  async getAll(): Promise<AlarmInfo[]> {
    return Array.from(this.alarms.values()).map((alarm) => alarm.info);
  }

  async clear(name: string): Promise<void> {
    const alarm = this.alarms.get(name);
    if (alarm) {
      clearTimeout(alarm.timer);
      clearInterval(alarm.timer);
      this.alarms.delete(name);
    }
  }

  async clearAll(): Promise<void> {
    this.alarms.forEach((alarm) => {
      clearTimeout(alarm.timer);
      clearInterval(alarm.timer);
    });
    this.alarms.clear();
  }

  private triggerAlarm(name: string): void {
    const alarm = this.alarms.get(name);
    if (alarm) {
      this.notifyListeners(alarm.info);
    }
  }
}
