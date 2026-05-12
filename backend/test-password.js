// ============================================
// TEST PASSWORD HASH - Kiểm tra bcrypt hash
// ============================================
// Chạy: node test-password.js
// ============================================

const bcrypt = require('bcrypt');

const password = '123456';
const hashes = [
    '$2b$10$K7L1OJjM9JxP3P0B1Xr8uOVt9uD8Kk2M8xTjY8Qj5K8Q8dDk4G6mW',
    '$2a$10$CwTycUXWue0Thq9StjUM0uJ8qNKwGL2YJvLiPqrJLBqKzYKJgKLOu'
];

console.log('=== TESTING PASSWORD HASHES ===\n');
console.log('Password to test:', password);
console.log('Password length:', password.length);
console.log('\n');

// Test existing hashes
hashes.forEach((hash, index) => {
    console.log(`--- Hash ${index + 1} ---`);
    console.log('Hash:', hash);
    console.log('Length:', hash.length);
    
    bcrypt.compare(password, hash, (err, result) => {
        if (err) {
            console.log('❌ Error:', err.message);
        } else {
            console.log('Match:', result ? '✅ YES' : '❌ NO');
        }
        console.log('\n');
    });
});

// Generate new hash
console.log('--- Generating NEW hash ---');
bcrypt.hash(password, 10, (err, newHash) => {
    if (err) {
        console.log('❌ Error generating hash:', err.message);
    } else {
        console.log('✅ New hash generated:');
        console.log(newHash);
        console.log('Length:', newHash.length);
        
        // Test the new hash immediately
        bcrypt.compare(password, newHash, (err, result) => {
            if (err) {
                console.log('❌ Error testing new hash:', err.message);
            } else {
                console.log('New hash works:', result ? '✅ YES' : '❌ NO');
            }
            
            console.log('\n=== COPY THIS SQL TO UPDATE DATABASE ===\n');
            console.log(`UPDATE employees`);
            console.log(`SET password_hash = '${newHash}'`);
            console.log(`WHERE employee_code = 'ADMIN01';`);
            console.log('\n');
        });
    }
});
