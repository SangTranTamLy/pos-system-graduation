const supabase = require('../config/supabase');

// Lấy ca hiện tại của nhân viên
const getCurrentShift = async (req, res) => {
    try {
        const employeeCode = req.user.employee_code;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        console.log('=== GET CURRENT SHIFT ===');
        console.log('Employee:', employeeCode);
        console.log('Date:', today);

        // Tìm ca OPEN của nhân viên hôm nay
        const { data: shift, error } = await supabase
            .from('shifts')
            .select('*')
            .eq('employee_code', employeeCode)
            .eq('shift_date', today)
            .eq('status', 'OPEN')
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
            throw error;
        }

        // Nếu có ca OPEN, tính toán doanh thu hiện tại
        if (shift) {
            const { data: orders } = await supabase
                .from('orders')
                .select('total_amount, status')
                .eq('employee_code', employeeCode)
                .gte('created_at', shift.opened_at)
                .neq('status', 'CANCELLED');

            const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
            const totalOrders = orders?.length || 0;
            const expectedCash = Number(shift.opening_cash) + totalRevenue;

            return res.status(200).json({
                success: true,
                data: {
                    ...shift,
                    total_revenue: totalRevenue,
                    total_orders: totalOrders,
                    expected_cash: expectedCash
                }
            });
        }

        // Không có ca OPEN
        return res.status(200).json({
            success: true,
            data: null
        });

    } catch (err) {
        console.error('Lỗi lấy ca hiện tại:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể tải thông tin ca làm việc',
            error: err.message
        });
    }
};

// Mở ca mới
const openShift = async (req, res) => {
    try {
        const employeeCode = req.user.employee_code;
        const { opening_cash = 0, notes = '' } = req.body;
        const today = new Date().toISOString().split('T')[0];

        console.log('=== OPEN SHIFT ===');
        console.log('Employee:', employeeCode);
        console.log('Opening Cash:', opening_cash);

        // Check xem đã có ca OPEN chưa
        const { data: existingShift } = await supabase
            .from('shifts')
            .select('id')
            .eq('employee_code', employeeCode)
            .eq('shift_date', today)
            .eq('status', 'OPEN')
            .single();

        if (existingShift) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã mở ca rồi. Vui lòng đóng ca trước khi mở ca mới.'
            });
        }

        // Tạo ca mới
        const { data: shift, error } = await supabase
            .from('shifts')
            .insert({
                employee_code: employeeCode,
                shift_date: today,
                opening_cash: opening_cash,
                status: 'OPEN',
                notes: notes,
                opened_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        console.log('✅ Shift opened:', shift.id);

        return res.status(201).json({
            success: true,
            message: 'Đã mở ca thành công',
            data: shift
        });

    } catch (err) {
        console.error('Lỗi mở ca:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể mở ca làm việc',
            error: err.message
        });
    }
};

// Đóng ca
const closeShift = async (req, res) => {
    try {
        const employeeCode = req.user.employee_code;
        const { closing_cash, notes = '' } = req.body;
        const today = new Date().toISOString().split('T')[0];

        console.log('=== CLOSE SHIFT ===');
        console.log('Employee:', employeeCode);
        console.log('Closing Cash:', closing_cash);

        // Validate
        if (closing_cash === undefined || closing_cash === null) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập số tiền thực tế trong két'
            });
        }

        // Tìm ca OPEN
        const { data: shift, error: findError } = await supabase
            .from('shifts')
            .select('*')
            .eq('employee_code', employeeCode)
            .eq('shift_date', today)
            .eq('status', 'OPEN')
            .single();

        if (findError || !shift) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy ca đang mở'
            });
        }

        // Tính toán doanh thu
        const { data: orders } = await supabase
            .from('orders')
            .select('total_amount, status')
            .eq('employee_code', employeeCode)
            .gte('created_at', shift.opened_at)
            .neq('status', 'CANCELLED');

        const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
        const totalOrders = orders?.length || 0;
        const expectedCash = Number(shift.opening_cash) + totalRevenue;
        const cashDifference = Number(closing_cash) - expectedCash;

        // Cập nhật ca
        const { data: closedShift, error: updateError } = await supabase
            .from('shifts')
            .update({
                closing_cash: closing_cash,
                expected_cash: expectedCash,
                cash_difference: cashDifference,
                total_orders: totalOrders,
                total_revenue: totalRevenue,
                status: 'CLOSED',
                closed_at: new Date().toISOString(),
                notes: notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', shift.id)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        console.log('✅ Shift closed:', closedShift.id);

        return res.status(200).json({
            success: true,
            message: 'Đã đóng ca thành công',
            data: closedShift
        });

    } catch (err) {
        console.error('Lỗi đóng ca:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể đóng ca làm việc',
            error: err.message
        });
    }
};

// Lấy lịch sử các ca
const getShiftHistory = async (req, res) => {
    try {
        const employeeCode = req.user.employee_code;
        const { limit = 10 } = req.query;

        const { data: shifts, error } = await supabase
            .from('shifts')
            .select('*')
            .eq('employee_code', employeeCode)
            .order('shift_date', { ascending: false })
            .order('opened_at', { ascending: false })
            .limit(parseInt(limit));

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            data: shifts || []
        });

    } catch (err) {
        console.error('Lỗi lấy lịch sử ca:', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể tải lịch sử ca làm việc',
            error: err.message
        });
    }
};

// Admin: Lấy tất cả báo cáo ca
const getAllShifts = async (req, res) => {
    try {
        const { date, employee_code, status } = req.query;

        console.log('=== GET ALL SHIFTS (ADMIN) ===');
        console.log('Query params:', { date, employee_code, status });
        console.log('User:', req.user?.employee_code, req.user?.role);

        let query = supabase
            .from('shifts')
            .select('*')
            .order('shift_date', { ascending: false })
            .order('opened_at', { ascending: false });

        // Filter by date
        if (date) {
            query = query.eq('shift_date', date);
        }

        // Filter by employee
        if (employee_code) {
            query = query.eq('employee_code', employee_code);
        }

        // Filter by status
        if (status) {
            query = query.eq('status', status);
        }

        const { data: shifts, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('Found shifts:', shifts?.length || 0);

        // Lấy thông tin nhân viên
        const employeeCodes = [...new Set(shifts.map(s => s.employee_code))];
        console.log('Employee codes:', employeeCodes);

        const { data: employees } = await supabase
            .from('employees')
            .select('employee_code, full_name')
            .in('employee_code', employeeCodes);

        console.log('Found employees:', employees?.length || 0);

        const employeesMap = new Map(employees?.map(e => [e.employee_code, e]) || []);

        // Gắn tên nhân viên vào shifts
        const shiftsWithNames = shifts.map(shift => ({
            ...shift,
            employee_name: employeesMap.get(shift.employee_code)?.full_name || 'N/A'
        }));

        console.log('Returning shifts with names:', shiftsWithNames.length);

        return res.status(200).json({
            success: true,
            data: shiftsWithNames || []
        });

    } catch (err) {
        console.error('Lỗi lấy tất cả ca (Admin):', err);
        return res.status(500).json({
            success: false,
            message: 'Không thể tải báo cáo ca',
            error: err.message
        });
    }
};

module.exports = {
    getCurrentShift,
    openShift,
    closeShift,
    getShiftHistory,
    getAllShifts
};
