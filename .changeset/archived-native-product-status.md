---
"@medusajs/utils": patch
"@medusajs/types": patch
"@medusajs/product": patch
"@medusajs/core-flows": patch
"@medusajs/medusa": patch
"@medusajs/dashboard": patch
"@medusajs/js-sdk": patch
---

Add `archived` as a native product status.

Archived products remain in the admin catalog, are excluded from the Store API, and cannot be purchased. Restore returns them to `draft`.
