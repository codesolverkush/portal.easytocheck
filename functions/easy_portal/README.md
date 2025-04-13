# Easy Portal API

## Secure Caching System

This application uses a secure in-memory caching system to improve performance and reduce database load while maintaining security.

### Security Features

1. **Encryption for Sensitive Data**: All sensitive data is encrypted before being stored in the cache.
2. **Automatic Detection**: The system automatically detects and encrypts sensitive data based on field names.
3. **Shorter Expiration for Sensitive Data**: Sensitive data has a shorter cache expiration time (15 minutes).
4. **Security Headers**: All responses include security headers to protect against common web vulnerabilities.

### Setup

1. Set a secure encryption key in your environment variables:
   ```
   ENCRYPTION_KEY=your-secure-encryption-key-min-32-chars
   ```
   
   If not set, a random key will be generated, but this will change on server restart.

2. Install the required dependencies:
   ```
   npm install
   ```

### How It Works

The secure caching system works as follows:

1. When a user makes a request, the system first checks if their details are in the in-memory cache.
2. If found, it decrypts the data if necessary and uses it.
3. If not found, it queries the database, encrypts sensitive data if needed, and stores it in the cache.
4. The cache expires after a configurable time (1 hour for non-sensitive data, 15 minutes for sensitive data).

### Cache Invalidation

When user permissions change, you should invalidate their cache to ensure they get the updated permissions on their next request.

Example usage:

```javascript
const { invalidateUserCache } = require('./utils/cacheUtils');

// After updating user permissions
await invalidateUserCache(userId);
```

### Security Considerations

- **Encryption Key**: Keep your encryption key secure and never commit it to version control.
- **Environment Variables**: Use environment variables for all sensitive configuration.
- **Regular Updates**: Keep all dependencies updated to protect against known vulnerabilities.
- **Monitoring**: Monitor your application for unusual activity that might indicate a security breach.

### Benefits

- Reduced database load
- Faster response times
- Better scalability
- Improved user experience
- Enhanced security for sensitive data

### Limitations

- In-memory cache is not shared between multiple server instances
- Cache is cleared when the server restarts
- Memory usage increases with the number of cached items

### Troubleshooting

If you encounter issues with the caching system:

1. Check that your encryption key is properly set
2. Monitor memory usage to ensure it doesn't exceed available resources
3. If the server restarts, the cache will be cleared and will need to be rebuilt
4. For multi-instance deployments, consider implementing a distributed caching solution 