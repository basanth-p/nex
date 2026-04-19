import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const projects = [
  { name: 'BillSplit API', github_repo: 'yourusername/billsplit-api', client_name: null },
  { name: 'BillSplit Web', github_repo: 'yourusername/billsplit-web', client_name: null },
  { name: 'Fleet Dashboard', github_repo: 'yourusername/fleet-dashboard', client_name: 'Client Name' },
  // add all your repos here
];

async function seed() {
  const { data, error } = await supabase
    .from('projects')
    .insert(projects);

  if (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Projects registered in Nex');
  process.exit(0);
}

seed();