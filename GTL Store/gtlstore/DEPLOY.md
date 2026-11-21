# GTL Store Deployment Guide

## Firebase Functions Deployment

This project includes a server-side Paystack verification function in `cloud-functions-notifications.js`.

### 1. Install Firebase CLI
If you do not already have the Firebase CLI installed:

```bash
npm install -g firebase-tools
```

### 2. Log in to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Functions (if not already initialized)

If this repository does not already contain a `functions/` folder, run:

```bash
firebase init functions
```

Choose JavaScript and accept the defaults. If you already have functions setup, skip this step.

### 4. Set Paystack secrets securely

Use Firebase Functions config to store your Paystack secret keys.

```bash
firebase functions:config:set paystack.secret="sk_live_YOUR_SECRET_KEY"
firebase functions:config:set paystack.webhook_secret="YOUR_WEBHOOK_SECRET"
```

If you prefer environment variables, ensure `PAYSTACK_SECRET` and `PAYSTACK_WEBHOOK_SECRET` are available to your deploy environment.

### 5. Deploy the functions

```bash
firebase deploy --only functions
```

### 6. Configure Paystack webhook

If you want webhook updates, configure Paystack to send events to the function endpoint:

```text
https://us-central1-YOUR_PROJECT.cloudfunctions.net/paystackWebhook
```

The function expects the Paystack webhook secret value under `paystack.webhook_secret`.

For Firebase config, set both keys with:

```bash
firebase functions:config:set paystack.secret="sk_live_YOUR_SECRET_KEY" paystack.webhook_secret="YOUR_WEBHOOK_SECRET"
```

If you use environment variables instead of config, make sure the `PAYSTACK_SECRET` and `PAYSTACK_WEBHOOK_SECRET` values are present in your deploy environment.

### 7. Test the flow

1. Add products to the cart in the frontend.
2. Go to `checkout.html`.
3. Complete the checkout form and confirm Paystack opens.
4. Use Paystack test card details first if you're testing before going live.

### Notes

- The client uses `checkout.html` with `httpsCallable(functions, 'verifyPaystack')` to verify the final transaction server-side.
- Do not expose `sk_live_...` in frontend code.
- If you need to test locally, use the Firebase emulator suite and set config values for local functions.

### Useful commands

```bash
firebase functions:config:get
firebase functions:config:set paystack.secret="sk_live_..."
firebase deploy --only functions
```
