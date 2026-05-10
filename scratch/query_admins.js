const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_7oM9ELuxjhUb@ep-calm-bird-apehu4fz-pooler.c-7.us-east-1.aws.neon.tech:5432/neondb?sslmode=require',
});

async function findAdmins() {
  try {
    await client.connect();
    const res = await client.query("SELECT id, phone_number, email, first_name, role FROM users WHERE role = 'ADMIN' OR role = '1'");
    if (res.rows.length === 0) {
      console.log('No ADMIN users found in the database.');
    } else {
      console.log('Admin Users:');
      console.table(res.rows);
    }
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

findAdmins();
