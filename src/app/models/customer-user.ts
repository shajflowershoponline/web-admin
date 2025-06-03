export class CustomerUser {
  customerUserId: string;
  customerUserCode: string | null;
  name?: string;
  email: string;
  password: string;
  currentOtp: string;
  isVerifiedUser: boolean;
  active: boolean;
}
