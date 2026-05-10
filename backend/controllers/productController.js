const supabase = require('../config/supabase');

const PRODUCT_FIELDS = `
    id,
    name,
    category_id,
    price,
    image_url,
    is_available,
    created_at,
    categories (
        id,
        name
    )
`;

const mapProduct = (product) => ({
    id: product.id,
    name: product.name,
    category_id: product.category_id || product.categories?.id || null,
    category_name: product.categories?.name || 'Chua phan loai',
    price: Number(product.price || 0),
    image_url: product.image_url || '',
    is_available: product.is_available !== false,
    created_at: product.created_at
});

const getProducts = async (req, res) => {
    try {
        const includeUnavailable = req.query.include_unavailable === 'true' && req.user?.role === 'ADMIN';

        let query = supabase
            .from('products')
            .select(PRODUCT_FIELDS)
            .order('created_at', { ascending: false })
            .order('name', { ascending: true });

        if (!includeUnavailable) {
            query = query.eq('is_available', true);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            data: (data || []).map(mapProduct)
        });
    } catch (err) {
        console.error('Loi lay danh sach san pham:', err);
        return res.status(500).json({
            success: false,
            message: 'Khong the lay danh sach san pham'
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, category_id, price, image_url, is_available } = req.body;

        if (!name || !category_id || !price) {
            return res.status(400).json({
                success: false,
                message: 'Vui long nhap day du ten mon, danh muc va gia ban'
            });
        }

        const payload = {
            name: String(name).trim(),
            category_id,
            price: Number(price),
            image_url: image_url?.trim() || '',
            is_available: is_available !== false
        };

        const { data, error } = await supabase
            .from('products')
            .insert(payload)
            .select(PRODUCT_FIELDS)
            .single();

        if (error) {
            throw error;
        }

        return res.status(201).json({
            success: true,
            data: mapProduct(data)
        });
    } catch (err) {
        console.error('Loi tao san pham:', err);
        return res.status(500).json({
            success: false,
            message: 'Khong the tao san pham moi'
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category_id, price, image_url, is_available } = req.body;

        const payload = {
            updated_at: new Date().toISOString()
        };

        if (name !== undefined) payload.name = String(name).trim();
        if (category_id !== undefined) payload.category_id = category_id;
        if (price !== undefined) payload.price = Number(price);
        if (image_url !== undefined) payload.image_url = image_url?.trim() || '';
        if (is_available !== undefined) payload.is_available = Boolean(is_available);

        const { data, error } = await supabase
            .from('products')
            .update(payload)
            .eq('id', id)
            .select(PRODUCT_FIELDS)
            .single();

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            data: mapProduct(data)
        });
    } catch (err) {
        console.error('Loi cap nhat san pham:', err);
        return res.status(500).json({
            success: false,
            message: 'Khong the cap nhat san pham'
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: 'Da xoa san pham'
        });
    } catch (err) {
        console.error('Loi xoa san pham:', err);
        return res.status(500).json({
            success: false,
            message: 'Khong the xoa san pham'
        });
    }
};

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
