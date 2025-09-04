# Production Deployment Checklist

## Pre-Deployment
- [ ] Run all tests: `npm run test`
- [ ] Verify all migrations are included in the `supabase/migrations` directory
- [ ] Update version number in `package.json`
- [ ] Update CHANGELOG.md with release notes

## Database
- [ ] Backup production database
- [ ] Run migrations in staging environment
- [ ] Verify data integrity after migrations
- [ ] Test rollback procedure

## Environment Setup
- [ ] Update production environment variables
- [ ] Verify all secrets are properly set
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts

## MFA Configuration
- [ ] Enable MFA in production
- [ ] Test MFA setup flow
- [ ] Test backup code generation
- [ ] Verify MFA enforcement on sensitive routes

## Deployment
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Monitor error logs

## Post-Deployment
- [ ] Verify all features are working
- [ ] Check performance metrics
- [ ] Monitor for any security events
- [ ] Update documentation if needed

## Rollback Plan
1. Revert to previous version
2. Run rollback migrations if needed
3. Restore database from backup if necessary
4. Verify system is in a consistent state

## Monitoring
- [ ] Set up error tracking
- [ ] Monitor authentication logs
- [ ] Track MFA success/failure rates
- [ ] Set up alerts for suspicious activities
