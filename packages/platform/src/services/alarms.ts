import {
  AlarmService as IAlarmService,
  AlarmOptions,
  AlarmInfo,
} from "../interfaces/alarms";

export abstract class AlarmService implements IAlarmService {
  private listeners: ((alarm: AlarmInfo) => void)[] = [];

  abstract create(name: string, options: AlarmOptions): Promise<void>;
  abstract get(name: string): Promise<AlarmInfo | null>;
  abstract getAll(): Promise<AlarmInfo[]>;
  abstract clear(name: string): Promise<void>;
  abstract clearAll(): Promise<void>;

  onAlarm(callback: (alarm: AlarmInfo) => void): void {
    this.listeners.push(callback);
  }

  protected notifyListeners(alarm: AlarmInfo): void {
    this.listeners.forEach((listener) => listener(alarm));
  }

  protected validateOptions(options: AlarmOptions): void {
    if (!options.delayInMinutes && !options.periodInMinutes && !options.when) {
      throw new Error("At least one timing option must be provided");
    }
  }
}
