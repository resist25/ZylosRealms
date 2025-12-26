# Backend Integration Test

## Quick Test Commands

### 1. Initialize Admin User (First Time Setup)
```bash
# Open your browser console on the app and run:
fetch('https://{YOUR_PROJECT_ID}.supabase.co/functions/v1/make-server-1da7ecad/seed-admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {YOUR_ANON_KEY}'
  }
}).then(r => r.json()).then(console.log)
```

Or simply visit the app and it will be created automatically on first backend call.

### 2. Test Health Check
```bash
curl https://{YOUR_PROJECT_ID}.supabase.co/functions/v1/make-server-1da7ecad/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-26T...",
  "service": "Crystal Realms MMORPG Backend"
}
```

### 3. Test Registration
```bash
curl -X POST https://{YOUR_PROJECT_ID}.supabase.co/functions/v1/make-server-1da7ecad/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {YOUR_ANON_KEY}" \
  -d '{
    "email": "testplayer@crystalrealms.com",
    "password": "test123",
    "username": "TestHero",
    "characterClass": "warrior"
  }'
```

Expected response:
```json
{
  "user": {
    "id": "...",
    "email": "testplayer@crystalrealms.com",
    "username": "TestHero",
    "role": "user",
    "status": "active"
  },
  "token": "...",
  "character": {
    "id": "...",
    "name": "TestHero",
    "class": "warrior",
    "level": 1,
    ...
  }
}
```

### 4. Test Login
```bash
curl -X POST https://{YOUR_PROJECT_ID}.supabase.co/functions/v1/make-server-1da7ecad/auth/login \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {YOUR_ANON_KEY}" \
  -d '{
    "email": "testplayer@crystalrealms.com",
    "password": "test123"
  }'
```

### 5. Test Protected Endpoint (Get Character)
```bash
# Use the token from login response
curl https://{YOUR_PROJECT_ID}.supabase.co/functions/v1/make-server-1da7ecad/character \
  -H "Authorization: Bearer {TOKEN_FROM_LOGIN}"
```

### 6. Test Admin Login
```bash
curl -X POST https://{YOUR_PROJECT_ID}.supabase.co/functions/v1/make-server-1da7ecad/auth/login \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {YOUR_ANON_KEY}" \
  -d '{
    "email": "admin@crystalrealms.com",
    "password": "admin123"
  }'
```

### 7. Test Admin Endpoint (Get All Users)
```bash
# Use admin token
curl https://{YOUR_PROJECT_ID}.supabase.co/functions/v1/make-server-1da7ecad/admin/users \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

---

## Frontend Integration Test

### 1. Register New User
1. Open the app
2. Click "Start Your Journey"
3. Fill in the registration form:
   - Character Name: "DragonSlayer"
   - Email: "player@test.com"
   - Password: "test123"
   - Class: Warrior
4. Click "Create Account"
5. ✅ Should redirect to game and see your character

### 2. Test Game Persistence
1. Start a battle
2. Win the battle
3. **Close the browser tab completely**
4. Reopen the app
5. ✅ Should auto-login and see your updated stats (exp, crypto, etc.)

### 3. Test Quest System
1. Go to Quests tab
2. Complete quest objectives (e.g., win 3 battles)
3. Click "Claim Rewards"
4. ✅ Should receive exp, gold, and crypto
5. ✅ Character level/stats should update
6. ✅ Transaction should appear in wallet

### 4. Test Inventory
1. Win a battle and get loot
2. Go to Inventory tab
3. Equip the new item
4. ✅ Character stats should increase
5. Unequip the item
6. ✅ Character stats should decrease

### 5. Test Admin Panel
1. Logout
2. Login with admin credentials:
   - Email: admin@crystalrealms.com
   - Password: admin123
3. ✅ Should see Admin Panel
4. Check Users tab - should see registered users
5. Check Transactions tab - should see all transactions
6. Check System tab - should see statistics

### 6. Test Multi-Device (Optional)
1. Login on one device/browser
2. Play the game
3. Logout
4. Login on different device/browser with same account
5. ✅ Should see same character with all progress

---

## Troubleshooting

### Issue: 401 Unauthorized
- Check that you're including the Authorization header
- Verify the token is valid (not expired)
- For protected routes, ensure you're logged in

### Issue: 500 Internal Server Error
- Check Supabase Edge Function logs
- Verify environment variables are set
- Check the error message in response

### Issue: No data persisting
- Open browser DevTools → Network tab
- Check if API calls are successful (200 status)
- Verify localStorage has authToken
- Check Supabase logs for errors

### Issue: Can't see admin panel
- Verify you're logged in with admin account
- Check that user.role === "admin"
- Seed admin user if not exists

---

## Success Indicators

✅ **Registration works**: New users can create accounts
✅ **Login works**: Users can login with email/password
✅ **Session persistence**: Auto-login on page refresh
✅ **Combat saves**: Battle results update character stats
✅ **Quests save**: Progress tracks and rewards are given
✅ **Inventory saves**: Items equip/unequip properly
✅ **Transactions log**: All crypto earnings are recorded
✅ **Admin panel works**: Can view users and statistics
✅ **Cross-device**: Can login from multiple devices

---

## What to Expect

### After Registration
- Character is created with level 1
- Starting inventory (Iron Sword, Leather Armor)
- Initial quests assigned
- Can immediately start playing

### After Combat Victory
- Character gains exp, gold, and crypto
- Stats update in real-time
- Quest progress updates
- Transaction is logged
- Random chance for loot drop

### After Quest Completion
- Claim button appears
- Clicking claim gives rewards
- Character may level up
- Crypto balance increases

### In Admin Panel
- See all registered users
- View system statistics
- Monitor all transactions
- Manage user accounts

---

## Database Verification

To verify data is actually persisting, you can:

1. **Supabase Dashboard** → Table Editor → Look for kv_store_1da7ecad table
2. Check for keys like:
   - `user:{userId}`
   - `character:{userId}`
   - `quests:{userId}`
   - `session:{token}`

All game data is stored in the KV store using these prefixed keys!

---

## Performance Notes

- Session tokens are valid for 30 days
- Data is cached in frontend for smooth UX
- Backend calls are made asynchronously
- Auto-save happens after every action

---

**Your MMORPG backend is fully operational!** 🎮🔥

Test it out and watch your progress persist across sessions!
