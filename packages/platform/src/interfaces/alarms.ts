export interface AlarmOptions {
  delayInMinutes?: number;
  periodInMinutes?: number;
  when?: number;
}

export interface AlarmInfo {
  name: string;
  scheduledTime: number;
  periodInMinutes?: number;
}

export interface AlarmService {
  create(name: string, options: AlarmOptions): Promise<void>;
  get(name: string): Promise<AlarmInfo | null>;
  getAll(): Promise<AlarmInfo[]>;
  clear(name: string): Promise<void>;
  clearAll(): Promise<void>;
  onAlarm: (callback: (alarm: AlarmInfo) => void) => void;
}
