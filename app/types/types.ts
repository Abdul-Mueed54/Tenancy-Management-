export default interface TenantFormData {
  fullName: string;
  contactNumber: string;
  presentAddress: string;
  cnicNumber: string;
  buildingName: string;
  unitNumber: string;
  advanceAmount: string;
  monthlyRent: string;
  firstMonthRentCollected: string; // NEW FIELD
  rentDueDay: string;
};

export type RegisterTenantPayload = {
  fullName: string;
  contactNumber: string;
  presentAddress: string;
  cnicNumber: string;
  cnicExpiryDate: string;
  cnic_uri: string | null;
  buildingName: string;
  advanceAmount: number;
  monthlyRent: number;
  unitNumber: string;
  firstMonthRentCollected: number;
  moveInDate: string;
  rentDueDay: number;
};