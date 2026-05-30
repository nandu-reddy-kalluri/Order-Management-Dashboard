"use client";

import { useParams, usePathname } from "next/navigation";
import { cn } from '@/lib/utils';
import Link from "next/link";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {

  const pathName = usePathname();
  const params = useParams();

  const routes = [
    {
      href: `/${params.storeId}`,
      label: "Dashboard",
      active: pathName === `/${params.storeId}`,
    },
    {
      href: `/${params.storeId}/orders`,
      label: "Orders",
      active: pathName === `/${params.storeId}/orders` || pathName.includes(`/${params.storeId}/orders`),
    },
    {
      href: `/${params.storeId}/products`,
      label: "Products",
      active: pathName === `/${params.storeId}/products` || pathName.includes(`/${params.storeId}/products`),
    },
    {
      href: `/${params.storeId}/customers`,
      label: "Customers",
      active: pathName === `/${params.storeId}/customers`,
    },
    {
      href: `/${params.storeId}/reports`,
      label: "Reports",
      active: pathName === `/${params.storeId}/reports`,
    },
    {
      href: `/${params.storeId}/settings`,
      label: "Settings",
      active: pathName === `/${params.storeId}/settings`,
    },
  ];


  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-black dark:text-white" : "text-muted-foreground"
          )}
        >
          {route.label}

        </Link>
      ))}
    </nav>
  )
}
export default MainNav;