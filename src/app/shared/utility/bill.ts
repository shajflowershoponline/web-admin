import { daysDiff, getDateDifference, monthDiff, weeksDiff } from './date';

export const getBill = (dueAmount: number, dueDate: Date, type: 'DAILY' | 'WEEKLY' | 'MONTHLY') => {
  // Calculate overdue months
  const current = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate() + 1);
  const { days, months, weeks } = getDateDifference(dueDate, current);
  // const overdueMonths = monthDiff(dueDate , new Date());
  // Calculate overdue weeks
  // const overdueWeeks = weeksDiff(dueDate , new Date());

  // Calculate overdue days
  // const overdueDays = daysDiff(dueDate, new Date());

  // Calculate overdue charge
  let overdueCharge = 0;
  if(type === 'MONTHLY') {
    overdueCharge = calculateOverdueCharge(Number(dueAmount), months);
  } else if(type === 'WEEKLY') {
    overdueCharge = calculateOverdueCharge(Number(dueAmount), weeks);
  } else {
    overdueCharge = calculateOverdueCharge(Number(dueAmount), days);
  }

  // Calculate total amount
  const totalDueAmount = Number(dueAmount) + overdueCharge;

  return {
    dueAmount: Number(dueAmount).toFixed(2),
    overdueDays: days,
    overdueWeeks: weeks,
    overdueMonths: months,
    overdueCharge: Number(overdueCharge).toFixed(2),
    totalDueAmount: Number(totalDueAmount).toFixed(2)
  };
};

const calculateOverdueCharge = (dueAmount, numberOfDue) => {
  const overdueChargeRate = 0.02; // 2% per due
  const overdueCharge = dueAmount * overdueChargeRate * (numberOfDue >= 0 ? numberOfDue : numberOfDue);
  // const overdueCharge = Number(dueAmount) * Number(overdueChargeRate) * Number(numberOfDue) > 0 ? Number(numberOfDue) : 0;
  return overdueCharge;
};
