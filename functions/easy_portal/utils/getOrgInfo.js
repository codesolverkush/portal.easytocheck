// utils/getOrgInfo.js
const getOrgInfo = async (userId, catalyst) => {
    if (!userId) {
      throw new Error("User ID not found.");
    }
  
    const zcql = catalyst.zcql();
    const userQuery = `SELECT orgid, domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
    const result = await zcql.executeZCQLQuery(userQuery);
  
    const orgId = result[0]?.usermanagement?.orgid;
    const domain = result[0]?.usermanagement?.domain;
  
    if (!orgId) {
      throw new Error("Organization ID not found.");
    }
  
    return { orgId, domain };
  };
  
  module.exports = getOrgInfo;
  