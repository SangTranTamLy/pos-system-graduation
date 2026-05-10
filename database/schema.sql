create extension if not exists pgcrypto;

create table if not exists categories (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null unique,
    created_at timestamptz not null default now()
);

create table if not exists employees (
    id uuid primary key default gen_random_uuid(),
    employee_code text not null unique,
    full_name text not null,
    role text not null,
    password_hash text not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid references categories(id) on delete set null,
    name varchar(255) not null,
    price numeric(12,2) not null default 0,
    image_url text,
    is_available boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    order_code text not null unique,
    employee_id uuid not null references employees(id) on delete restrict,
    counter_no text default 'Quay 01',
    customer_name text default 'Khach le',
    order_status text not null default 'pending',
    subtotal numeric(12,2) not null default 0,
    discount numeric(12,2) not null default 0,
    tax_amount numeric(12,2) not null default 0,
    total_amount numeric(12,2) not null default 0,
    payment_method text default 'cash',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references orders(id) on delete cascade,
    product_id uuid references products(id) on delete set null,
    product_name_snapshot text not null,
    quantity integer not null default 1,
    unit_price numeric(12,2) not null default 0,
    note text default '',
    kitchen_status text not null default 'pending',
    created_at timestamptz not null default now()
);

insert into categories (id, name) values
    ('c1000000-0000-0000-0000-000000000001', 'Đồ ăn chính'),
    ('c3000000-0000-0000-0000-000000000003', 'Đồ uống')
on conflict (id) do nothing;

insert into employees (employee_code, full_name, role, password_hash)
values
    ('ADMIN', 'Nguyen Quan Tri', 'ADMIN', '$2b$10$cvWeOuR3j2ThwKsu61Xzb.lEeyUmXEm//1q5kmq.c8HQvqiJXOuK.'),
    ('NV001', 'Tran Minh Anh', 'Cashier', '$2b$10$y.CqZo4tHmDKxtd27hMPO.5qmvy4AyeoJE.yWfOcbskBaMr6zJZT2'),
    ('NV002', 'Le Hoang Vu', 'Cashier', '$2b$10$xEEI3oAAKVIeHtPADueXZ.GCKOpo33TQ/nU5mccJxEKwofTemGY.K'),
    ('NV003', 'Pham Gia Han', 'Supervisor', '$2b$10$6pC7aZ3vV2An1ihCksWpX.I9XUtOdLDGf8j0vpz55PRO6SysMSNXK')
on conflict (employee_code) do nothing;

insert into products (category_id, name, price, image_url, is_available)
values
    ('c1000000-0000-0000-0000-000000000001', 'Combo Gà Rán 2 Miếng', 75000, 'https://placehold.co/400x300?text=Ga+Ran', true),
    ('c3000000-0000-0000-0000-000000000003', 'Nước Ngọt Coca Cola', 20000, 'https://placehold.co/400x300?text=Coca', true)
on conflict do nothing;

insert into orders (order_code, employee_id, counter_no, customer_name, order_status, subtotal, discount, tax_amount, total_amount, payment_method, created_at)
values
    (
        'DH1001',
        (select id from employees where employee_code = 'NV001'),
        'Quay 01',
        'Khach le',
        'completed',
        95000,
        0,
        7600,
        102600,
        'cash',
        now()
    ),
    (
        'DH1002',
        (select id from employees where employee_code = 'NV002'),
        'Quay 02',
        'Khach le',
        'pending',
        40000,
        0,
        3200,
        43200,
        'cash',
        now()
    )
on conflict (order_code) do nothing;

insert into order_items (order_id, product_id, product_name_snapshot, quantity, unit_price, kitchen_status)
values
    (
        (select id from orders where order_code = 'DH1001'),
        (select id from products where name = 'Combo Gà Rán 2 Miếng'),
        'Combo Gà Rán 2 Miếng',
        1,
        75000,
        'ready'
    ),
    (
        (select id from orders where order_code = 'DH1002'),
        (select id from products where name = 'Nước Ngọt Coca Cola'),
        'Nước Ngọt Coca Cola',
        2,
        20000,
        'pending'
    )
on conflict do nothing;
