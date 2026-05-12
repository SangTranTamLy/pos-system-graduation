// Test create order API
require('dotenv').config();
const supabase = require('./config/supabase');

async function testCreateOrder() {
    console.log('=== TESTING CREATE ORDER ===\n');

    // Test 1: Check orders table schema
    console.log('Test 1: Check orders table schema...');
    const { data: columns, error: schemaError } = await supabase
        .from('orders')
        .select('*')
        .limit(0);

    if (schemaError) {
        console.log('❌ Error checking schema:', schemaError);
    } else {
        console.log('✅ Orders table exists');
    }

    // Test 2: Check if we can insert
    console.log('\nTest 2: Try to insert a test order...');
    const testOrder = {
        employee_code: 'ADMIN01',
        total_amount: 100000,
        status: 'COMPLETED',
        payment_method: 'CASH',
        cancellation_reason: null,
        created_at: new Date().toISOString()
    };

    console.log('Test order data:', testOrder);

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(testOrder)
        .select()
        .single();

    if (orderError) {
        console.log('❌ Error creating order:', orderError);
        console.log('Error code:', orderError.code);
        console.log('Error message:', orderError.message);
        console.log('Error details:', orderError.details);
        console.log('Error hint:', orderError.hint);
    } else {
        console.log('✅ Order created successfully!');
        console.log('Order ID:', order.id);

        // Test 3: Try to insert order_items
        console.log('\nTest 3: Try to insert order items...');
        const testItems = [
            {
                order_id: order.id,
                product_id: '00000000-0000-0000-0000-000000000001', // Fake UUID
                product_name_snapshot: 'Test Product',
                quantity: 1,
                unit_price: 100000,
                kitchen_status: 'PENDING',
                note: '',
                created_at: new Date().toISOString()
            }
        ];

        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .insert(testItems)
            .select();

        if (itemsError) {
            console.log('❌ Error creating order items:', itemsError);
            console.log('Error code:', itemsError.code);
            console.log('Error message:', itemsError.message);
            
            // Cleanup: delete test order
            await supabase.from('orders').delete().eq('id', order.id);
            console.log('🧹 Cleaned up test order');
        } else {
            console.log('✅ Order items created successfully!');
            console.log('Items count:', items.length);

            // Cleanup: delete test data
            await supabase.from('orders').delete().eq('id', order.id);
            console.log('🧹 Cleaned up test data');
        }
    }

    console.log('\n=== TEST COMPLETE ===');
}

testCreateOrder().catch(error => {
    console.error('Fatal error:', error);
});
