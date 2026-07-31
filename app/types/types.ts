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