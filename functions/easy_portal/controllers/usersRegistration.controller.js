const userRegistration = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userId = req?.decodedId;
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    if (userId) {
      const checkDomainQuery = ` 
                    SELECT ROWID 
                    FROM Userstable 
                    WHERE email = '${email}' 
                    LIMIT 1
                `;

      const existingUsers = await zcql.executeZCQLQuery(checkDomainQuery);

      if (existingUsers && existingUsers.length > 0) {
        return res.status(400).send({
          status: "failure",
          message: "Email already exists. Please choose a different email.",
        });
      }

      const selectOrgQuery = `
                    SELECT orgId FROM Superadmin WHERE ROWID = '${userId}'
                `;

      const data = await zcql.executeZCQLQuery(selectOrgQuery);

      //     const insertOrgQuery = `
      //     INSERT INTO Organization (email, password, userId, orgId)
      //     VALUES ('${email}', '${password}', '${userId}', '${orgId}')
      // `;
      // await zcql
      //     .executeZCQLQuery(insertOrgQuery);

      res.status(200).send({
        success: true,
        message: "User created successfully!",
        data: data,
      });
    } else {
      res.status(500).send({
        success: true,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { userRegistration };
