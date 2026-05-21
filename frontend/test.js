const { Client } = require('pg'); 
const regions = ['us-west-2', 'eu-north-1', 'eu-south-1']; 
const password = 'jGQpjV1wJ7pSFdXt'; 
const project = 'vjjykfkbfkfalhqkczsd'; 
async function test() { 
  for (const region of regions) { 
    const connectionString = `postgresql://postgres.${project}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres`; 
    const client = new Client({ connectionString, connectionTimeoutMillis: 5000 }); 
    try { 
      await client.connect(); 
      console.log('SUCCESS on region', region); 
      await client.end(); 
      return; 
    } catch(e) { 
      console.log('Failed', region, e.message); 
    } 
  } 
} 
test();
