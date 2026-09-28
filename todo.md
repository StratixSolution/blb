# Bean Leaf Brew - Todo

## Backlog

### Abandoned Cart Recovery
Capture customer email + cart contents when someone reaches checkout but does not complete payment.
Send a recovery email after 1-2 hours with a link to resume.
Steps needed:
- Store partial checkout sessions in DB (email, cart JSON, timestamp)
- Cron/scheduled job to send recovery emails after N hours
- Unsubscribe link in recovery email
- Admin view of abandoned carts with conversion stats

### Cronjob to send callback notifications after sometime

### Status check with delivery partner to update status and send mail to customer for order delivery confirmation

### Campaigns for offers and discounts - send mail / whatsapp notifications to customers

### Subscription model

### Razorpay Pending Payment Status Check
Status check for pending orders for which payment are not done with Razorpay - sync abandoned Razorpay orders and update their status accordingly.

### Customer Order Tracking Page
Customers currently have no way to check their own order status without contacting BLB.
Build a self-serve tracking page where customers can look up their order by order number or email.

### GST Invoice Generation
Customers (especially B2B buyers) expect a downloadable GST invoice per order.
Generate a PDF invoice with order details, GSTIN, HSN/SAC codes, and tax breakup.
Should be accessible from the order confirmation email and optionally from the customer tracking page.

### Cancellation and Refund Policy
What happens when BLB is not able to fulfill orders and manually transitions order to cancel state, do you offer refund?
