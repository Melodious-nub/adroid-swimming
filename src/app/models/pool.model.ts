export interface Pool {
  id?: string;
  homeOwnerName: string;
  phone: number;
  address: string;
  city: string;
  state: string;
  zipCode: number;
  length: number;
  width: number;
  gallons: number;
  howManyInlets: number;
  howManySkimmers: number;
  howManyLadders: number;
  howManySteps: number;
  filterBrand: string;
  filterModel: string;
  filterSerial: string;
  pumpBrand: string;
  pumpModel: string;
  pumpSerial: string;
  heaterBrandNG: string;
  heaterModelNG: string;
  heaterSerialNG: string;
  heaterBrandCBMS: string;
  heaterModelCBMS: string;
  heaterSerialCBMS: string;
  poolCleanerBrand: string;
  poolCleanerModel: string;
  poolCleanerSerial: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PoolResponse {
  success: boolean;
  count: number;
  data: Pool[];
}
