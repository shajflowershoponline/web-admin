import { StaffAccess } from "././staff-access";
export class StaffUser {
  staffUserId: string;
  staffUserCode: string | null;
  userName: string;
  password: string;
  name: string;
  accessGranted: boolean | null;
  active: boolean;
  staffAccess: StaffAccess;
}
