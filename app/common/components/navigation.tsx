import { Link } from "react-router";
import { Separator } from "./ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { cn } from "~/lib/utils";

const menus = [
  {
    name: "Products",
    to: "/products",
    items: [
      {
        name: "Products list",
        description: "See the top performers in your community",
        to: "/products/list",
      },
      {
        name: "Stocks Keeping",
        description: "See the top categories in your community",
        to: "/products/stocks-keeping",
      },
      {
        name: "Submit Products",
        description: "Promote a product to our community",
        to: "/products/submit",
      },
    ],
  },
  {
    name: "Order & Delivery",
    to: "/orders",
    items: [
      {
        name: "Order list",
        description: "See the top categories in your community",
        to: "/orders/list",
      },
      {
        name: "Returns",
        description: "See the top categories in your community",
        to: "/orders/returns",
      },
    ],
  },
  {
    name: "Seller Information",
    to: "/seller",
    items: [
      {
        name: "Delivery Address",
        description: "See the top categories in your community",
        to: "/seller/address",
      },
    ],
  },
  {
    name: "System",
    to: "systems",
    items: [
      {
        name: "Domains",
        description: "도메인 관리",
        to: "/system/domains",
      },
      {
        name: "Categories",
        description: "카테고리 관리",
        to: "/system/categories",
      },
      {
        name: "Common Codes",
        description: "공통코드 관리",
        to: "/system/commonCodes",
      },
      {
        name: "System Options",
        description: "시스템 옵션 관리",
        to: "/system/systemOptions",
      },
    ],
  },
];

export default function Navigation() {
  return (
    <nav className="flex px-20 h-16 items-center justify-between backdrop-blur fixed top-0 left-0 right-0 z-50 bg-background/50">
      <div className="flex items-center">
        <Link to="/" className="font-bold tracking-tighter text-lg">
          kend seller
        </Link>
        <Separator orientation="vertical" className="h-6 mx-4" />
        <NavigationMenu>
          <NavigationMenuList>
            {menus.map((menu) => (
              <NavigationMenuItem key={menu.name}>
                {menu.items ? (
                  <>
                    <Link to={menu.to}>
                      <NavigationMenuTrigger>{menu.name}</NavigationMenuTrigger>
                    </Link>
                    <NavigationMenuContent>
                      <ul className="grid w-[600px] font-light gap-3 p-4 grid-cols-2">
                        {menu.items?.map((item) => (
                          <NavigationMenuItem
                            key={item.name}
                            className={cn([
                              "select-none rounded-md transition-colors focus:bg-accent  hover:bg-accent",
                              item.to === "/products/submit" &&
                                "col-span-2 bg-primary/10 hover:bg-primary/20 focus:bg-primary/20",
                            ])}
                          >
                            <NavigationMenuLink asChild>
                              <Link
                                className="p-3 space-y-1 block leading-none no-underline outline-none"
                                to={item.to}
                              >
                                <span className="text-sm font-medium leading-none">
                                  {item.name}
                                </span>
                                <p className="text-sm leading-snug text-muted-foreground">
                                  {item.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <Link className={navigationMenuTriggerStyle()} to={menu.to}>
                    {menu.name}
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}
