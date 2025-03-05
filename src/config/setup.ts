import Joi from "joi";

const envSchema = Joi.object({
  NODE_ENV: Joi.alternatives(["production", "development"]).required(),
  PORT: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_PORT: Joi.string().required(),
  DB_DIALECT: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
  BCRYPT_SOLT: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_AUTHORIZED_REDIRECT_URI: Joi.string().required(),
  CLIENT_URI: Joi.string().required(),
  SESSION_SECRET: Joi.string().required(),
}).unknown(true);

function setup() {
  const { error } = envSchema.validate(process.env, { abortEarly: false });
  if (error) {
    console.error("Invalid environment variables:", error.details.map((e) => e.message).join(", "));
    process.exit(1); // Exit the application if validation fails
  }
}
export default setup;
