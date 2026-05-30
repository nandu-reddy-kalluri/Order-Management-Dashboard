import db from "@/lib/prismadb";

import { ProductForm } from "./components/product-form";

const ProductPage = async ({
  params
}: {
  params: { productId: string, storeId: string }
}) => {
  let product = null;

  if (params.productId !== 'new') {
    product = await db.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        images: true,
      }
    });
  }

  const categories = await db.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  let sizes = await db.size.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  if (sizes.length === 0) {
    const defaultSize = await db.size.create({
      data: {
        storeId: params.storeId,
        name: "Standard",
        value: "standard",
      }
    });
    sizes = [defaultSize];
  }

  let colors = await db.color.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  if (colors.length === 0) {
    const defaultColor = await db.color.create({
      data: {
        storeId: params.storeId,
        name: "Default",
        value: "#000000",
      }
    });
    colors = [defaultColor];
  }

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm 
          categories={categories} 
          colors={colors}
          sizes={sizes}
          initialData={product}
        />
      </div>
    </div>
  );
}

export default ProductPage;