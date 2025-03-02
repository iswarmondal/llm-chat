export const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

export const serviceAccount = JSON.parse(
    process.env.FIREBASE_ADMIN_SDK_CREDENTIALS || "{}"
  );

export const port = 8080;