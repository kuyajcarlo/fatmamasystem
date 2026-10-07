import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyummeftwbyytltkcnty.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY; // set in your shell only, never commit
if (!supabaseKey) { console.error('Set SUPABASE_SECRET_KEY in your environment first.'); process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);

const sampleOrders = [
    { 
        id: 'ORD-123456', 
        user_email: 'maria@example.com', 
        user_name: 'Maria Santos', 
        date: new Date().toISOString(), 
        status: 'pending', 
        total: 358.00, 
        delivery_address: '123 Main St, Manila', 
        items: [{ id: 'a01', name: 'Tapsilog', price: 179, quantity: 2 }] 
    },
    { 
        id: 'ORD-654321', 
        user_email: 'juan@example.com', 
        user_name: 'Juan Dela Cruz', 
        date: new Date(Date.now() - 86400000).toISOString(), 
        status: 'delivered', 
        total: 858.00, 
        delivery_address: '456 Elm St, Quezon City', 
        items: [{ id: 'b05', name: 'Blueberry Cheesecake', price: 429, quantity: 2 }] 
    }
];

const sampleInquiries = [
    { 
        id: 'INQ-111111', 
        name: 'Ana Reyes', 
        email: 'ana@example.com', 
        subject: 'Catering for Wedding', 
        message: 'Do you offer catering for 50 pax?', 
        date: new Date().toISOString(), 
        status: 'new' 
    },
    { 
        id: 'INQ-222222', 
        name: 'Mark Lim', 
        email: 'mark@example.com', 
        subject: 'Opening Hours', 
        message: 'What time do you open on Sundays?', 
        date: new Date(Date.now() - 172800000).toISOString(), 
        status: 'replied' 
    }
];

const sampleCakeRequests = [
    { 
        id: 'CDR-999999', 
        user_email: 'sarah@example.com', 
        user_name: 'Sarah Lee', 
        date: new Date().toISOString(), 
        status: 'pending', 
        occasion: 'Birthday', 
        flavor: 'Chocolate', 
        size: '8 inch', 
        message: 'Happy 7th Birthday', 
        reference_image: null, 
        special_instructions: 'Less sugar please', 
        price: null, 
        admin_notes: null 
    }
];

const sampleStaff = [
    { 
        id: 'STAFF-001', 
        name: 'Jane (Staff)', 
        email: 'staff@fatmama.ph', 
        password: 'staff123', 
        status: 'active', 
        created_at: new Date().toISOString() 
    }
];

async function seed() {
    console.log("Seeding Orders...");
    const { error: oErr } = await supabase.from('orders').upsert(sampleOrders);
    if (oErr) console.error(oErr); else console.log("Orders seeded!");

    console.log("Seeding Inquiries...");
    const { error: iErr } = await supabase.from('inquiries').upsert(sampleInquiries);
    if (iErr) console.error(iErr); else console.log("Inquiries seeded!");

    console.log("Seeding Cake Requests...");
    const { error: cErr } = await supabase.from('cake_requests').upsert(sampleCakeRequests);
    if (cErr) console.error(cErr); else console.log("Cake requests seeded!");

    console.log("Seeding Staff Accounts...");
    const { error: sErr } = await supabase.from('staff_accounts').upsert(sampleStaff);
    if (sErr) console.error(sErr); else console.log("Staff accounts seeded!");
}

seed();
