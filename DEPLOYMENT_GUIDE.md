# Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Completed Stages
- **Stage 6**: Multiplayer infrastructure (WebSocket, leaderboard, chat)
- **Stage 7**: AI integration with comprehensive fallbacks
- **Stage 8**: Frontend integration (LevelEngine, physics, controls)
- **Stage 9**: Mobile optimization (touch controls, responsive canvas, orientation handling)
- **Stage 10**: Advanced features (achievements, crafting, friends, analytics)

### Environment Setup

#### 1. Node.js & Dependencies
```bash
node --version  # Should be v18+
npm install     # Install all dependencies
npm run build   # Build frontend
```

#### 2. Database Configuration
```bash
# PostgreSQL setup
createdb world_hero_adventures

# Run migrations in order
psql world_hero_adventures < server/db/01-schema.sql
psql world_hero_adventures < server/db/02-seed-worlds.sql
psql world_hero_adventures < server/db/03-levels.sql
psql world_hero_adventures < server/db/04-player-progress.sql
psql world_hero_adventures < server/db/05-jwt-users.sql
psql world_hero_adventures < server/db/06-achievements.sql
psql world_hero_adventures < server/db/07-player-unlocks.sql
psql world_hero_adventures < server/db/08-player-worlds.sql
```

#### 3. Environment Variables
Create `.env` file in project root:
```env
# Frontend
VITE_API_BASE=http://localhost:4000
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Backend
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/world_hero_adventures
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
```

### Local Testing

#### 1. Start Backend
```bash
cd server
npm install
npm start
# Server runs on http://localhost:4000
```

#### 2. Start Frontend (Development)
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

#### 3. Start Frontend (Production Build)
```bash
npm run build
npm run preview
# Serves optimized build
```

### Docker Deployment

#### Build Images
```bash
# Build client image
docker build -f Dockerfile.client -t world-hero-client:latest .

# Build server image
docker build -f server/Dockerfile -t world-hero-server:latest .
```

#### Run with Docker Compose
```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

#### View Logs
```bash
docker-compose logs -f
docker-compose logs -f world-hero-server
```

### Production Checklist

- [ ] PostgreSQL database configured and migrations applied
- [ ] Environment variables set in `.env` and reviewed
- [ ] JWT_SECRET is a strong random string (minimum 32 characters)
- [ ] GEMINI_API_KEY is valid and has proper rate limits
- [ ] Frontend build succeeds without errors
- [ ] All services accessible on correct ports
- [ ] HTTPS/SSL configured (if applicable)
- [ ] Rate limiting enabled (100 requests/hour per user)
- [ ] Error logging configured
- [ ] Analytics service configured (optional)
- [ ] Health check endpoints tested

### Health Check Endpoints

```bash
# Frontend health
curl http://localhost:5173/

# Backend health
curl http://localhost:4000/health

# API status
curl http://localhost:4000/api/v1/health
```

### Performance Optimization

#### Frontend
- [ ] Minification enabled in build
- [ ] Code splitting configured
- [ ] Images optimized
- [ ] Lazy loading enabled for routes

#### Backend
- [ ] Connection pooling configured
- [ ] Caching enabled (Redis optional)
- [ ] Compression enabled
- [ ] Database indexes verified

#### Canvas/Gaming
- [ ] Hardware acceleration enabled
- [ ] PixiJS rendering optimized
- [ ] Texture atlasing configured
- [ ] FPS capped at 60

### Security

- [ ] JWT tokens validated on all protected routes
- [ ] CORS configured correctly
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection enabled
- [ ] Rate limiting enforced
- [ ] Input validation on all endpoints
- [ ] Sensitive data not logged

### Monitoring & Logs

#### Key Metrics
- User count and DAU (daily active users)
- Level completion rates
- AI feature usage (fallback vs. Gemini)
- Server response times
- Error rates

#### Logging
- Server logs: `/var/log/world-hero-server.log`
- Client errors: Sent to analytics service
- Database logs: PostgreSQL slow query log

### Rollback Plan

If issues occur in production:

1. **Quick rollback**
   ```bash
   git revert <commit-hash>
   npm run build
   docker-compose restart
   ```

2. **Database rollback**
   ```bash
   # Don't delete data, only restore schema if needed
   # Use migrations with down() functions
   ```

3. **Immediate actions**
   - Disable AI features (fallbacks will activate)
   - Clear cache if applicable
   - Check database connections
   - Review error logs

### Post-Deployment

1. **Smoke Tests**
   - [ ] Create new player account
   - [ ] Complete Level 1
   - [ ] Test NPC chat
   - [ ] Test crafting
   - [ ] Check achievements
   - [ ] Test mobile controls (if applicable)

2. **Load Testing** (Optional)
   ```bash
   # Use Apache Bench or similar
   ab -n 1000 -c 10 http://localhost:4000/api/v1/worlds
   ```

3. **Monitoring Setup**
   - Monitor CPU, memory, disk usage
   - Monitor database connections
   - Monitor error rates
   - Set up alerts for critical issues

### Scaling Considerations

As player count grows:

1. **Database**: Consider read replicas for leaderboards
2. **Server**: Horizontal scaling with load balancer
3. **Cache**: Redis for sessions and frequently accessed data
4. **CDN**: Serve static assets from CDN
5. **AI Service**: Queue system for level generation requests

### Support & Debugging

#### Common Issues

**Issue**: Players can't log in
- Check JWT_SECRET is set correctly
- Verify database is running
- Check auth middleware logs

**Issue**: AI features not working
- Check GEMINI_API_KEY is valid
- Verify rate limits not exceeded
- Check fallbacks are being used (log output)

**Issue**: Mobile controls not working
- Verify touch events are enabled
- Check canvas container sizing
- Test on actual mobile device

**Issue**: Level generation slow
- Check AI service response times
- Verify database indexes
- Consider caching generated levels

### Maintenance

#### Regular Tasks
- [ ] Review error logs weekly
- [ ] Monitor database size
- [ ] Clean old analytics data (retention: 90 days)
- [ ] Update dependencies monthly
- [ ] Test disaster recovery quarterly

#### Backup Strategy
- [ ] Daily database backups
- [ ] Weekly full system backups
- [ ] Test restore procedures monthly
- [ ] Store backups in geographically separate locations

---

## Support Resources

- **Documentation**: See README.md and API_CONTRACT.md
- **Architecture**: See IMPLEMENTATION_SUMMARY.md
- **Fallback System**: See FALLBACK_IMPLEMENTATION.md
- **Issues**: Check GitHub issues or contact development team

**Deployment Date**: 2025-12-11
**Last Updated**: 2025-12-11
