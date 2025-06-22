export class CustomerUser {
  customerUserId: string;
  customerUserCode: string | null;
  name?: string;
  email: string;
  mobileNumber: string;
  password: string;
  currentOtp: string;
  isVerifiedUser: boolean;
  active: boolean;
}
