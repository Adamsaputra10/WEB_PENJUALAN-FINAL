import { createClient } from '@supabase/supabase-js';
import { Product, Order, CartItem, ShippingDetails, Courier, PaymentMethod } from '../types';
import { INITIAL_PRODUCTS, COURIER_OPTIONS } from '../data/products';

export const SUPABASE_URL = 'https://fkbftsgkegjzgzsjidnw.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_IvHpl_8SPOwinnH08gIesw_8bktQHKd';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function parseImageSrc(raw: any): string | null {
  if (!raw) return null;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Pure Base64 support
  if (trimmed.length > 20 && !trimmed.includes(' ')) {
    if (trimmed.startsWith('/9j/')) {
      return `data:image/jpeg;base64,${trimmed}`;
    }
    if (trimmed.startsWith('iVBORw0KGgo')) {
      return `data:image/png;base64,${trimmed}`;
    }
    if (trimmed.startsWith('R0lGOD')) {
      return `data:image/gif;base64,${trimmed}`;
    }
    if (trimmed.startsWith('UklGR')) {
      return `data:image/webp;base64,${trimmed}`;
    }
    return `data:image/png;base64,${trimmed}`;
  }

  return trimmed;
}

// Helper to map DB product row to application Product interface
function mapRowToProduct(row: any): Product {
  let images: string[] = [];

  // Read directly from row.image column first (BUKAN image_url)
  if (row.image) {
    const parsed = parseImageSrc(row.image);
    if (parsed) {
      images = [parsed];
    }
  }

  // Fallback to row.images if row.image is empty
  if (images.length === 0 && Array.isArray(row.images) && row.images.length > 0) {
    const parsedList = row.images.map(parseImageSrc).filter(Boolean) as string[];
    if (parsedList.length > 0) images = parsedList;
  } else if (images.length === 0 && typeof row.images === 'string' && row.images.trim()) {
    try {
      const parsedArr = JSON.parse(row.images);
      if (Array.isArray(parsedArr) && parsedArr.length > 0) {
        const parsedList = parsedArr.map(parseImageSrc).filter(Boolean) as string[];
        if (parsedList.length > 0) images = parsedList;
      }
    } catch {
      const parsed = parseImageSrc(row.images);
      if (parsed) images = [parsed];
    }
  }

  // Neutral SVG placeholder if no image exists (no coffee cup fallback)
  if (images.length === 0) {
    images = [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="%231d1e30"/><text x="50%" y="50%" fill="%23ffb68d" font-family="monospace" font-size="14" text-anchor="middle">NO IMAGE</text></svg>'
    ];
  }

  let specs = [];
  if (Array.isArray(row.specs) && row.specs.length > 0) {
    specs = row.specs;
  } else if (typeof row.specs === 'string') {
    try {
      specs = JSON.parse(row.specs);
    } catch {
      /* ignore */
    }
  }

  let reviews = [];
  if (Array.isArray(row.reviews) && row.reviews.length > 0) {
    reviews = row.reviews;
  } else if (typeof row.reviews === 'string') {
    try {
      reviews = JSON.parse(row.reviews);
    } catch {
      /* ignore */
    }
  }

  // Prioritize name_id for Indonesian product name
  const rawNameId = row.name_id || row.nameId;
  const rawName = row.name;

  const displayNameId = (rawNameId && String(rawNameId).trim())
    || (rawName && String(rawName).trim())
    || 'Retro Product';

  const displayName = (rawName && String(rawName).trim())
    || displayNameId;

  return {
    id: String(row.id),
    sku: row.sku || `POS-${row.id}`,
    name: displayName,
    nameId: displayNameId,
    filename: row.filename || `${displayName.toLowerCase().replace(/\s+/g, '_')}.dat`,
    price: Number(row.price ?? 0),
    category: row.category || 'MERCH',
    condition: row.condition || 'FRESH MADE',
    stock: Number(row.stock ?? 0),
    rating: Number(row.rating ?? 5),
    reviewCount: Number(row.review_count ?? row.reviewCount ?? reviews.length ?? 0),
    description: row.description || '',
    descriptionId: row.description_id || row.descriptionId || row.description || '',
    images,
    specs,
    reviews,
    featured: Boolean(row.featured ?? false),
  };
}

/**
 * Fetch live products from Supabase 'products' table.
 */
export async function fetchLiveProducts(retries = 2): Promise<Product[]> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
      if (error) {
        if (attempt < retries) {
          await new Promise((res) => setTimeout(res, 600 * (attempt + 1)));
          continue;
        }
        console.warn('[Supabase] Could not fetch products:', error.message || error);
        return [];
      }
      if (!data || data.length === 0) {
        return [];
      }
      return data.map(mapRowToProduct);
    } catch (err: any) {
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, 600 * (attempt + 1)));
        continue;
      }
      console.warn('[Supabase] Network exception fetching products:', err?.message || err);
      return [];
    }
  }
  return [];
}

/**
 * Save order and order_items to Supabase, then automatically deduct product stock in Supabase.
 */
export async function saveOrderToSupabase(order: Order): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Insert into orders table
    const orderRow = {
      id: order.id,
      order_number: order.id,
      customer_name: order.shipping.fullName,
      customer_phone: order.shipping.phone,
      customer_address: `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.zipCode} (${order.shipping.email})`,
      total_payment: order.total,
      status: order.status,
      payment_method: order.paymentMethod,
      courier: order.courier.name,
      shipping_fee: order.shippingFee,
      tracking_number: order.trackingNumber,
      created_at: new Date().toISOString()
    };

    const { error: orderError } = await supabase.from('orders').insert([orderRow]);
    if (orderError) {
      console.error('[Supabase] Orders insert error:', orderError.message);
    }

    // 2. Insert into order_items table
    if (order.items && order.items.length > 0) {
      const orderItemsRows = order.items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsRows);
      if (itemsError) {
        console.error('[Supabase] Order items insert error:', itemsError.message);
      }
    }

    // 3. Automatically deduct stock in 'products' table in Supabase (1 kali persis, stok_baru = stok_sekarang - item.quantity)
    const productQtyMap: { [productId: string]: { qty: number; initialStock: number } } = {};
    for (const item of order.items) {
      const pid = String(item.product.id);
      if (!productQtyMap[pid]) {
        productQtyMap[pid] = { qty: 0, initialStock: item.product.stock };
      }
      productQtyMap[pid].qty += item.quantity;
    }

    for (const [productId, { qty, initialStock }] of Object.entries(productQtyMap)) {
      try {
        const { data: currentProduct } = await supabase
          .from('products')
          .select('stock')
          .eq('id', productId)
          .single();

        const currentStock = currentProduct && currentProduct.stock !== null && currentProduct.stock !== undefined
          ? Number(currentProduct.stock)
          : initialStock;

        // Formula: stok_baru = stok_sekarang - item.quantity
        const updatedStock = Math.max(0, currentStock - qty);

        const { error: stockErr } = await supabase
          .from('products')
          .update({ stock: updatedStock })
          .eq('id', productId);

        if (stockErr) {
          console.error(`[Supabase] Error updating stock for product ${productId}:`, stockErr.message);
        }
      } catch (err) {
        console.error(`[Supabase] Failed stock deduction for item ${productId}:`, err);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Save order failed:', err);
    return { success: false, error: err?.message || 'Transaction failed' };
  }
}

/**
 * Fetch live orders from Supabase 'orders' and 'order_items' tables.
 */
export async function fetchLiveOrders(retries = 2): Promise<Order[]> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersErr) {
        if (attempt < retries) {
          await new Promise((res) => setTimeout(res, 600 * (attempt + 1)));
          continue;
        }
        console.warn('[Supabase] Could not fetch orders:', ordersErr.message || ordersErr);
        return [];
      }

      if (!ordersData || ordersData.length === 0) {
        return [];
      }

      const { data: itemsData } = await supabase.from('order_items').select('*');
      const { data: productsData } = await supabase.from('products').select('*');

    const mappedOrders: Order[] = ordersData.map((o: any) => {
      const matchingItems = (itemsData || []).filter((it: any) => String(it.order_id) === String(o.id));

      const items: CartItem[] = matchingItems.map((it: any) => {
        const prodMatch = (productsData || []).find((p: any) => String(p.id) === String(it.product_id));

        if (prodMatch) {
          const mappedProd = mapRowToProduct(prodMatch);
          return {
            product: {
              ...mappedProd,
              price: Number(it.price ?? mappedProd.price)
            },
            quantity: Number(it.quantity || 1)
          };
        }

        const itemName = it.name || 'Retro Product';
        return {
          product: {
            id: String(it.product_id || 'prod-001'),
            sku: `POS-${it.product_id || '001'}`,
            name: itemName,
            nameId: itemName,
            filename: `${itemName.toLowerCase().replace(/\s+/g, '_')}.dat`,
            price: Number(it.price ?? 0),
            category: 'MERCH',
            condition: 'FRESH MADE',
            stock: 0,
            rating: 5,
            reviewCount: 1,
            description: '',
            descriptionId: '',
            images: [
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="%231d1e30"/><text x="50%" y="50%" fill="%23ffb68d" font-family="monospace" font-size="14" text-anchor="middle">NO IMAGE</text></svg>'
            ],
            specs: [],
            reviews: []
          },
          quantity: Number(it.quantity || 1)
        };
      });

      // Parse courier matching
      const courierMatch = COURIER_OPTIONS.find((c) => c.name === o.courier) || COURIER_OPTIONS[0];

      return {
        id: String(o.id),
        date: o.created_at ? o.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        items: items.length > 0 ? items : [],
        shipping: {
          fullName: o.customer_name || 'Customer',
          email: 'customer@retroshop.net',
          phone: o.customer_phone || '555-0199',
          address: o.customer_address || 'Retro Street',
          city: 'Neo Tokyo',
          zipCode: '90210'
        },
        courier: courierMatch,
        paymentMethod: (o.payment_method || 'QRIS') as PaymentMethod,
        subtotal: Number(o.total_payment ? o.total_payment - (o.shipping_fee || 0) : 0),
        shippingFee: Number(o.shipping_fee || 0),
        discount: 0,
        total: Number(o.total_payment || 0),
        status: (o.status || 'ORDER PLACED') as Order['status'],
        trackingNumber: o.tracking_number || `RES-${o.id}`
      };
    });

    return mappedOrders;
    } catch (err: any) {
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, 600 * (attempt + 1)));
        continue;
      }
      console.warn('[Supabase] Exception fetching live orders:', err?.message || err);
      return [];
    }
  }
  return [];
}
