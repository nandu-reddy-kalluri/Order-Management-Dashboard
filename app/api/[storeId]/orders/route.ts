import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth(); // Optional, storefront might create orders anonymously
    const body = await req.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      items, // array of { productId, quantity }
      productIds, // fallback array of ids (quantity = 1)
      paymentStatus = "Unpaid",
      orderStatus = "Pending"
    } = body;

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // Parse items to create
    let orderItemsToCreate = [];
    let totalAmount = 0;

    if (items && Array.isArray(items) && items.length > 0) {
      // Find prices for products
      const dbProducts = await prismadb.product.findMany({
        where: {
          id: {
            in: items.map(item => item.productId)
          }
        }
      });

      for (const item of items) {
        const product = dbProducts.find(p => p.id === item.productId);
        if (!product) {
          return new NextResponse(`Product with ID ${item.productId} not found`, { status: 400 });
        }
        const qty = item.quantity || 1;
        totalAmount += product.price * qty;
        orderItemsToCreate.push({
          productId: product.id,
          quantity: qty,
          price: product.price
        });
      }
    } else if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      const dbProducts = await prismadb.product.findMany({
        where: {
          id: {
            in: productIds
          }
        }
      });

      for (const pId of productIds) {
        const product = dbProducts.find(p => p.id === pId);
        if (!product) {
          return new NextResponse(`Product with ID ${pId} not found`, { status: 400 });
        }
        totalAmount += product.price;
        orderItemsToCreate.push({
          productId: product.id,
          quantity: 1,
          price: product.price
        });
      }
    } else {
      return new NextResponse("Products or items are required", { status: 400 });
    }

    const order = await prismadb.order.create({
      data: {
        storeId: params.storeId,
        customerName: customerName || "Anonymous",
        customerPhone: customerPhone || "",
        customerEmail: customerEmail || "",
        address: address || "",
        totalAmount,
        paymentStatus,
        orderStatus,
        orderItems: {
          createMany: {
            data: orderItemsToCreate
          }
        }
      },
      include: {
        orderItems: true
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log('[ORDERS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const orderStatus = searchParams.get('orderStatus') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;

    const orders = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
        orderStatus,
        paymentStatus
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.log('[ORDERS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
