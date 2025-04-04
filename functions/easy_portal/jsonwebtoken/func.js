export const signin = async (req, res, next) => {
    const { email, password } = req.body;
  
    try {
      const validUser = await User.findOne({ email });
      if (!validUser) {
        return next(errorHandler(404, "User not Found!"));
      }
      const validPassword = bcryptjs.compareSync(password, validUser.password);
      if (!validPassword) {
        return next(errorHandler(401, "Wrong credential!"));
      }

    } catch (error) {
      next(error);
    }
  };


   // Update the last login time
        // await zcql.executeZCQLQuery(`
        //     UPDATE Signup 
        //     SET lastLogin = NOW() 
        //     WHERE ROWID = ${user[0].ROWID}
        // `);