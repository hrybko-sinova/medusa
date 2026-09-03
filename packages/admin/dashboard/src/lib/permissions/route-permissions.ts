import type { Permission } from "./types"

// Use API policy resource names, shared by navigation and direct URL access.
const routePermissions: Record<string, Permission> = {
  "/products": "product:read",
  "/product-options": "product_option:read",
  "/collections": "product_collection:read",
  "/categories": "product_category:read",
  "/orders": "order:read",
  "/customers": "customer:read",
  "/customer-groups": "customer_group:read",
  "/inventory": "inventory_item:read",
  "/reservations": "reservation_item:read",
  "/promotions": "promotion:read",
  "/campaigns": "campaign:read",
  "/price-lists": "price_list:read",
  "/settings/store": "store:read",
  "/settings/users": "user:read",
  "/settings/roles": "rbac_role:read",
  "/settings/policies": "rbac_policy:read",
  "/settings/regions": "region:read",
  "/settings/tax-regions": "tax_region:read",
  "/settings/return-reasons": "return_reason:read",
  "/settings/refund-reasons": "refund_reason:read",
  "/settings/sales-channels": "sales_channel:read",
  "/settings/product-types": "product_type:read",
  "/settings/product-tags": "product_tag:read",
  "/settings/locations/shipping-profiles": "shipping_profile:read",
  "/settings/locations/shipping-option-types": "shipping_option_type:read",
  "/settings/locations": "stock_location:read",
  "/settings/publishable-api-keys": "api_key:read",
  "/settings/secret-api-keys": "api_key:read",
  "/settings/workflows": "workflow_execution:read",
  "/settings/translations": "translation:read",
}

export function getRoutePermission(pathname: string): Permission | undefined {
  const path = pathname.split(/[?#]/)[0]
  return Object.entries(routePermissions)
    .sort(([a], [b]) => b.length - a.length)
    .find(([route]) => path === route || path.startsWith(`${route}/`))?.[1]
}

export function canAccessRoute(
  pathname: string,
  hasPermission: (permission: Permission) => boolean
) {
  const permission = getRoutePermission(pathname)
  return !permission || hasPermission(permission)
}
