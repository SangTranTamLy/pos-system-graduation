const supabase = require('../config/supabase');

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
    try {
        const { items, payment_method = 'CASH', customer_name = 'Khách lẻ', status = 'COMPLETED', cancellation_reason = null, customer_paid = 0, change_amount = 0 } = req.body;
        const employeeCode = req.user.employee_code;

        console.log('=== CREATE ORDER DEBUG ===');
        console.log('Employee Code:', employeeCode);
        console.log('Items:', JSON.stringify(items, null, 2));
        console.log('Payment Method:', payment_method);
        console.log('Status:', status);
        console.log('Customer Paid:', customer_paid);
        console.log('Change:', change_amount);

        // Validate
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng phải có ít nhất 1 món'
            });
        }

        // Tính toán tổng tiền
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = Math.round(subtotal * 0.08); // 8% thuế
        const total = subtotal + tax;

        console.log('Subtotal:', subtotal);
        console.log('Tax:', tax);
        console.log('Total:', total);

        // Tạo mã đơn hàng
        const orderCode = `DH${Date.now().toString().slice(-8)}`;

        // Tạo order
        console.log('Creating order...');
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                employee_code: employeeCode,
                total_amount: total,
                status: status,
                payment_method: payment_method,
                cancellation_reason: cancellation_reason,
                customer_paid: customer_paid,
                change_amount: change_amount,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (orderError) {
            console.error('Error creating order:', orderError);
            throw orderError;
        }

        console.log('Order created:', order.id);

        // Tạo order_items (chỉ khi không phải đơn hủy, hoặc vẫn tạo để tracking)
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.id,
            product_name_snapshot: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            kitchen_status: status === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
            note: item.note || '',
            created_at: new Date().toISOString()
        }));

        const { data: createdItems, error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)
            .select();

        if (itemsError) {
            console.error('Error creating order items:', itemsError);
            // Rollback: xóa order nếu tạo items thất bại
            await supabase.from('orders').delete().eq('id', order.id);
            throw itemsError;
        }

        return res.status(201).json({
            success: true,
            message: status === 'CANCELLED' ? 'Đã hủy đơn hàng' : 'Tạo đơn hàng thành công',
            data: {
                order_id: order.id,
                order_code: orderCode,
                total_amount: total,
                items_count: createdItems.length,
                status: status,
                cancellation_reason: cancellation_reason,
                created_at: order.created_at
            }
        });

    } catch (err) {
        console.error('Lỗi tạo đơn hàng:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể tạo đơn hàng',
            error: err.message
        });
    }
};

// Lấy danh sách đơn hàng
const getOrders = async (req, res) => {
    try {
        const { limit = 50, status, employee_code } = req.query;
        const requestingUser = req.user;

        console.log('=== GET ORDERS DEBUG ===');
        console.log('Requesting User:', requestingUser.employee_code, requestingUser.role);
        console.log('Query params:', { limit, status, employee_code });

        let query = supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id,
                    product_name_snapshot,
                    quantity,
                    unit_price,
                    kitchen_status,
                    note
                )
            `)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        // Nếu là CASHIER, chỉ xem đơn của mình
        if (requestingUser.role === 'CASHIER') {
            query = query.eq('employee_code', requestingUser.employee_code);
            console.log('CASHIER filter: only show orders from', requestingUser.employee_code);
        }
        // Nếu là ADMIN và có filter employee_code
        else if (employee_code) {
            query = query.eq('employee_code', employee_code);
            console.log('ADMIN filter: show orders from', employee_code);
        }

        // Filter theo status nếu có
        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        console.log('Orders found:', data?.length || 0);

        return res.status(200).json({
            success: true,
            data: data || []
        });

    } catch (err) {
        console.error('Lỗi lấy danh sách đơn hàng:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể tải danh sách đơn hàng',
            error: err.message
        });
    }
};
// Lấy chi tiết đơn hàng
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (orderError || !order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Lấy order_items
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', id);

        if (itemsError) {
            throw itemsError;
        }

        return res.status(200).json({
            success: true,
            data: {
                ...order,
                items: items || []
            }
        });

    } catch (err) {
        console.error('Lỗi lấy chi tiết đơn hàng:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể tải chi tiết đơn hàng',
            error: err.message
        });
    }
};

// Hủy đơn hàng
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellation_reason = 'Không có lý do' } = req.body;
        const requestingUser = req.user;

        console.log('=== CANCEL ORDER DEBUG ===');
        console.log('Order ID:', id);
        console.log('Cancelled by:', requestingUser.employee_code, requestingUser.full_name);
        console.log('Reason:', cancellation_reason);

        // Kiểm tra đơn hàng tồn tại
        const { data: existingOrder, error: checkError } = await supabase
            .from('orders')
            .select('id, status, employee_code, total_amount')
            .eq('id', id)
            .single();

        if (checkError || !existingOrder) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Chỉ cho phép hủy đơn của chính mình (trừ ADMIN)
        if (requestingUser.role === 'CASHIER' && existingOrder.employee_code !== requestingUser.employee_code) {
            return res.status(403).json({
                success: false,
                message: 'Bạn chỉ có thể hủy đơn hàng của chính mình'
            });
        }

        // Không cho hủy đơn đã hủy
        if (existingOrder.status === 'CANCELLED') {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng đã bị hủy trước đó'
            });
        }

        // Cập nhật trạng thái
        const { data, error } = await supabase
            .from('orders')
            .update({
                status: 'CANCELLED',
                cancellation_reason: cancellation_reason,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) {
            throw error;
        }

        // Cập nhật kitchen_status của order_items
        await supabase
            .from('order_items')
            .update({ kitchen_status: 'CANCELLED' })
            .eq('order_id', id);

        console.log('✅ Order cancelled successfully');

        return res.status(200).json({
            success: true,
            message: 'Đã hủy đơn hàng',
            data: data[0]
        });

    } catch (err) {
        console.error('Lỗi hủy đơn hàng:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể hủy đơn hàng',
            error: err.message
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder
};  
