const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300 }); // cache expires in 5 mins

const getOrgDetails = async (userId, zcql) => {
  const cached = cache.get(userId);
  if (cached) {
    console.log("You get cached!")
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
