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
    order_code: order.order_code,
    employee_code: order.employee_code,
    full_name: order.full_name,
    status: order.order_status,
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
        .select(`
            id,
            order_code,
            order_status,
            subtotal,
            discount,
            tax_amount,
            total_amount,
            created_at,
            employees!inner (
                employee_code,
                full_name
            )
        `)
        .gte('created_at', range.from)
        .lte('created_at', range.to)
        .order('created_at', { ascending: false });

    if (employeeCode) {
        query = query.eq('employees.employee_code', employeeCode);
    }

    return query;
};

const getDashboardSummary = async (req, res) => {
    try {
        const range = toDateRange(req.query.date);

        const { data, error } = await supabase
            .from('orders')
            .select('order_status,total_amount')
            .gte('created_at', range.from)
            .lte('created_at', range.to);

        if (error) {
            throw error;
        }

        const completedOrders = (data || []).filter((order) => order.order_status === 'completed');
        const cancelledOrders = (data || []).filter((order) => order.order_status === 'cancelled');

        return res.status(200).json({
            success: true,
            data: {
                revenue: completedOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
                completed_orders: completedOrders.length,
                cancelled_orders: cancelledOrders.length
            }
        });
    } catch (err) {
        console.error('Loi lay dashboard summary:', err);
        return res.status(500).json({
            success: false,
            message: 'Khong the tai dashboard summary'
        });
    }
};

const getSalesReports = async (req, res) => {
    try {
        const { date, employee_code } = req.query;
        const { data, error } = await getReportBaseQuery(date, employee_code);

        if (error) {
            throw error;
        }

        const orders = (data || []).map((order) => mapOrder({
            ...order,
            employee_code: order.employees?.employee_code,
            full_name: order.employees?.full_name
        }));

        return res.status(200).json({
            success: true,
            data: orders
        });
    } catch (err) {
        console.error('Loi lay sales reports:', err);
        return res.status(500).json({
            success: false,
            message: 'Khong the tai bao cao doanh thu'
        });
    }
};

module.exports = {
    getDashboardSummary,
    getSalesReports
};
