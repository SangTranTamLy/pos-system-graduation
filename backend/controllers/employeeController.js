const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

const EMPLOYEE_FIELDS = `
    id,
    employee_code,
    full_name,
    role,
    is_active,
    created_at,
    updated_at
`;

const mapEmployee = (employee) => ({
    id: employee.id,
    employee_code: employee.employee_code,
    full_name: employee.full_name,
    role: employee.role,
    is_active: employee.is_active !== false,
    created_at: employee.created_at,
    updated_at: employee.updated_at
});

const generateEmployeeCode = async () => {
    const { data, error } = await supabase
        .from('employees')
        .select('employee_code')
        .like('employee_code', 'NV%');

    if (error) {
        throw error;
    }

    const nextNumber = (Math.max(
        0,
        ...(data || []).map((item) => Number(String(item.employee_code).replace('NV', '')) || 0)
    ) + 1).toString().padStart(3, '0');

    return `NV${nextNumber}`;
};

const listEmployees = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('employees')
            .select(EMPLOYEE_FIELDS)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            data: (data || []).map(mapEmployee)
        });
    } catch (err) {
        console.error('Loi lay danh sach nhan vien:', err);
        return res.status(500).json({
            success: false,
            message: 'Khong the tai danh sach nhan vien'
        });
    }
};

const createEmployee = async (req, res) => {
    try {
        const { full_name, role, password } = req.body;

        if (!full_name || !role) {
            return res.status(400).json({
                success: false,
                message: 'Vui long nhap day du ho ten va vai tro'
            });
        }

        const employee_code = await generateEmployeeCode();
        const temporaryPassword = password?.trim() || `cinox${employee_code.replace('NV', '')}`;
        const password_hash = await bcrypt.hash(temporaryPassword, 10);

        const { data, error } = await supabase
            .from('employees')
            .insert({
                employee_code,
                full_name: full_name.trim(),
                role: role.trim(),
                password_hash,
                is_active: true
            })
            .select(EMPLOYEE_FIELDS)
            .single();

        if (error) {
            throw error;
        }

        return res.status(201).json({
            success: true,
            data: {
                ...mapEmployee(data),
                temporary_password: temporaryPassword
            }
        });
    } catch (err) {
        console.error('Loi tao nhan vien:', err);
        return res.status(500).json({
            success: false,
            message: 'Khong the tao tai khoan nhan vien'
        });
    }
};

const resetEmployeePassword = async (req, res) => {
    try {
        const { employeeCode } = req.params;
        const { password } = req.body;

        const temporaryPassword = password?.trim() || `reset${employeeCode.toLowerCase()}`;
        const password_hash = await bcrypt.hash(temporaryPassword, 10);

        const { data, error } = await supabase
            .from('employees')
            .update({
                password_hash,
                updated_at: new Date().toISOString()
            })
            .eq('employee_code', employeeCode)
            .select(EMPLOYEE_FIELDS)
            .single();

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            data: {
                ...mapEmployee(data),
                temporary_password: temporaryPassword
            }
        });
    } catch (err) {
        console.error('Loi reset mat khau nhan vien:', err);
        return res.status(500).json({
            success: false,
            message: 'Khong the reset mat khau nhan vien'
        });
    }
};

module.exports = {
    listEmployees,
    createEmployee,
    resetEmployeePassword
};
