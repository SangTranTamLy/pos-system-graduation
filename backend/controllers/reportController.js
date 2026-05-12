const supabase = require('../config/supabase');

const normalizeDate = (value) => {
    const date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime()) ? new Date() : date;
};

const toDateRange = (value) => {
    const date = normalizeDate(value);
    const from = new Date(date);
    from.setHours(0, 0, 0, 0);
    const to = new Date(date);
    to.setHours(23, 59, 59, 999);
    return {
        from: from.toISOString(),
        to: to.toISOString()
    };
};

const mapOrder = (order) => ({
    id: order.id,
    employee_code: order.employee_code,
    full_name: order.full_name,
    status: order.status,
    subtotal: Number(order.subtotal || 0),
    discount: Number(order.discount || 0),
    tax_amount: Number(order.tax_amount || 0),
    total_amount: Number(order.total_amount || 0),
    created_at: order.created_at
});

const getReportBaseQuery = (date, employeeCode) => {
    const range = toDateRange(date);

    let query = supabase
        .from('orders')
        .select('*')
        .gte('created_at', range.from)
        .lte('created_at', range.to)
        .order('created_at', { ascending: false });

    if (employeeCode) {
        query = query.eq('employee_code', employeeCode);
    }

    return query;
};

const getDashboardSummary = async (req, res) => {
    try {
        const range = toDateRange(req.query.date);

        const { data, error } = await supabase
            .from('orders')
            .select('status, total_amount')
            .gte('created_at', range.from)
            .lte('created_at', range.to);

        if (error) {
            console.error('Error fetching dashboard:', error);
            throw error;
        }

        console.log('Dashboard data:', data);

        const completedOrders = (data || []).filter((order) => 
            order.status && order.status.toUpperCase() === 'COMPLETED'
        );
        const cancelledOrders = (data || []).filter((order) => 
            order.status && order.status.toUpperCase() === 'CANCELLED'
        );

        const revenue = completedOrders.reduce((sum, order) => 
            sum + Number(order.total_amount || 0), 0
        );

        console.log('Summary:', { revenue, completed: completedOrders.length, cancelled: cancelledOrders.length });

        return res.status(200).json({
            success: true,
            data: {
                revenue: revenue,
                completed_orders: completedOrders.length,
                cancelled_orders: cancelledOrders.length
            }
        });
    } catch (err) {
        console.error('Lỗi lấy dashboard summary:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể tải dashboard summary',
            error: err.message
        });
    }
};

const getSalesReports = async (req, res) => {
    try {
        const { date, employee_code } = req.query;
        const { data, error } = await getReportBaseQuery(date, employee_code);

        if (error) {
            console.error('Error fetching sales reports:', error);
            throw error;
        }

        // Lấy thông tin employees
        const employeeCodes = [...new Set((data || []).map(o => o.employee_code))];
        const { data: employees } = await supabase
            .from('employees')
            .select('employee_code, full_name')
            .in('employee_code', employeeCodes);

        const employeesMap = new Map(employees?.map(e => [e.employee_code, e]) || []);

        const orders = (data || []).map((order) => {
            const employee = employeesMap.get(order.employee_code);
            return mapOrder({
                ...order,
                full_name: employee?.full_name || 'N/A'
            });
        });

        return res.status(200).json({
            success: true,
            data: orders
        });
    } catch (err) {
        console.error('Lỗi lấy sales reports:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể tải báo cáo doanh thu',
            error: err.message
        });
    }
};

// Báo cáo chi tiết ca làm việc với danh sách món
const getShiftDetailReport = async (req, res) => {
    try {
        const { date, employee_code, period, start_time, end_time } = req.query;
        
        let startDate, endDate;
        
        // Nếu có start_time và end_time (từ modal drill-down), ưu tiên dùng chúng
        if (start_time && end_time) {
            startDate = new Date(start_time);
            endDate = new Date(end_time);
            console.log('=== SHIFT DETAIL REPORT (DRILL-DOWN) ===');
            console.log('Start:', startDate);
            console.log('End:', endDate);
        } else {
            // Nếu không, dùng logic cũ với period
            const now = new Date();
            
            if (period === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            } else if (period === 'year') {
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            } else {
                const range = toDateRange(date);
                startDate = new Date(range.from);
                endDate = new Date(range.to);
            }
            
            console.log('=== SHIFT DETAIL REPORT ===');
            console.log('Period:', period || 'day');
            console.log('Date range:', startDate, 'to', endDate);
        }
        
        console.log('Employee:', employee_code || 'ALL');

        // Lấy tất cả đơn hàng trong khoảng thời gian
        let ordersQuery = supabase
            .from('orders')
            .select(`
                id,
                employee_code,
                status,
                total_amount,
                created_at,
                order_items (
                    product_name_snapshot,
                    quantity,
                    unit_price
                )
            `)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false });

        if (employee_code) {
            ordersQuery = ordersQuery.eq('employee_code', employee_code);
        }

        const { data: orders, error: ordersError } = await ordersQuery;

        if (ordersError) {
            throw ordersError;
        }

        // Lấy thông tin nhân viên
        const employeeCodes = [...new Set(orders.map(o => o.employee_code))];
        const { data: employees } = await supabase
            .from('employees')
            .select('employee_code, full_name')
            .in('employee_code', employeeCodes);

        const employeesMap = new Map(employees?.map(e => [e.employee_code, e]) || []);

        // Format dữ liệu
        const detailedOrders = orders.map(order => ({
            order_id: order.id,
            order_code: order.id.slice(0, 8).toUpperCase(),
            employee_code: order.employee_code,
            employee_name: employeesMap.get(order.employee_code)?.full_name || 'N/A',
            status: order.status,
            total_amount: Number(order.total_amount || 0),
            created_at: order.created_at,
            items: (order.order_items || []).map(item => ({
                product_name: item.product_name_snapshot,
                quantity: item.quantity,
                price: Number(item.unit_price || 0)
            }))
        }));

        // Tính tổng doanh thu
        const totalRevenue = detailedOrders
            .filter(o => o.status === 'COMPLETED')
            .reduce((sum, o) => sum + o.total_amount, 0);

        const totalOrders = detailedOrders.length;
        const completedOrders = detailedOrders.filter(o => o.status === 'COMPLETED').length;
        const cancelledOrders = detailedOrders.filter(o => o.status === 'CANCELLED').length;

        return res.status(200).json({
            success: true,
            data: {
                orders: detailedOrders,
                summary: {
                    period: period || 'custom',
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    total_orders: totalOrders,
                    completed_orders: completedOrders,
                    cancelled_orders: cancelledOrders,
                    total_revenue: totalRevenue
                }
            }
        });

    } catch (err) {
        console.error('Lỗi lấy shift detail report:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể tải báo cáo chi tiết',
            error: err.message
        });
    }
};

module.exports = {
    getDashboardSummary,
    getSalesReports,
    getShiftDetailReport
};
