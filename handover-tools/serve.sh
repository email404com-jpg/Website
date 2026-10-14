#!/bin/bash
# restart the production server on :3100
if [ -f /tmp/claude-0/server.pid ]; then kill "$(cat /tmp/claude-0/server.pid)" 2>/dev/null; sleep 1; fi
fuser -k 3100/tcp 2>/dev/null
cd /home/claude/site-src
export JN_DATABASE_URL=file:/tmp/claude-0/data/app.db JN_AUTH_SECRET=devsecretdevsecretdevsecret123456 JN_AUTH_URL=http://127.0.0.1:3100 JN_COINS_API_URL="http://127.0.0.1:3200/api/v1/economy/G/users/{discordId}/balance" JN_COINS_API_KEY=testkey JN_LINK_API_KEY=linkkey
setsid nohup ./node_modules/.bin/next start -p 3100 > /tmp/claude-0/start.log 2>&1 &
echo $! > /tmp/claude-0/server.pid
for i in $(seq 1 30); do sleep 1; c=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3100/); [ "$c" = "200" ] && echo "up after ${i}s" && exit 0; done
echo "server did not come up"; tail -20 /tmp/claude-0/start.log; exit 1
