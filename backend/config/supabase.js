const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Phải dùng createClient để khởi tạo
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase; // Xuất trực tiếp biến supabas