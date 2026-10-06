# Auth-Gated App Testing Playbook (Emergent Google Auth)

## Step 1: Create test user & session (email must be allow-listed: ADMIN_EMAILS env or db.team_members)
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({user_id: userId, email: 'aidahsandyaulia05@gmail.com', name: 'Test Admin', picture: '', created_at: new Date()});
db.user_sessions.insertOne({user_id: userId, session_token: sessionToken, expires_at: new Date(Date.now()+7*24*60*60*1000), created_at: new Date()});
print('Session token: ' + sessionToken);
"
(For a field-role user: db.team_members.insertOne({email:'test.field@example.com'}) and create user/session with that email.)
NOTE: if a users doc with that email already exists, reuse its user_id instead of inserting a duplicate.

## Step 2: Backend
curl -H "Authorization: Bearer TOKEN" $URL/api/auth/me
curl -H "Authorization: Bearer TOKEN" -F coral_id=RF-02481 -F health=Healthy -F survival=Active -F growth_pct=20 -F date=2026-10-06 -F files=@photo.jpg $URL/api/monitoring

## Step 3: Browser
await page.context.add_cookies([{"name":"session_token","value":"TOKEN","domain":"coral-grow.preview.emergentagent.com","path":"/","httpOnly":True,"secure":True,"sameSite":"None"}])
await page.goto(URL + "/field")

## Cleanup
db.users.deleteMany({name:'Test Admin'}); db.user_sessions.deleteMany({session_token:/test_session/}); db.monitoring.deleteMany({note:/TEST_/})
