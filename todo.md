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
