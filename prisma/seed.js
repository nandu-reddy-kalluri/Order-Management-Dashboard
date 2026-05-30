const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const sampleProducts = [
  // Pickles
  { name: "Tangy Mango Pickle (400g)", price: 5.50, categoryName: "Pickles" },
  { name: "Spicy Garlic Pickle (300g)", price: 6.00, categoryName: "Pickles" },
  { name: "Andhra Avakaya Pickle (500g)", price: 7.50, categoryName: "Pickles" },
  // Snacks
  { name: "Spicy Banana Chips (250g)", price: 4.50, categoryName: "Snacks" },
  { name: "Homemade Murukku (500g)", price: 7.20, categoryName: "Snacks" },
  { name: "Traditional Ribbon Pakoda (250g)", price: 4.20, categoryName: "Snacks" },
  // Sweets
  { name: "Sweet Coconut Ladoo (12 pcs)", price: 9.00, categoryName: "Sweets" },
  { name: "Organic Jaggery Kaju Katli (250g)", price: 12.00, categoryName: "Sweets" },
  { name: "Special Ghee Mysore Pak (400g)", price: 10.50, categoryName: "Sweets" },
  // Podi
  { name: "Spicy Idli Karam Podi (200g)", price: 5.00, categoryName: "Podi" },
  { name: "Traditional Curry Leaf Podi (200g)", price: 4.80, categoryName: "Podi" },
  { name: "Roasted Peanut Podi (250g)", price: 5.50, categoryName: "Podi" },
  // Ghee
  { name: "Pure Desi Cow Ghee (500ml)", price: 14.50, categoryName: "Ghee" },
  { name: "A2 Buffalo Ghee (500ml)", price: 16.00, categoryName: "Ghee" },
  { name: "Aromatic Herb-Infused Ghee (250ml)", price: 8.50, categoryName: "Ghee" }
];

const sampleCustomers = [
  { name: "Amit Sharma", phone: "+91 98765 43210", email: "amit.sharma@example.com", address: "Flat 402, Sunshine Apartments, Sector 15, Dwarka, New Delhi, 110075" },
  { name: "Priya Patel", phone: "+91 87654 32109", email: "priya.patel@example.com", address: "12, Shanti Kunj, Near ISCON Temple, SG Highway, Ahmedabad, Gujarat, 380015" },
  { name: "Rahul Nair", phone: "+91 76543 21098", email: "rahul.nair@example.com", address: "Block B, G-3, Fernwood Residency, Sarjapur Road, Bangalore, Karnataka, 560035" },
  { name: "Sneha Reddy", phone: "+91 65432 10987", email: "sneha.reddy@example.com", address: "House No. 8-2-120, Road No. 3, Banjara Hills, Hyderabad, Telangana, 500034" },
  { name: "Vikram Sen", phone: "+91 95432 18765", email: "vikram.sen@example.com", address: "A-54, Salt Lake City, Sector 2, Kolkata, West Bengal, 700091" },
  { name: "Anjali Gupta", phone: "+91 99887 76655", email: "anjali.gupta@example.com", address: "305, Heights Vista, JVPD Scheme, Vile Parle West, Mumbai, Maharashtra, 400049" },
  { name: "Karthik Raja", phone: "+91 88776 65544", email: "karthik.raja@example.com", address: "24, First Main Road, Gandhi Nagar, Adyar, Chennai, Tamil Nadu, 600020" },
  { name: "Meera Deshmukh", phone: "+91 77665 54433", email: "meera.deshmukh@example.com", address: "45, Woodland Hills, Kothrud, Pune, Maharashtra, 411038" },
  { name: "Rohan Verma", phone: "+91 98123 45678", email: "rohan.verma@example.com", address: "Sector 4, H.No 129, Panchkula, Haryana, 134112" },
  { name: "Divya Krishnan", phone: "+91 94455 66778", email: "divya.k@example.com", address: "5th Cross, Malleshwaram, Bangalore, Karnataka, 560003" },
  { name: "Suresh Kumar", phone: "+91 93821 09876", email: "suresh.k@example.com", address: "H.No 45, Anna Nagar, Chennai, Tamil Nadu, 600040" },
  { name: "Nisha Rao", phone: "+91 91726 35490", email: "nisha.rao@example.com", address: "Flat 101, Oakwood Towers, Gachibowli, Hyderabad, Telangana, 500032" },
  { name: "Aditya Das", phone: "+91 81098 76543", email: "aditya.das@example.com", address: "Salt Lake City, Block CD-12, Kolkata, West Bengal, 700064" },
  { name: "Kiran Mazumdar", phone: "+91 70223 34455", email: "kiran.m@example.com", address: "Koramangala 3rd Block, Circle Road, Bangalore, Karnataka, 560034" },
  { name: "Manish Joshi", phone: "+91 96112 23344", email: "manish.j@example.com", address: "78, Anand Nagar, Indore, Madhya Pradesh, 452001" },
  { name: "Pooja Hegde", phone: "+91 80998 87766", email: "pooja.h@example.com", address: "Bunder Road, H.No 24/8, Mangalore, Karnataka, 575001" },
  { name: "Arjun Mehta", phone: "+91 90088 77665", email: "arjun.mehta@example.com", address: "Gulmohar Road, Juhu Scheme, Mumbai, Maharashtra, 400049" },
  { name: "Deepa Nair", phone: "+91 89012 34567", email: "deepa.nair@example.com", address: "Kowdiar Junction, TC 4/12, Trivandrum, Kerala, 695003" },
  { name: "Harish Rao", phone: "+91 78901 23456", email: "harish.rao@example.com", address: "Vellore Fort Road, H.No 502, Vellore, Tamil Nadu, 632001" },
  { name: "Sandhya Murthy", phone: "+91 67890 12345", email: "sandhya.m@example.com", address: "Bannerghatta Road, H.No 89, Bangalore, Karnataka, 560076" }
];

const statuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - getRandomInt(0, daysAgo));
  date.setHours(getRandomInt(0, 23), getRandomInt(0, 59), getRandomInt(0, 59));
  return date;
}

async function main() {
  console.log("Seeding database...");

  // 1. Get or create default store
  let store = await db.store.findFirst();
  if (!store) {
    console.log("No store found. Creating 'Homemade Delights'...");
    store = await db.store.create({
      data: {
        name: "Homemade Delights",
        userId: "seed_default_user"
      }
    });
  }
  console.log(`Using Store ID: ${store.id}`);

  // 2. Create size and color for the store (required relationships)
  let size = await db.size.findFirst({ where: { storeId: store.id } });
  if (!size) {
    size = await db.size.create({
      data: {
        name: "Standard",
        value: "standard",
        storeId: store.id
      }
    });
  }
  
  let color = await db.color.findFirst({ where: { storeId: store.id } });
  if (!color) {
    color = await db.color.create({
      data: {
        name: "Default",
        value: "#000000",
        storeId: store.id
      }
    });
  }

  // 3. Create default billboard (required relationship for Category)
  let billboard = await db.billboard.findFirst({ where: { storeId: store.id } });
  if (!billboard) {
    billboard = await db.billboard.create({
      data: {
        label: "Homemade Goodness",
        imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=1000",
        storeId: store.id
      }
    });
  }

  // 4. Create categories
  const categoriesMap = {};
  const categoryNames = ["Pickles", "Snacks", "Sweets", "Podi", "Ghee"];
  for (const catName of categoryNames) {
    let category = await db.category.findFirst({
      where: { name: catName, storeId: store.id }
    });
    if (!category) {
      category = await db.category.create({
        data: {
          name: catName,
          billboardId: billboard.id,
          storeId: store.id
        }
      });
    }
    categoriesMap[catName] = category;
  }
  console.log("Categories created/verified.");

  // 5. Create products
  const categoryImages = {
    "Pickles": "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=600",
    "Snacks": "https://images.unsplash.com/photo-1566898835144-a21238f8103a?q=80&w=600",
    "Sweets": "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600",
    "Podi": "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=600",
    "Ghee": "https://images.unsplash.com/photo-1608797178974-15b35a61d121?q=80&w=600"
  };

  const products = [];
  for (const prodData of sampleProducts) {
    let product = await db.product.findFirst({
      where: { name: prodData.name, storeId: store.id }
    });

    if (!product) {
      product = await db.product.create({
        data: {
          name: prodData.name,
          price: prodData.price,
          isFeatured: Math.random() > 0.5,
          isArchived: false,
          categoryId: categoriesMap[prodData.categoryName].id,
          sizeId: size.id,
          colorId: color.id,
          storeId: store.id,
          images: {
            create: {
              url: categoryImages[prodData.categoryName]
            }
          }
        }
      });
      console.log(`Created product: ${product.name}`);
    }
    products.push(product);
  }

  // 6. Generate 30 orders distributed across exactly 20 unique customers
  console.log("Generating 30 sample orders...");
  
  // Clean existing orders to make dashboard display clean, realistic data
  await db.orderItem.deleteMany({ where: { order: { storeId: store.id } } });
  await db.order.deleteMany({ where: { storeId: store.id } });

  // First 20 orders: Ensure each of the 20 customers gets at least 1 order
  for (let i = 0; i < 20; i++) {
    const customer = sampleCustomers[i];
    await createOrderForCustomer(store.id, customer, products, i + 1);
  }

  // Remaining 10 orders: Distribute randomly among the 20 customers to generate repeat orders
  for (let i = 20; i < 30; i++) {
    const customer = getRandomItem(sampleCustomers);
    await createOrderForCustomer(store.id, customer, products, i + 1);
  }

  console.log("Seeding completed successfully!");
}

async function createOrderForCustomer(storeId, customer, products, index) {
  // Determine order items (1 to 3 items)
  const numItems = getRandomInt(1, 3);
  const selectedProducts = [];
  const itemData = [];
  let calculatedTotal = 0;

  // Pick unique products
  while (selectedProducts.length < numItems) {
    const p = getRandomItem(products);
    if (!selectedProducts.find(x => x.id === p.id)) {
      selectedProducts.push(p);
    }
  }

  for (const prod of selectedProducts) {
    const qty = getRandomInt(1, 3);
    calculatedTotal += qty * prod.price;
    
    itemData.push({
      productId: prod.id,
      quantity: qty,
      price: prod.price
    });
  }

  // Set realistic status combinations
  const orderStatus = getRandomItem(statuses);
  let paymentStatus = "Unpaid";
  
  if (orderStatus === "Delivered") {
    paymentStatus = "Paid";
  } else if (orderStatus === "Cancelled") {
    paymentStatus = Math.random() > 0.8 ? "Paid" : "Unpaid";
  } else {
    paymentStatus = Math.random() > 0.4 ? "Paid" : "Unpaid";
  }

  // Generate date periods: 10 today/recent, 10 this week, 10 earlier in the month
  let createdAt;
  if (index <= 10) {
    createdAt = getRandomDate(1); // Today or yesterday
  } else if (index <= 20) {
    createdAt = getRandomDate(7); // Past 7 days
  } else {
    createdAt = getRandomDate(30); // Past 30 days
  }

  await db.order.create({
    data: {
      storeId: storeId,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      address: customer.address,
      totalAmount: calculatedTotal,
      paymentStatus: paymentStatus,
      orderStatus: orderStatus,
      createdAt: createdAt,
      orderItems: {
        createMany: {
          data: itemData
        }
      }
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
