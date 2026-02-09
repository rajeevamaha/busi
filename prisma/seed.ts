import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

const businessTypes = ['bakery', 'restaurant', 'cafe', 'cloud_kitchen', 'food_truck'];

const benchmarkData = [
  { category: 'rent_percent', healthyMin: 5, healthyMax: 15, warningThreshold: 15, criticalThreshold: 20 },
  { category: 'cogs_percent', healthyMin: 25, healthyMax: 35, warningThreshold: 35, criticalThreshold: 42 },
  { category: 'labor_percent', healthyMin: 20, healthyMax: 30, warningThreshold: 30, criticalThreshold: 38 },
  { category: 'marketing_percent', healthyMin: 3, healthyMax: 8, warningThreshold: 10, criticalThreshold: 15 },
  { category: 'total_operating_cost_percent', healthyMin: 70, healthyMax: 85, warningThreshold: 85, criticalThreshold: 92 },
  { category: 'net_margin_percent', healthyMin: 10, healthyMax: 20, warningThreshold: 10, criticalThreshold: 5 },
  { category: 'wastage_percent', healthyMin: 2, healthyMax: 5, warningThreshold: 5, criticalThreshold: 10 },
  { category: 'capacity_utilization', healthyMin: 70, healthyMax: 90, warningThreshold: 60, criticalThreshold: 40 },
  { category: 'margin_of_safety', healthyMin: 25, healthyMax: 100, warningThreshold: 25, criticalThreshold: 10 },
];

async function main() {
  console.log('Seeding benchmarks...');

  for (const type of businessTypes) {
    for (const benchmark of benchmarkData) {
      await prisma.benchmark.upsert({
        where: {
          category_businessType: {
            category: benchmark.category,
            businessType: type,
          },
        },
        update: benchmark,
        create: {
          ...benchmark,
          businessType: type,
        },
      });
    }
  }

  console.log(`Seeded ${businessTypes.length * benchmarkData.length} benchmark records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
