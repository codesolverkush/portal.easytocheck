const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600 }); // cache expires in 1 hour

const getOrgDetails = async (userId, zcql) => {
  const cached = cache.get(userId);
  if (cached) {
    return cached;
  }

  const userQuery = `SELECT orgid, domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
  const result = await zcql.executeZCQLQuery(userQuery);
  const data = {
    orgId: result[0]?.usermanagement?.orgid,
    domain: result[0]?.usermanagement?.domain
  };

  cache.set(userId, data);
  return data;
};

module.exports = { getOrgDetails };
