import db from "@/lib/prismadb";
import { CategoryForm } from "./components/category-form";
const CategoryPage = async ({
    params
}: {
    params: { categoryId: string, storeId: string }
}) => {
    let category = null;

    if (params.categoryId !== 'new') {
      category = await db.category.findUnique({
        where: {
          id: params.categoryId
        }
      });
    }

    let billboards = await db.billboard.findMany({
      where: {
        storeId: params.storeId
      }
    });

    if (billboards.length === 0) {
      const defaultBillboard = await db.billboard.create({
        data: {
          storeId: params.storeId,
          label: "Default Billboard",
          imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
        }
      });
      billboards = [defaultBillboard];
    }



  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm billboards={billboards} initialData={category} />
      </div>
    </div>
  );
}

export default CategoryPage;