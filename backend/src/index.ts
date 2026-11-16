export { Router } from "express";
export { default as bcrypt } from "bcrypt";
export { default as jwt } from "jsonwebtoken";
export { Prisma, prisma } from "./lib/prisma.js";
export { default as admin } from "./middleware/admin.js";
export { default as auth } from "./middleware/auth.js";
export type { AuthRequest } from "./middleware/auth.js";
export { createCategorySchema } from "./schemas/category.schema.js";
export { default as cloudinary } from "./config/cloudinary.js";

export {
  createLibraryItemSchema,
  updateLibraryItemSchema,
} from "./schemas/library-item.schema.js";

export { updateProfileSchema } from "./schemas/profile.schema.js";

export {
  forgotPasswordSchema,
  loginUserSchema,
  registerUserSchema,
  resetPasswordSchema,
} from "./schemas/user.schema.js";

export {
  getAvailabilityHistory,
  type AvailabilityChartPeriod,
} from "./services/availabilityHistory.service.js";

export { sendPasswordResetEmail } from "./services/email.service.js";

export {
  borrowLibraryItem,
  returnLibraryItem,
  getUserLoans,
  getRecentLoans,
} from "./services/loan.service.js";

export {
  createPasswordResetToken,
  hashPasswordResetToken,
} from "./services/password-reset.service.js";

export {
  createSession,
  rotateSession,
  revokeSession,
} from "./services/session.service.js";

export { default as usersRouter } from "./routes/users.routes.js";
export { default as authRouter } from "./routes/auth.routes.js";
export { default as categoriesRouter } from "./routes/categories.routes.js";
export { default as libraryItemsRouter } from "./routes/library-items.routes.js";
export { default as uploadRouter } from "./routes/upload.routes.js";
export { default as dashboardRouter } from "./routes/dashboard.routes.js";
export { default as loansRouter } from "./routes/loans.routes.js";
export { default as profileRouter } from "./routes/profile.routes.js";
