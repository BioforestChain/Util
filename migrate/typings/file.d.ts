export interface IWriteStreamFlag {
  encoding?: BufferEncoding;
  flags?: string;
}

export interface ICompilerOptions {
  rootDir: string[];
}

export interface IAttachData {
  percent: number;
  label: string;
  color:string
}

export interface IAlarmLevel {
  [x: string]: IAttachData;
  red:IAttachData;
  yellow:IAttachData;
  blue:IAttachData;
}

export interface IAlarmLevelColor {
  red:string;
  yellow:string;
  blue:string;
}

