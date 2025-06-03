import { AccessPages } from "../shared/models/acces-pages.model";
import { StaffUser } from "././staff-user";
export class StaffAccess {
  staffAccessId: string;
  staffAccessCode: string | null;
  name: string;
  accessPages: AccessPages[];
  active: boolean;
  staffUsers: StaffUser[];
}
