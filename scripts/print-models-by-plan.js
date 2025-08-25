// Print models returned by getModelsForPlan for quick debugging
// Usage: node scripts/print-models-by-plan.js

require('ts-node/register')

const { getModelsForPlan, CATEGORY_ORDER } = require('../lib/ai/innerai-models-config.ts')

function print(plan) {
  const models = getModelsForPlan(plan)
  console.log(`\n=== ${plan} (${models.length}) ===`)
  const byCat = {
    fast: models.filter(m => m.category === 'fast'),
    advanced: models.filter(m => m.category === 'advanced'),
    reasoning: models.filter(m => m.category === 'reasoning'),
  }
  for (const cat of ['fast','advanced','reasoning']) {
    if (!byCat[cat].length) continue
    console.log(`\n-- ${cat.toUpperCase()} (${byCat[cat].length})`) 
    for (const m of byCat[cat]) {
      console.log(`  - ${m.id} :: ${m.name}`)
    }
  }
}

for (const plan of ['FREE','LITE','PRO','ENTERPRISE']) print(plan)

