const supabase = require('../config/supabase');

const getCategories = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id,name,created_at')
            .order('name', { ascending: true });

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            data: data || []
        });
    } catch (err) {
        console.error('Loi lay danh muc:', err);
        return res.status(500).json({
            success: false,
            message: 'Khong the tai danh muc'
        });
    }
};

module.exports = { getCategories };
