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
