import "server-only";

import { prisma } from "@/lib/db";

// Tarif standar pemotongan otomatis gateway & platform (3.0%)
export const AUTO_FEE_RATE = 0.03;

export type CashflowPoint = {
  id: string;
  title: string;
  subtitle: string;
  revenueMinor: number;
  expenseMinor: number;
  netMinor: number;
  count: number;
};

export type CashflowSummary = {
  totalRevenue: number;
  totalExpense: number;
  totalNet: number;
  totalOrders: number;
  netMarginPct: number;
  points: CashflowPoint[];
};

export type FinancialAnalytics = {
  feeRatePercentage: number;
  daily: CashflowSummary;
  weekly: CashflowSummary;
  yearly: CashflowSummary;
};

function summarizePoints(points: CashflowPoint[]): CashflowSummary {
  const totalRevenue = points.reduce((acc, p) => acc + p.revenueMinor, 0);
  const totalExpense = points.reduce((acc, p) => acc + p.expenseMinor, 0);
  const totalNet = totalRevenue - totalExpense;
  const totalOrders = points.reduce((acc, p) => acc + p.count, 0);
  const netMarginPct =
    totalRevenue > 0
      ? Math.round((totalNet / totalRevenue) * 1000) / 10
      : 100 - AUTO_FEE_RATE * 100;

  return {
    totalRevenue,
    totalExpense,
    totalNet,
    totalOrders,
    netMarginPct,
    points,
  };
}

const ID_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const ID_DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function buildDailyPoints(
  items: { lineTotalMinor: number; createdAt: Date }[],
  refDate: Date,
): CashflowSummary {
  const points: CashflowPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const cur = new Date(refDate);
    cur.setDate(cur.getDate() - i);
    const start = new Date(
      cur.getFullYear(),
      cur.getMonth(),
      cur.getDate(),
      0,
      0,
      0,
      0,
    );
    const end = new Date(
      cur.getFullYear(),
      cur.getMonth(),
      cur.getDate(),
      23,
      59,
      59,
      999,
    );

    const matches = items.filter((it) => {
      const t = new Date(it.createdAt);
      return t >= start && t <= end;
    });

    const revenue = matches.reduce((sum, item) => sum + item.lineTotalMinor, 0);
    const expense = Math.round(revenue * AUTO_FEE_RATE);

    points.push({
      id: `day-${i}`,
      title: `${cur.getDate()} ${ID_MONTHS[cur.getMonth()]}`,
      subtitle: ID_DAYS[cur.getDay()],
      revenueMinor: revenue,
      expenseMinor: expense,
      netMinor: revenue - expense,
      count: matches.length,
    });
  }

  return summarizePoints(points);
}

function buildWeeklyPoints(
  items: { lineTotalMinor: number; createdAt: Date }[],
  refDate: Date,
): CashflowSummary {
  const points: CashflowPoint[] = [];

  for (let w = 7; w >= 0; w--) {
    const wEnd = new Date(refDate);
    wEnd.setDate(wEnd.getDate() - w * 7);
    wEnd.setHours(23, 59, 59, 999);

    const wStart = new Date(wEnd);
    wStart.setDate(wStart.getDate() - 6);
    wStart.setHours(0, 0, 0, 0);

    const matches = items.filter((it) => {
      const t = new Date(it.createdAt);
      return t >= wStart && t <= wEnd;
    });

    const revenue = matches.reduce((sum, item) => sum + item.lineTotalMinor, 0);
    const expense = Math.round(revenue * AUTO_FEE_RATE);

    points.push({
      id: `week-${8 - w}`,
      title: `W${8 - w}`,
      subtitle: `${wStart.getDate()} ${ID_MONTHS[wStart.getMonth()]} - ${wEnd.getDate()} ${ID_MONTHS[wEnd.getMonth()]}`,
      revenueMinor: revenue,
      expenseMinor: expense,
      netMinor: revenue - expense,
      count: matches.length,
    });
  }

  return summarizePoints(points);
}

function buildYearlyPoints(
  items: { lineTotalMinor: number; createdAt: Date }[],
  refDate: Date,
): CashflowSummary {
  const points: CashflowPoint[] = [];

  for (let m = 11; m >= 0; m--) {
    const y = refDate.getFullYear();
    const targetMonth = refDate.getMonth() - m;
    const dateObj = new Date(y, targetMonth, 1);
    const targetYear = dateObj.getFullYear();
    const actualMonth = dateObj.getMonth();

    const mStart = new Date(targetYear, actualMonth, 1, 0, 0, 0, 0);
    const mEnd = new Date(targetYear, actualMonth + 1, 0, 23, 59, 59, 999);

    const matches = items.filter((it) => {
      const t = new Date(it.createdAt);
      return t >= mStart && t <= mEnd;
    });

    const revenue = matches.reduce((sum, item) => sum + item.lineTotalMinor, 0);
    const expense = Math.round(revenue * AUTO_FEE_RATE);

    points.push({
      id: `month-${targetYear}-${actualMonth}`,
      title: `${ID_MONTHS[actualMonth]}`,
      subtitle: `${ID_MONTHS[actualMonth]} ${targetYear}`,
      revenueMinor: revenue,
      expenseMinor: expense,
      netMinor: revenue - expense,
      count: matches.length,
    });
  }

  return summarizePoints(points);
}

/**
 * Mengambil histori keuangan arus kas terisolasi ketat per seller.
 * @param sellerId ID akun seller yang sedang login
 * @param userRole Role akun (SELLER atau ADMIN)
 */
export async function getFinancialAnalytics(
  sellerId: string,
  userRole?: string,
): Promise<FinancialAnalytics> {
  const whereClause =
    userRole === "ADMIN"
      ? { OR: [{ sellerId }, { sellerId: null }] }
      : { sellerId };

  const sellerProducts = await prisma.product.findMany({
    where: whereClause,
    select: {
      id: true,
    },
  });

  const productIds = sellerProducts.map((p) => p.id);
  const now = new Date();

  // Jika seller belum punya produk, kembalikan seluruh titik grafik sebagai 0 murni
  if (productIds.length === 0) {
    return {
      feeRatePercentage: AUTO_FEE_RATE * 100,
      daily: buildDailyPoints([], now),
      weekly: buildWeeklyPoints([], now),
      yearly: buildYearlyPoints([], now),
    };
  }

  const oneYearBoundary = new Date(
    now.getFullYear(),
    now.getMonth() - 11,
    1,
    0,
    0,
    0,
    0,
  );

  const paidOrderItems = await prisma.orderItem.findMany({
    where: {
      productId: { in: productIds },
      order: { paymentStatus: "PAID" },
      createdAt: { gte: oneYearBoundary },
    },
    select: {
      id: true,
      lineTotalMinor: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    feeRatePercentage: AUTO_FEE_RATE * 100,
    daily: buildDailyPoints(paidOrderItems, now),
    weekly: buildWeeklyPoints(paidOrderItems, now),
    yearly: buildYearlyPoints(paidOrderItems, now),
  };
}
