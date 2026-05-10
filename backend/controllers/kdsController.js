const supabase = require('../config/supabase');

const mapKitchenStatus = (status) => {
    const normalized = String(status || 'pending').toLowerCase();
    if (normalized === 'ready') return 'ready';
    if (normalized === 'preparing') return 'preparing';
    return 'pending';
};

const getKitchenOrders = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                order_code,
                counter_no,
                created_at,
                order_items (
                    id,
                    quantity,
                    kitchen_status,
                    note,
                    product_name_snapshot
                )
            `)
            .in('order_status', ['pending', 'preparing', 'ready'])
            .order('created_at', { ascending: true });

        if (error) {
            throw error;
        }

        const orders = (data || []).map((order) => {
            const firstKitchenStatus = order.order_items?.[0]?.kitchen_status;

            return {
                id: order.id,
                order_code: order.order_code,
                counter_no: order.counter_no,
                created_at: order.created_at,
                status: mapKitchenStatus(firstKitchenStatus),
                items: (order.order_items || []).map((item) => ({
                    id: item.id,
                    quantity: Number(item.quantity || 0),
                    kitchen_status: mapKitchenStatus(item.kitchen_status),
                    note: item.note || '',
                    name: item.product_name_snapshot || 'San pham'
                }))
            };
        });

        return res.status(200).json({
            success: true,
            data: orders
        });
    } catch (err) {
        console.error('Loi lay kitchen orders:', err);
        return res.status(500).json({
            success: false,
            message: 'Khong the tai danh sach don bep'
        });
    }
};

module.exports = { getKitchenOrders };
