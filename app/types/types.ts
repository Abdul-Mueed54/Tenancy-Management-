export default interface TenantFormData {
  tenantsId: string;
  fullName: string;
  contactNumber: string;
  presentAddress: string;
  cnicNumber: string;
  buildingId: string;
  buildingName: string;
  unitNumber: string;
  advanceAmount: string;
  monthlyRent: string;
  firstMonthRentCollected: string; // NEW FIELD
  rentDueDay: string;
};

export type RegisterTenantPayload = {
  tenantsId: string;
  fullName: string;
  contactNumber: string;
  presentAddress: string;
  cnicNumber: string;
  cnicExpiryDate: string;
  cnic_uri: string | null;
  buildingId: string;
  buildingName: string;
  advanceAmount: number;
  monthlyRent: number;
  unitNumber: string;
  firstMonthRentCollected: number;
  moveInDate: string;
  rentDueDay: number;
};