// Test if routes are loaded correctly
const employeeRoutes = require('./routes/employeeRoutes');

console.log('=== EMPLOYEE ROUTES LOADED ===\n');
console.log('Route object:', employeeRoutes);
console.log('\nRoute stack:');

if (employeeRoutes.stack) {
    employeeRoutes.stack.forEach((layer, index) => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
            console.log(`${index + 1}. ${methods} ${layer.route.path}`);
        }
    });
} else {
    console.log('No stack found - routes may not be loaded');
}

console.log('\n✅ If you see DELETE /:employeeCode above, the route is registered!');
console.log('⚠️  If not, there is a problem with the route file.');
