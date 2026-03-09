import { env } from '../config/env';
import { StripeService } from '../services/stripe.service';
import { VertexService } from '../services/vertex.service';
import { db } from '../config/firebase-admin';
import * as logger from 'firebase-functions/logger';

/**
 * Pre-flight Check
 * Verifies that the environment is ready for production.
 */
async function runPreflightCheck() {
  console.log('🚀 Starting Production Pre-flight Check...');

  const results = {
    vertexAI: false,
    stripe: false,
    vectorIndex: false,
    storage: false,
  };

  // 1. Verify Vertex AI Connectivity
  try {
    console.log('Checking Vertex AI...');
    await VertexService.generateEmbeddings('Pre-flight test pulse');
    results.vertexAI = true;
    console.log('✅ Vertex AI: Connected');
  } catch (err: any) {
    console.error('❌ Vertex AI: Failed', err.message);
  }

  // 2. Verify Stripe Configuration (Partial check)
  try {
     console.log('Checking Stripe Config...');
     if (env.stripeSecretKey.startsWith('sk_')) {
       results.stripe = true;
       console.log('✅ Stripe: Keys present');
     } else {
       console.warn('⚠️ Stripe: Secret key looks like a test key or is missing sk_ prefix');
     }
  } catch (err: any) {
     console.error('❌ Stripe: Failed', err.message);
  }

  // 3. Verify Vector Index Presence
  try {
    console.log('Checking Vector Index (memories)...');
    const memories = await db.collection('memories').limit(1).get();
    results.vectorIndex = true;
    console.log(`✅ Vector Index: Reachable (${memories.size} records found)`);
  } catch (err: any) {
    console.error('❌ Vector Index: Failed', err.message);
  }

  // 4. Verify Firestore Connectivity
  try {
    console.log('Checking Database...');
    await db.collection('_health').doc('pulse').set({ lastCheck: new Date() });
    results.storage = true;
    console.log('✅ Database: Writable');
  } catch (err: any) {
    console.error('❌ Database: Failed', err.message);
  }

  console.log('\n--- Pre-flight Summary ---');
  console.table(results);

  const allPassed = Object.values(results).every(v => v === true);
  if (allPassed) {
    console.log('\n✨ ALL SYSTEMS READY FOR MANIFESTATION ✨');
  } else {
    console.error('\n🛑 PRODUCTION BLOCKED: Resolve errors above before deploying.');
    process.exit(1);
  }
}

if (require.main === module) {
  runPreflightCheck();
}
