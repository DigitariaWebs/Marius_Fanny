const mongoose = require('mongoose');
require('dotenv').config();

const mappings = [
  { from: 'Viennoiseries', to: 'VIENNOISERIES' },
  { from: 'Gâteaux signatures', to: 'GÂTEAUX SIGNATURES' },
  { from: 'Tarte', to: 'TARTES' },
  { from: 'Boite à lunch', to: 'BOÎTE À LUNCH' },
  { from: 'Plateaux', to: 'PLATEAUX' },
  { from: 'Salades', to: 'SALADES' },
  { from: 'Plateaux desserts', to: 'PLATEAUX DESSERTS' },
  { from: 'Salade repas', to: 'SALADE REPAS' },
  { from: 'Plateau repas', to: 'PLATEAUX REPAS' },
  { from: "P'tit déj", to: 'PETIT DÉJEUNER' },
  { from: 'Pâtisserie individuelle', to: 'PÂTISSERIES INDIVIDUELLES' },
  { from: 'Quiche, pâté, pizza', to: 'QUICHES, PÂTÉS ET PIZZAS' },
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);
  const col = mongoose.connection.db.collection('products');

  for (const m of mappings) {
    // Products with category as string
    const r1 = await col.updateMany(
      { category: m.from },
      { $set: { category: m.to } }
    );
    // Products with category as array containing old name
    const r2 = await col.updateMany(
      { category: { $elemMatch: { $eq: m.from } } },
      { $set: { 'category.$': m.to } }
    );
    const total = r1.modifiedCount + r2.modifiedCount;
    if (total > 0) console.log(`${m.from} -> ${m.to}: ${total} updated`);
  }

  // Verify
  const distinct = await col.distinct('category');
  console.log('\nFinal categories:', distinct.sort());

  await mongoose.disconnect();
  console.log('Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
