// FCL Types
/* eslint-disable @typescript-eslint/no-explicit-any */
export type FCLArgumentFunction = (value: any, type: any) => any;

export interface FCLTypes {
  Address: any;
  UFix64: any;
  UInt64: any;
  String: any;
  Array: (type: any) => any;
  Optional: (type: any) => any;
}

export interface FCLAuth {
  addr: string;
  keyId: number;
  signature: string;
}
