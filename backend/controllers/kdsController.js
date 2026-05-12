const supabase = require('../config/supabase');

// Map trạng thái bếp
const mapKitchenStatus = (status) => {
    const normalized = String(status || 'PENDING').toUpperCase();
    if (normalized === 'COMPLETED') return 'COMPLETED';
    if (normalized === 'PREPARING') return 'PREPARING';
    return 'PENDING';
};

// Lấy danh sách đơn hàng bếp (realtime)
const getKitchenOrders = async (req, res) => {
    try {
        // Lấy order_items với status PENDING hoặc PREPARING
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .in('kitchen_status', ['PENDING', 'PREPARING'])
            .order('created_at', { ascending: true });

        if (itemsError) {
            console.error('Error fetching order_items:', itemsError);
            throw itemsError;
        }

        if (!items || items.length === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        // Lấy thông tin orders
        const orderIds = [...new Set(items.map(item => item.order_id))];
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, employee_code, total_amount, created_at')
            .in('id', orderIds);

        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
        }

        // Lấy thông tin employees
        const employeeCodes = orders ? [...new Set(orders.map(o => o.employee_code))] : [];
        const { data: employees, error: employeesError } = await supabase
            .from('employees')
            .select('employee_code, full_name')
            .in('employee_code', employeeCodes);

        if (employeesError) {
            console.error('Error fetching employees:', employeesError);
        }

        // Lấy thông tin products
        const productIds = items.map(item => item.product_id).filter(Boolean);
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, cooking_instructions, preparation_time')
            .in('id', productIds);

        if (productsError) {
            console.error('Error fetching products:', productsError);
        }

        // Map data
        const ordersMap = new Map();
        const employeesMap = new Map(employees?.map(e => [e.employee_code, e]) || []);
        const productsMap = new Map(products?.map(p => [p.id, p]) || []);
        const ordersDataMap = new Map(orders?.map(o => [o.id, o]) || []);

        items.forEach((item) => {
            const orderId = item.order_id;
            const orderData = ordersDataMap.get(orderId);
            
            if (!ordersMap.has(orderId)) {
                const employee = employeesMap.get(orderData?.employee_code);
                ordersMap.set(orderId, {
                    order_id: orderId,
                    employee_name: employee?.full_name || 'N/A',
                    employee_code: orderData?.employee_code || 'N/A',
                    total_amount: orderData?.total_amount || 0,
                    created_at: orderData?.created_at || item.created_at,
                    items: []
                });
            }
            
            const product = productsMap.get(item.product_id);
            ordersMap.get(orderId).items.push({
                id: item.id,
                product_name: item.product_name_snapshot || 'Món ăn',
                quantity: item.quantity,
                unit_price: item.unit_price,
                kitchen_status: mapKitchenStatus(item.kitchen_status),
                note: item.note || '',
                cooking_instructions: product?.cooking_instructions || 'Không có hướng dẫn',
                preparation_time: product?.preparation_time || 10,
                started_at: item.started_at,
                completed_at: item.completed_at,
                created_at: item.created_at
            });
        });

        const result = Array.from(ordersMap.values());

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Lỗi lấy kitchen orders:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể tải danh sách đơn bếp',
            error: err.message
        });
    }
};

// Cập nhật trạng thái món ăn
const updateItemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { kitchen_status } = req.body;

        if (!['PENDING', 'PREPARING', 'COMPLETED'].includes(kitchen_status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const updateData = { kitchen_status };
        
        // Nếu chuyển sang PREPARING, lưu thời gian bắt đầu
        if (kitchen_status === 'PREPARING') {
            updateData.started_at = new Date().toISOString();
        }
        
        // Nếu chuyển sang COMPLETED, lưu thời gian hoàn thành
        if (kitchen_status === 'COMPLETED') {
            updateData.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('order_items')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: data[0]
        });
    } catch (err) {
        console.error('Lỗi cập nhật trạng thái:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể cập nhật trạng thái'
        });
    }
};

// Lấy thống kê công việc hôm nay
const getTodayStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
            .from('order_items')
            .select('id, kitchen_status, product_name_snapshot, quantity, completed_at, created_at')
            .gte('created_at', today.toISOString());

        if (error) {
            throw error;
        }

        const stats = {
            total: data.length,
            pending: data.filter(item => item.kitchen_status === 'PENDING').length,
            preparing: data.filter(item => item.kitchen_status === 'PREPARING').length,
            completed: data.filter(item => item.kitchen_status === 'COMPLETED').length,
            items: data.map(item => ({
                id: item.id,
                product_name: item.product_name_snapshot,
                quantity: item.quantity,
                status: mapKitchenStatus(item.kitchen_status),
                completed_at: item.completed_at,
                created_at: item.created_at
            }))
        };

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('Lỗi lấy thống kê:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể tải thống kê'
        });
    }
};

module.exports = { 
    getKitchenOrders,
    updateItemStatus,
    getTodayStats
};
