const express = require("express");
const catalystSDK = require("zcatalyst-sdk-node");
const userRouter = require("./routes/user.route");
const orgRouter = require("./routes/organization.route");
const catalystRouter = require("./routes/catalyst.routes");
const leadRouter = require("./routes/lead.routes");
const dealRouter = require("./routes/deal.routes");
const getRouter = require("./routes/get.routes");
const adminRouter = require("./routes/admin.routes");
const relateListRouter = require("./routes/relatedList.route");
const attendanceRouter = require("./routes/attendance.routes");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const registrationRouter = require("./routes/usersRegistration.routes");
const specialRouter = require("./routes/special.routes");
const getsRouter = require("./routes/gets.routes");
const createRouter = require("./routes/create.routes");
const updateRouter = require("./routes/update.routes");
const lookupRouter = require("./routes/lookup.routes");
const metadataRouter = require("./routes/metadata.routes");
const supportRouter = require("./routes/support.routes");
const testRouter = require("./routes/test.routes");
const crmprofileRouter = require("./routes/crmprofile.routes");

const cors = require("cors");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",
  "https://crm.zoho.com",
  "https://easyportal-704392036.development.catalystserverless.com",
  "https://portal.easytocheck.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTION S"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "ALLOWALL"); // OR 'SAMEORIGIN'
  next();
});
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors 'self' https://*.zoho.com"
  );
  next();
});

app.use((req, res, next) => {
  const catalyst = catalystSDK.initialize(req);
  res.locals.catalyst = catalyst;
  next();
});

app.use("/users", userRouter);
app.use("/org", orgRouter);
app.use("/userRegistration", registrationRouter);
app.use("/test", catalystRouter);
app.use("/lead", leadRouter);
app.use("/attendance", attendanceRouter);
app.use("/get", getRouter);
app.use("/related", relateListRouter);
app.use("/admin", adminRouter);
app.use("/special", specialRouter);
app.use("/deal", dealRouter);
app.use("/gets", getsRouter);
app.use("/create", createRouter);
app.use("/update", updateRouter);
app.use("/lookup", lookupRouter);

// Public api

app.use("/getmetadata", metadataRouter);
app.use("/support", supportRouter);

// admin webtab api

app.use("/webtab", testRouter);

// Crm profile api

app.use("/crm", crmprofileRouter);

module.exports = app;

// const express = require('express');
// const helmet = require('helmet');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const rateLimit = require('express-rate-limit');
// const catalystSDK = require('zcatalyst-sdk-node');
// const dotenv = require('dotenv');
// const compression = require('compression');
// const { httpLogger, errorHandler } = require('./middlewares/error-handling.middleware');

// // Routes imports
// const userRouter = require('./routes/user.route');
// const orgRouter = require('./routes/organization.route');
// const catalystRouter = require('./routes/test.routes');
// const leadRouter = require('./routes/lead.routes');
// const getRouter = require('./routes/get.routes');
// const adminRouter = require('./routes/admin.routes');
// const relateListRouter = require('./routes/relatedList.route');
// const attendanceRouter = require('./routes/attendance.routes');
// const registrationRouter = require('./routes/usersRegistration.routes');
// const specialRouter = require('./routes/special.routes');

// // Load environment configurations
// dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

// const app = express();

// // Security Middleware
// app.use(helmet()); // Adds various HTTP headers for security
// app.disable('x-powered-by'); // Hide Express server information

// // Compression for response
// app.use(compression());

// // Logging Middleware
// app.use(httpLogger);

// // Rate Limiting
// const limiter = rateLimit({
//     windowMs: 1 * 60 * 1000, // 15 minutes
//     max: 30, // Limit each IP to 100 requests per windowMs
//     standardHeaders: true, // Return rate limit info in RateLimit-* headers
//     legacyHeaders: false, // Disable X-RateLimit-* headers
//     message: 'Too many requests, please try again later'
// });
// app.use(limiter);

// // Body Parsing Middleware
// app.use(express.json({
//     limit: '5mb', // Limit payload size
//     strict: true // Only accept arrays and objects
// }));
// app.use(express.urlencoded({
//     extended: false,
//     limit: '5mb'
// }));

// // CORS Configuration with Enhanced Security
// const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
//     ? process.env.ALLOWED_ORIGINS.split(',')
//     : ['http://localhost:3000'];

// app.use(cors({
//     origin: function(origin, callback) {
//         // Allow requests with no origin (like mobile apps or curl requests)
//         if (!origin) return callback(null, true);

//         if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
//             const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//             return callback(new Error(msg), false);
//         }
//         return callback(null, true);
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//     optionsSuccessStatus: 200
// }));

// // Cookie Parser
// app.use(cookieParser(process.env.COOKIE_SECRET));

// // Catalyst SDK Middleware
// app.use((req, res, next) => {
//     try {
//         const catalyst = catalystSDK.initialize(req);
//         res.locals.catalyst = catalyst;
//         res.setHeader('X-Frame-Options', 'ALLOW-FROM https://crm.zoho.com');
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// // Route Mounting
// app.use('/users', userRouter);
// app.use('/org', orgRouter);
// app.use('/userRegistration', registrationRouter);
// app.use('/test', catalystRouter);
// app.use('/lead', leadRouter);
// app.use('/attendance', attendanceRouter);
// app.use('/get', getRouter);
// app.use('/related', relateListRouter);
// app.use('/admin', adminRouter);
// app.use('/special',specialRouter);

// // Global Error Handler
// app.use(errorHandler);

// // 404 Handler
// app.use((req, res, next) => {
//     res.status(404).json({
//         status: 'error',
//         message: 'Route not found'
//     });
// });

// module.exports = app;
