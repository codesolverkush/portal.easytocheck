const { executeZohoRequest } = require("../utils/authUtils");
const { getAccessToken } = require("../utils/zohoUtils");

const updateData = async (req, res) => {
  try {
    const userId = req.currentUser?.user_id;
    const { module } = req.params;

    // check for access control
    const accessScore = req.userDetails[0].usermanagement?.[module];
    const crmuserid = req.userDetails[0]?.usermanagement?.crmuserid;
    const domain = req.userDetails[0]?.usermanagement?.domain;
    const orgId = req.userDetails[0]?.usermanagement?.orgid;

    // if (accessScore < 2) {
    //   return res
    //     .status(403)
    //     .json({
    //       success: false,
    //       message: `Insufficient access rights to update a ${module}`,
    //     });
    // }

    if (!userId) {
      return res
        .status(404)
        .json({ success: false, message: "User ID not found." });
    }

    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    if (!orgId) {
      return res
        .status(404)
        .json({ success: false, message: "Organization ID not found." });
    }

    const list = [
      "approval",
      "workflow",
      "blueprint",
      "pathfinder",
      "orchestration",
    ];

    const moduleData = {
      data: [{ ...req.body, easyportal__Client_User: crmuserid }],
      trigger: list,
    };

    let token = await getAccessToken(orgId, req, res);
    const url = `https://www.zohoapis.${domain}/crm/v7/${module}`;

    try {
      const data = await executeZohoRequest(
        url,
        "put",
        moduleData,
        token,
        req,
        res
      );
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          error: error.response ? error.response.data : error.message,
        });
    }
  } catch (error) {
    if (!res.headersSent) {
      return res
        .status(500)
        .json({
          success: false,
          error: error.response ? error.response.data : error.message,
        });
    }
  }
};

module.exports = { updateData };
